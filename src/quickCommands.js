const vscode = require('vscode');

class QuickCommandPalette {
    constructor(commandExecutor, contextAnalyzer) {
        this.commandExecutor = commandExecutor;
        this.contextAnalyzer = contextAnalyzer;
        this.quickCommands = [
            {
                label: '$(format) Format Document',
                description: 'Format the current document',
                command: 'format'
            },
            {
                label: '$(bracket) Lint Code',
                description: 'Run linter on current file or project',
                command: 'lint'
            },
            {
                label: '$(refresh) Refactor...',
                description: 'Show refactoring options',
                command: 'refactor'
            },
            {
                label: '$(test-view-icon) Run Tests',
                description: 'Execute tests',
                command: 'test'
            },
            {
                label: '$(git-commit) Git Commands...',
                description: 'Execute git commands',
                command: 'git',
                submenu: true
            },
            {
                label: '$(search) Search in Files',
                description: 'Search across workspace',
                command: 'search'
            },
            {
                label: '$(extensions) Install Package',
                description: 'Install npm package',
                command: 'install'
            },
            {
                label: '$(snippet) Insert Snippet',
                description: 'Insert code snippet',
                command: 'snippet',
                submenu: true
            }
        ];
    }

    async show() {
        const context = await this.contextAnalyzer.analyzeContext();
        const items = this.getContextualCommands(context);

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a command to execute',
            matchOnDescription: true
        });

        if (!selection) return;

        if (selection.submenu) {
            await this.showSubmenu(selection.command, context);
        } else {
            await this.executeCommand(selection.command, context);
        }
    }

    getContextualCommands(context) {
        // Filter and modify commands based on context
        return this.quickCommands.filter(cmd => {
            switch (cmd.command) {
                case 'format':
                    return !!vscode.window.activeTextEditor;
                case 'lint':
                    return context?.file?.language in ['javascript', 'typescript', 'python'];
                case 'git':
                    return context?.git?.isGitRepository;
                default:
                    return true;
            }
        });
    }

    async showSubmenu(command, context) {
        let items = [];

        switch (command) {
            case 'git':
                items = await this.getGitSubmenuItems(context);
                break;
            case 'snippet':
                items = await this.getSnippetSubmenuItems(context);
                break;
            case 'refactor':
                items = this.getRefactorSubmenuItems();
                break;
        }

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: `Select ${command} command`,
            matchOnDescription: true
        });

        if (selection) {
            await this.executeCommand(`${command} ${selection.command}`, context);
        }
    }

    async getGitSubmenuItems(context) {
        return [
            {
                label: '$(git-commit) Commit',
                description: 'Commit changes',
                command: 'commit'
            },
            {
                label: '$(git-pull) Pull',
                description: 'Pull changes',
                command: 'pull'
            },
            {
                label: '$(git-push) Push',
                description: 'Push changes',
                command: 'push'
            },
            {
                label: '$(git-branch) Branch',
                description: 'Branch operations',
                command: 'branch'
            }
        ];
    }

    async getSnippetSubmenuItems(context) {
        // Get available snippets based on language
        const language = vscode.window.activeTextEditor?.document.languageId;
        const snippets = await this.getLanguageSnippets(language);

        return snippets.map(snippet => ({
            label: `$(snippet) ${snippet.name}`,
            description: snippet.description,
            command: snippet.name
        }));
    }

    getRefactorSubmenuItems() {
        return [
            {
                label: '$(symbol-method) Extract Method',
                description: 'Extract selection to method',
                command: 'extract method'
            },
            {
                label: '$(symbol-variable) Extract Variable',
                description: 'Extract selection to variable',
                command: 'extract variable'
            },
            {
                label: '$(symbol-class) Rename Symbol',
                description: 'Rename selected symbol',
                command: 'rename'
            }
        ];
    }

    async getLanguageSnippets(language) {
        // This would be expanded to load snippets from extension's snippet files
        const commonSnippets = [
            { name: 'function', description: 'Create a function' },
            { name: 'class', description: 'Create a class' },
            { name: 'if', description: 'If statement' },
            { name: 'try', description: 'Try-catch block' }
        ];

        const languageSpecificSnippets = {
            javascript: [
                { name: 'promise', description: 'Create a Promise' },
                { name: 'arrow', description: 'Arrow function' }
            ],
            python: [
                { name: 'def', description: 'Define a function' },
                { name: 'class', description: 'Create a class' }
            ]
        };

        return [...commonSnippets, ...(languageSpecificSnippets[language] || [])];
    }

    async executeCommand(command, context) {
        try {
            await this.commandExecutor.execute(command, context);
        } catch (error) {
            vscode.window.showErrorMessage(`Command execution failed: ${error.message}`);
        }
    }
}

module.exports = QuickCommandPalette;
