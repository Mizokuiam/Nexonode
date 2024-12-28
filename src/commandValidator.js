const vscode = require('vscode');

class CommandValidator {
    constructor() {
        this.riskLevels = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high'
        };

        this.commandPatterns = {
            format: { risk: 'low', pattern: /^format|prettier|beautify/i },
            lint: { risk: 'low', pattern: /^lint|eslint|tslint/i },
            refactor: { risk: 'medium', pattern: /^refactor|rename|move/i },
            delete: { risk: 'high', pattern: /^delete|remove|clean/i },
            git: { risk: 'medium', pattern: /^git|commit|push|pull/i },
            install: { risk: 'high', pattern: /^install|npm|yarn/i }
        };
    }

    async validateCommand(command, context) {
        const risk = this.assessRisk(command);
        const validation = {
            isValid: true,
            risk,
            requiresApproval: risk !== this.riskLevels.LOW,
            warnings: [],
            blockers: []
        };

        // Check command syntax
        if (!this.isValidSyntax(command)) {
            validation.blockers.push('Invalid command syntax');
            validation.isValid = false;
        }

        // Check current context
        const contextIssues = await this.validateContext(command, context);
        validation.warnings.push(...contextIssues.warnings);
        validation.blockers.push(...contextIssues.blockers);

        if (validation.blockers.length > 0) {
            validation.isValid = false;
        }

        return validation;
    }

    assessRisk(command) {
        for (const [cmdType, info] of Object.entries(this.commandPatterns)) {
            if (info.pattern.test(command)) {
                return info.risk;
            }
        }
        return this.riskLevels.MEDIUM; // Default to medium risk for unknown commands
    }

    isValidSyntax(command) {
        // Basic syntax validation
        return command && 
               command.length > 0 && 
               command.length < 1000 &&
               !/[<>|&;]/.test(command); // Prevent command injection
    }

    async validateContext(command, context) {
        const issues = {
            warnings: [],
            blockers: []
        };

        // Check if we're in a valid workspace
        if (!vscode.workspace.workspaceFolders) {
            issues.blockers.push('No workspace folder is open');
            return issues;
        }

        // Check if there are unsaved changes for risky commands
        if (this.assessRisk(command) === this.riskLevels.HIGH) {
            const unsavedDocuments = vscode.workspace.textDocuments.filter(doc => doc.isDirty);
            if (unsavedDocuments.length > 0) {
                issues.warnings.push('There are unsaved changes in the workspace');
            }
        }

        // Check git status for git-related commands
        if (command.toLowerCase().includes('git')) {
            try {
                // TODO: Implement git status check
                // For now, just add a warning
                issues.warnings.push('Git status check not implemented');
            } catch (error) {
                issues.warnings.push('Unable to check git status');
            }
        }

        return issues;
    }
}

module.exports = CommandValidator;
