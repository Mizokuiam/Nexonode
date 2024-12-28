const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class CommandExecutor {
    constructor() {
        this.commandHandlers = {
            format: this.handleFormat.bind(this),
            lint: this.handleLint.bind(this),
            refactor: this.handleRefactor.bind(this),
            git: this.handleGit.bind(this),
            test: this.handleTest.bind(this),
            install: this.handleInstall.bind(this),
            search: this.handleSearch.bind(this),
            snippet: this.handleSnippet.bind(this)
        };
    }

    async execute(command, context) {
        const [baseCommand, ...args] = command.split(' ');
        const handler = this.commandHandlers[baseCommand.toLowerCase()];

        if (!handler) {
            throw new Error(`Unknown command: ${baseCommand}`);
        }

        return await handler(args, context);
    }

    async handleFormat(args, context) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor');
        }

        // Format the entire document or selected text
        const document = editor.document;
        const selection = editor.selection;
        
        try {
            if (selection.isEmpty) {
                // Format entire document
                const edits = await vscode.commands.executeCommand('editor.action.formatDocument');
                return { success: true, message: 'Document formatted successfully' };
            } else {
                // Format selection
                const edits = await vscode.commands.executeCommand('editor.action.formatSelection');
                return { success: true, message: 'Selection formatted successfully' };
            }
        } catch (error) {
            throw new Error(`Formatting failed: ${error.message}`);
        }
    }

    async handleLint(args, context) {
        try {
            // Run ESLint if available
            const eslintConfig = await this.findESLintConfig();
            if (eslintConfig) {
                const { stdout, stderr } = await execAsync('npx eslint --fix .');
                return {
                    success: true,
                    message: 'Linting completed',
                    output: stdout,
                    warnings: stderr
                };
            }

            // Fallback to VS Code's built-in linting
            await vscode.commands.executeCommand('editor.action.fixAll');
            return { success: true, message: 'Built-in linting completed' };
        } catch (error) {
            throw new Error(`Linting failed: ${error.message}`);
        }
    }

    async handleRefactor(args, context) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor');
        }

        const refactorType = args[0]?.toLowerCase();
        switch (refactorType) {
            case 'rename':
                return await this.handleRename(args.slice(1));
            case 'extract':
                return await this.handleExtract(args.slice(1));
            case 'move':
                return await this.handleMove(args.slice(1));
            default:
                // Show refactoring options
                const action = await vscode.commands.executeCommand('editor.action.refactor');
                return { success: true, message: 'Refactoring options shown' };
        }
    }

    async handleGit(args, context) {
        const gitCommand = args.join(' ');
        try {
            const { stdout, stderr } = await execAsync(`git ${gitCommand}`);
            return {
                success: true,
                message: 'Git command executed',
                output: stdout,
                warnings: stderr
            };
        } catch (error) {
            throw new Error(`Git command failed: ${error.message}`);
        }
    }

    async handleTest(args, context) {
        try {
            // Detect test framework
            const packageJson = await this.readPackageJson();
            let command = '';

            if (packageJson.scripts?.test) {
                command = 'npm test';
            } else if (await this.fileExists('jest.config.js')) {
                command = 'npx jest';
            } else if (await this.fileExists('mocha.opts') || await this.fileExists('.mocharc.js')) {
                command = 'npx mocha';
            } else {
                throw new Error('No test framework detected');
            }

            const { stdout, stderr } = await execAsync(command);
            return {
                success: true,
                message: 'Tests completed',
                output: stdout,
                warnings: stderr
            };
        } catch (error) {
            throw new Error(`Test execution failed: ${error.message}`);
        }
    }

    async handleInstall(args, context) {
        const packageName = args.join(' ');
        try {
            const { stdout, stderr } = await execAsync(`npm install ${packageName}`);
            return {
                success: true,
                message: `Package ${packageName} installed`,
                output: stdout,
                warnings: stderr
            };
        } catch (error) {
            throw new Error(`Installation failed: ${error.message}`);
        }
    }

    async handleSearch(args, context) {
        const searchTerm = args.join(' ');
        try {
            const results = await vscode.commands.executeCommand('workbench.action.findInFiles', {
                query: searchTerm
            });
            return { success: true, message: 'Search completed' };
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    async handleSnippet(args, context) {
        const snippetName = args[0];
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active editor');
        }

        try {
            await vscode.commands.executeCommand('editor.action.insertSnippet', {
                name: snippetName
            });
            return { success: true, message: 'Snippet inserted' };
        } catch (error) {
            throw new Error(`Snippet insertion failed: ${error.message}`);
        }
    }

    // Helper methods
    async handleRename(args) {
        const newName = args[0];
        if (!newName) {
            throw new Error('New name not provided');
        }

        try {
            await vscode.commands.executeCommand('editor.action.rename');
            return { success: true, message: 'Rename completed' };
        } catch (error) {
            throw new Error(`Rename failed: ${error.message}`);
        }
    }

    async handleExtract(args) {
        const extractType = args[0]?.toLowerCase();
        try {
            switch (extractType) {
                case 'method':
                    await vscode.commands.executeCommand('editor.action.extractMethod');
                    break;
                case 'variable':
                    await vscode.commands.executeCommand('editor.action.extractVariable');
                    break;
                default:
                    await vscode.commands.executeCommand('editor.action.refactor');
            }
            return { success: true, message: 'Extraction completed' };
        } catch (error) {
            throw new Error(`Extraction failed: ${error.message}`);
        }
    }

    async handleMove(args) {
        try {
            await vscode.commands.executeCommand('editor.action.moveStatement');
            return { success: true, message: 'Move completed' };
        } catch (error) {
            throw new Error(`Move failed: ${error.message}`);
        }
    }

    async findESLintConfig() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return null;

        const rootPath = workspaceFolders[0].uri.fsPath;
        const configFiles = [
            '.eslintrc.js',
            '.eslintrc.json',
            '.eslintrc.yaml',
            '.eslintrc.yml',
            '.eslintrc'
        ];

        for (const config of configFiles) {
            if (await this.fileExists(path.join(rootPath, config))) {
                return config;
            }
        }
        return null;
    }

    async readPackageJson() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return {};

        try {
            const packageJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'package.json');
            const content = await vscode.workspace.fs.readFile(vscode.Uri.file(packageJsonPath));
            return JSON.parse(content.toString());
        } catch (error) {
            return {};
        }
    }

    async fileExists(filePath) {
        try {
            await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = CommandExecutor;
