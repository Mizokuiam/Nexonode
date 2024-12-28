const vscode = require('vscode');
const fetch = require('node-fetch');

class ExternalIntegrations {
    constructor() {
        this.config = vscode.workspace.getConfiguration('nexonode');
        this.integrations = {
            github: new GitHubIntegration(),
            slack: new SlackIntegration(),
            jira: new JiraIntegration(),
            jenkins: new JenkinsIntegration()
        };
    }

    async initialize() {
        const enabledIntegrations = this.config.get('integrations.enabled') || [];
        for (const integration of enabledIntegrations) {
            if (this.integrations[integration]) {
                await this.integrations[integration].initialize(this.config);
            }
        }
    }

    async notifyAll(message, context) {
        const enabledIntegrations = this.config.get('integrations.enabled') || [];
        const promises = enabledIntegrations.map(async (integration) => {
            if (this.integrations[integration]) {
                try {
                    await this.integrations[integration].notify(message, context);
                } catch (error) {
                    console.error(`Error notifying ${integration}:`, error);
                }
            }
        });

        await Promise.all(promises);
    }

    getEnabledIntegrations() {
        return this.config.get('integrations.enabled') || [];
    }
}

class BaseIntegration {
    constructor() {
        this.webhookUrl = '';
    }

    async initialize(config) {
        const webhookUrls = config.get('integrations.webhookUrls') || {};
        this.webhookUrl = webhookUrls[this.name] || '';
    }

    async notify(message, context) {
        if (!this.webhookUrl) {
            throw new Error(`No webhook URL configured for ${this.name}`);
        }

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formatMessage(message, context))
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`${this.name} notification error:`, error);
            throw error;
        }
    }

    formatMessage(message, context) {
        throw new Error('formatMessage must be implemented by child class');
    }
}

class GitHubIntegration extends BaseIntegration {
    constructor() {
        super();
        this.name = 'github';
    }

    formatMessage(message, context) {
        return {
            text: message,
            context: {
                repo: context.repo,
                branch: context.branch,
                commit: context.commit
            }
        };
    }

    async createIssue(title, body) {
        // Implementation for creating GitHub issues
        // This would use the GitHub API
    }

    async createPullRequest(title, branch, description) {
        // Implementation for creating pull requests
        // This would use the GitHub API
    }
}

class SlackIntegration extends BaseIntegration {
    constructor() {
        super();
        this.name = 'slack';
    }

    formatMessage(message, context) {
        return {
            text: message,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `*Workspace:* ${context.workspace || 'N/A'}`
                        }
                    ]
                }
            ]
        };
    }
}

class JiraIntegration extends BaseIntegration {
    constructor() {
        super();
        this.name = 'jira';
    }

    formatMessage(message, context) {
        return {
            text: message,
            issue: context.issueKey,
            project: context.projectKey
        };
    }

    async createIssue(summary, description, issueType) {
        // Implementation for creating Jira issues
        // This would use the Jira API
    }

    async updateIssueStatus(issueKey, status) {
        // Implementation for updating Jira issue status
        // This would use the Jira API
    }
}

class JenkinsIntegration extends BaseIntegration {
    constructor() {
        super();
        this.name = 'jenkins';
    }

    formatMessage(message, context) {
        return {
            text: message,
            job: context.jobName,
            build: context.buildNumber
        };
    }

    async triggerBuild(jobName, parameters) {
        // Implementation for triggering Jenkins builds
        // This would use the Jenkins API
    }

    async getBuildStatus(jobName, buildNumber) {
        // Implementation for getting Jenkins build status
        // This would use the Jenkins API
    }
}

module.exports = {
    ExternalIntegrations,
    GitHubIntegration,
    SlackIntegration,
    JiraIntegration,
    JenkinsIntegration
};
