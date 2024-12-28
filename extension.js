const vscode = require('vscode');
const CommandValidator = require('./src/commandValidator');
const ContextAnalyzer = require('./src/contextAnalyzer');
const RuleConfiguration = require('./src/ruleConfiguration');
const { ExternalIntegrations } = require('./src/externalIntegrations');
const CommandExecutor = require('./src/commandExecutor');
const StatusBarManager = require('./src/statusBar');
const QuickCommandPalette = require('./src/quickCommands');

class NexonodeExtension {
    constructor() {
        this.commandValidator = new CommandValidator();
        this.contextAnalyzer = new ContextAnalyzer();
        this.ruleConfiguration = new RuleConfiguration();
        this.externalIntegrations = new ExternalIntegrations();
        this.commandExecutor = new CommandExecutor();
        this.statusBar = new StatusBarManager();
        this.quickCommandPalette = new QuickCommandPalette(
            this.commandExecutor,
            this.contextAnalyzer
        );
    }

    async initialize(context) {
        console.log('Initializing Nexonode extension...');

        // Initialize external integrations
        await this.externalIntegrations.initialize();

        // Register commands
        let executeCommand = vscode.commands.registerCommand(
            'nexonode.executeCommand',
            () => this.handleExecuteCommand()
        );

        let validateContext = vscode.commands.registerCommand(
            'nexonode.validateContext',
            () => this.handleValidateContext()
        );

        let configureRules = vscode.commands.registerCommand(
            'nexonode.configureRules',
            () => this.handleConfigureRules()
        );

        let showQuickCommands = vscode.commands.registerCommand(
            'nexonode.showQuickCommands',
            () => this.quickCommandPalette.show()
        );

        // Register event handlers
        context.subscriptions.push(
            executeCommand,
            validateContext,
            configureRules,
            showQuickCommands,
            this.statusBar,
            vscode.workspace.onDidChangeTextDocument(() => this.handleDocumentChange()),
            vscode.window.onDidChangeActiveTextEditor(() => this.handleEditorChange())
        );
    }

    async handleExecuteCommand() {
        try {
            const command = await vscode.window.showInputBox({
                prompt: 'Enter command to execute',
                placeHolder: 'e.g., format, lint, refactor'
            });

            if (!command) return;

            this.statusBar.updateStatusBar('working', `Executing ${command}`);

            // Analyze current context
            const context = await this.contextAnalyzer.analyzeContext();
            if (!context) {
                throw new Error('Unable to analyze current context');
            }

            // Validate command
            const validation = await this.commandValidator.validateCommand(command, context);
            
            if (!validation.isValid) {
                throw new Error(`Command validation failed:\n${validation.blockers.join('\n')}`);
            }

            if (validation.warnings.length > 0) {
                const proceed = await vscode.window.showWarningMessage(
                    `Warnings:\n${validation.warnings.join('\n')}`,
                    'Proceed',
                    'Cancel'
                );
                if (proceed !== 'Proceed') {
                    this.statusBar.updateStatusBar('ready');
                    return;
                }
            }

            // Execute command
            const result = await this.commandExecutor.execute(command, context);
            
            // Notify integrations
            await this.externalIntegrations.notifyAll(
                `Command executed: ${command}`,
                context
            );

            this.statusBar.updateStatusBar('success', result.message);
        } catch (error) {
            this.statusBar.updateStatusBar('error', error.message);
            vscode.window.showErrorMessage(`Error executing command: ${error.message}`);
        }
    }

    async handleValidateContext() {
        try {
            this.statusBar.updateStatusBar('working', 'Analyzing context');
            const context = await this.contextAnalyzer.analyzeContext();
            
            if (context) {
                const contextView = await vscode.window.createWebviewPanel(
                    'nexonodeContext',
                    'Nexonode Context Analysis',
                    vscode.ViewColumn.Two,
                    { enableScripts: true }
                );

                contextView.webview.html = this.getContextViewHtml(context);
                this.statusBar.updateStatusBar('success', 'Context analyzed');
            } else {
                throw new Error('No active editor');
            }
        } catch (error) {
            this.statusBar.updateStatusBar('error', error.message);
            vscode.window.showErrorMessage(`Error analyzing context: ${error.message}`);
        }
    }

    async handleConfigureRules() {
        try {
            this.statusBar.updateStatusBar('working', 'Configuring rules');
            await this.ruleConfiguration.showConfigurationUI();
            this.statusBar.updateStatusBar('success', 'Rules configured');
        } catch (error) {
            this.statusBar.updateStatusBar('error', error.message);
            vscode.window.showErrorMessage(`Error configuring rules: ${error.message}`);
        }
    }

    async handleDocumentChange() {
        // Update context when document changes
        const context = await this.contextAnalyzer.analyzeContext();
        if (context) {
            // Update status bar based on context
            if (context.diagnostics.errors > 0) {
                this.statusBar.updateStatusBar('error', `${context.diagnostics.errors} errors found`);
            } else if (context.diagnostics.warnings > 0) {
                this.statusBar.updateStatusBar('warning', `${context.diagnostics.warnings} warnings`);
            } else {
                this.statusBar.updateStatusBar('ready');
            }
        }
    }

    async handleEditorChange() {
        // Update context when active editor changes
        await this.handleDocumentChange();
    }

    getContextViewHtml(context) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        padding: 10px; 
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-editor-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .section { 
                        margin-bottom: 20px;
                        padding: 10px;
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    .title { 
                        font-weight: bold;
                        margin-bottom: 10px;
                        color: var(--vscode-titleBar-activeForeground);
                    }
                    .content { 
                        margin-left: 15px;
                    }
                    .error { color: var(--vscode-errorForeground); }
                    .warning { color: var(--vscode-warningForeground); }
                    .info { color: var(--vscode-infoForeground); }
                </style>
            </head>
            <body>
                <h2>Context Analysis</h2>
                <div class="section">
                    <div class="title">File Information:</div>
                    <div class="content">
                        <div>Path: ${context.file.path}</div>
                        <div>Type: ${context.file.type}</div>
                        <div>Language: ${context.file.language}</div>
                        <div>Size: ${context.file.size} bytes</div>
                    </div>
                </div>
                <div class="section">
                    <div class="title">Workspace:</div>
                    <div class="content">
                        <div>Name: ${context.workspace?.name || 'N/A'}</div>
                        <div>Path: ${context.workspace?.path || 'N/A'}</div>
                    </div>
                </div>
                <div class="section">
                    <div class="title">Diagnostics:</div>
                    <div class="content">
                        <div class="error">Errors: ${context.diagnostics.errors}</div>
                        <div class="warning">Warnings: ${context.diagnostics.warnings}</div>
                        <div class="info">Info: ${context.diagnostics.info}</div>
                    </div>
                </div>
                ${context.git ? `
                <div class="section">
                    <div class="title">Git Status:</div>
                    <div class="content">
                        <div>Branch: ${context.git.branch || 'N/A'}</div>
                        <div>Modified Files: ${context.git.modifiedFiles.length}</div>
                    </div>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }
}

let extension = null;

function activate(context) {
    extension = new NexonodeExtension();
    extension.initialize(context);
}

function deactivate() {
    if (extension) {
        extension.statusBar.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};
