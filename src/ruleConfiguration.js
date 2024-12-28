const vscode = require('vscode');

class RuleConfiguration {
    constructor() {
        this.configSection = 'nexonode';
        this.defaultRules = {
            autoApprove: ['format', 'lint'],
            requireApproval: ['delete', 'refactor'],
            blocked: ['rm -rf', 'sudo'],
            integrations: {
                enabled: ['github', 'slack'],
                webhookUrls: {}
            }
        };
    }

    async showConfigurationUI() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const options = [
            'Manage Auto-Approved Commands',
            'Manage Commands Requiring Approval',
            'Manage Blocked Commands',
            'Configure External Integrations',
            'Reset to Defaults'
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select configuration to modify'
        });

        if (!selection) return;

        switch (selection) {
            case options[0]:
                await this.configureAutoApproved();
                break;
            case options[1]:
                await this.configureRequireApproval();
                break;
            case options[2]:
                await this.configureBlocked();
                break;
            case options[3]:
                await this.configureIntegrations();
                break;
            case options[4]:
                await this.resetToDefaults();
                break;
        }
    }

    async configureAutoApproved() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const currentCommands = config.get('autoApprove') || this.defaultRules.autoApprove;

        const result = await this.showCommandEditor(
            'Auto-Approved Commands',
            currentCommands,
            'Commands that will be executed without confirmation'
        );

        if (result) {
            await config.update('autoApprove', result, vscode.ConfigurationTarget.Global);
        }
    }

    async configureRequireApproval() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const currentCommands = config.get('requireApproval') || this.defaultRules.requireApproval;

        const result = await this.showCommandEditor(
            'Commands Requiring Approval',
            currentCommands,
            'Commands that require explicit approval before execution'
        );

        if (result) {
            await config.update('requireApproval', result, vscode.ConfigurationTarget.Global);
        }
    }

    async configureBlocked() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const currentCommands = config.get('blocked') || this.defaultRules.blocked;

        const result = await this.showCommandEditor(
            'Blocked Commands',
            currentCommands,
            'Commands that will never be executed'
        );

        if (result) {
            await config.update('blocked', result, vscode.ConfigurationTarget.Global);
        }
    }

    async configureIntegrations() {
        const config = vscode.workspace.getConfiguration(this.configSection);
        const currentIntegrations = config.get('integrations') || this.defaultRules.integrations;

        const options = [
            'Enable/Disable Integrations',
            'Configure Webhook URLs'
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select integration configuration'
        });

        if (!selection) return;

        if (selection === options[0]) {
            await this.configureEnabledIntegrations(currentIntegrations);
        } else {
            await this.configureWebhookUrls(currentIntegrations);
        }
    }

    async configureEnabledIntegrations(currentIntegrations) {
        const availableIntegrations = ['github', 'slack', 'jira', 'jenkins'];
        const enabledIntegrations = currentIntegrations.enabled || [];

        const selected = await vscode.window.showQuickPick(availableIntegrations, {
            placeHolder: 'Select integrations to enable',
            canPickMany: true,
            selected: enabledIntegrations
        });

        if (selected) {
            const config = vscode.workspace.getConfiguration(this.configSection);
            await config.update('integrations.enabled', selected, vscode.ConfigurationTarget.Global);
        }
    }

    async configureWebhookUrls(currentIntegrations) {
        const enabledIntegrations = currentIntegrations.enabled || [];
        const webhookUrls = currentIntegrations.webhookUrls || {};

        for (const integration of enabledIntegrations) {
            const url = await vscode.window.showInputBox({
                prompt: `Enter webhook URL for ${integration}`,
                value: webhookUrls[integration] || '',
                password: true
            });

            if (url !== undefined) {
                const config = vscode.workspace.getConfiguration(this.configSection);
                await config.update(
                    `integrations.webhookUrls.${integration}`,
                    url,
                    vscode.ConfigurationTarget.Global
                );
            }
        }
    }

    async showCommandEditor(title, currentCommands, description) {
        const commandString = await vscode.window.showInputBox({
            prompt: `${title} (comma-separated)`,
            value: currentCommands.join(', '),
            placeHolder: description
        });

        if (commandString === undefined) return null;

        return commandString
            .split(',')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);
    }

    async resetToDefaults() {
        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to reset all settings to defaults?',
            'Yes',
            'No'
        );

        if (confirm === 'Yes') {
            const config = vscode.workspace.getConfiguration(this.configSection);
            await config.update('autoApprove', this.defaultRules.autoApprove, vscode.ConfigurationTarget.Global);
            await config.update('requireApproval', this.defaultRules.requireApproval, vscode.ConfigurationTarget.Global);
            await config.update('blocked', this.defaultRules.blocked, vscode.ConfigurationTarget.Global);
            await config.update('integrations', this.defaultRules.integrations, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Settings have been reset to defaults');
        }
    }
}

module.exports = RuleConfiguration;
