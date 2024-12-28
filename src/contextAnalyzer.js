const vscode = require('vscode');
const path = require('path');

class ContextAnalyzer {
    constructor() {
        this.fileTypes = {
            javascript: ['.js', '.jsx', '.ts', '.tsx'],
            python: ['.py'],
            java: ['.java'],
            web: ['.html', '.css', '.scss']
        };
    }

    async analyzeContext() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        const document = editor.document;
        const workspace = vscode.workspace.getWorkspaceFolder(document.uri);

        const context = {
            file: {
                path: document.fileName,
                type: path.extname(document.fileName),
                language: document.languageId,
                size: document.getText().length,
                isDirty: document.isDirty
            },
            editor: {
                selection: {
                    text: document.getText(editor.selection),
                    start: editor.selection.start,
                    end: editor.selection.end
                },
                visibleRanges: editor.visibleRanges
            },
            workspace: workspace ? {
                name: workspace.name,
                path: workspace.uri.fsPath
            } : null,
            dependencies: await this.analyzeDependencies(),
            git: await this.analyzeGitContext(),
            diagnostics: await this.analyzeDiagnostics(document)
        };

        return context;
    }

    async analyzeDependencies() {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) return null;

            const packageJsonUri = vscode.Uri.file(
                path.join(workspaceFolders[0].uri.fsPath, 'package.json')
            );

            try {
                const packageJsonDoc = await vscode.workspace.openTextDocument(packageJsonUri);
                const packageJson = JSON.parse(packageJsonDoc.getText());
                return {
                    dependencies: packageJson.dependencies || {},
                    devDependencies: packageJson.devDependencies || {}
                };
            } catch (e) {
                return null;
            }
        } catch (error) {
            console.error('Error analyzing dependencies:', error);
            return null;
        }
    }

    async analyzeGitContext() {
        // TODO: Implement git context analysis
        // This would require executing git commands to get:
        // - Current branch
        // - Modified files
        // - Staged changes
        return {
            isGitRepository: false,
            branch: null,
            modifiedFiles: []
        };
    }

    async analyzeDiagnostics(document) {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);
        return {
            errors: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length,
            warnings: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length,
            info: diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Information).length
        };
    }

    getLanguageSpecificContext(document) {
        const language = document.languageId;
        const text = document.getText();

        switch (language) {
            case 'javascript':
            case 'typescript':
                return this.analyzeJavaScriptContext(text);
            case 'python':
                return this.analyzePythonContext(text);
            default:
                return {};
        }
    }

    analyzeJavaScriptContext(text) {
        // Basic JS/TS analysis
        return {
            hasImports: /import .+ from/.test(text),
            hasExports: /export .+/.test(text),
            hasAsync: /async/.test(text),
            hasJSX: /<[A-Z][A-Za-z0-9]*/.test(text)
        };
    }

    analyzePythonContext(text) {
        // Basic Python analysis
        return {
            hasImports: /import .+|from .+ import/.test(text),
            hasClasses: /class .+:/.test(text),
            hasDecorators: /@.+/.test(text)
        };
    }
}

module.exports = ContextAnalyzer;
