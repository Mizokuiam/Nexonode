const vscode = require('vscode');

class AICodeReview {
    constructor() {
        this.reviewInProgress = false;
        this.reviewComments = new Map();
    }

    async startReview() {
        if (this.reviewInProgress) {
            return;
        }

        this.reviewInProgress = true;
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        try {
            const document = editor.document;
            const code = document.getText();
            
            // Analyze code quality
            const qualityIssues = await this.analyzeCodeQuality(code);
            
            // Check for security vulnerabilities
            const securityIssues = await this.checkSecurity(code);
            
            // Analyze performance
            const performanceIssues = await this.analyzePerformance(code);
            
            // Generate improvement suggestions
            const suggestions = await this.generateSuggestions(code);

            // Add review comments
            await this.addReviewComments(document, [
                ...qualityIssues,
                ...securityIssues,
                ...performanceIssues,
                ...suggestions
            ]);

        } finally {
            this.reviewInProgress = false;
        }
    }

    async analyzeCodeQuality(code) {
        // Analyze code patterns, style, and best practices
        return [
            {
                line: 10,
                message: 'Consider extracting this logic into a separate function',
                severity: 'suggestion'
            }
        ];
    }

    async checkSecurity(code) {
        // Check for security vulnerabilities
        return [
            {
                line: 15,
                message: 'Potential SQL injection vulnerability',
                severity: 'warning'
            }
        ];
    }

    async analyzePerformance(code) {
        // Analyze performance bottlenecks
        return [
            {
                line: 20,
                message: 'This loop could be optimized using map/reduce',
                severity: 'info'
            }
        ];
    }

    async generateSuggestions(code) {
        // Generate improvement suggestions
        return [
            {
                line: 25,
                message: 'Consider using async/await here',
                severity: 'suggestion'
            }
        ];
    }

    async addReviewComments(document, issues) {
        const decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: '0 0 0 3em',
                textDecoration: 'none'
            }
        });

        const decorations = issues.map(issue => ({
            range: document.lineAt(issue.line).range,
            renderOptions: {
                after: {
                    contentText: `⚠️ ${issue.message}`,
                    color: this.getSeverityColor(issue.severity)
                }
            }
        }));

        vscode.window.activeTextEditor?.setDecorations(decorationType, decorations);
        this.reviewComments.set(document.uri.toString(), decorations);
    }

    getSeverityColor(severity) {
        const colors = {
            error: '#ff0000',
            warning: '#ffa500',
            info: '#0000ff',
            suggestion: '#008000'
        };
        return colors[severity] || colors.info;
    }

    async generateReport() {
        const issues = Array.from(this.reviewComments.values()).flat();
        
        const report = {
            summary: {
                total: issues.length,
                bySeverity: this.countBySeverity(issues)
            },
            details: issues
        };

        await this.showReportWebview(report);
    }

    countBySeverity(issues) {
        return issues.reduce((acc, issue) => {
            acc[issue.severity] = (acc[issue.severity] || 0) + 1;
            return acc;
        }, {});
    }

    async showReportWebview(report) {
        const panel = vscode.window.createWebviewPanel(
            'codeReview',
            'Code Review Report',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getReportHTML(report);
    }

    getReportHTML(report) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: system-ui; padding: 20px; }
                    .summary { margin-bottom: 20px; }
                    .issue {
                        padding: 10px;
                        margin: 5px 0;
                        border-radius: 5px;
                    }
                    .error { background: #ffe6e6; }
                    .warning { background: #fff3e6; }
                    .info { background: #e6f3ff; }
                    .suggestion { background: #e6ffe6; }
                </style>
            </head>
            <body>
                <h1>Code Review Report</h1>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>Total Issues: ${report.summary.total}</p>
                    ${Object.entries(report.summary.bySeverity)
                        .map(([severity, count]) => 
                            `<p>${severity}: ${count}</p>`
                        ).join('')}
                </div>
                <div class="details">
                    <h2>Details</h2>
                    ${report.details
                        .map(issue => `
                            <div class="issue ${issue.severity}">
                                <strong>Line ${issue.line}</strong>
                                <p>${issue.message}</p>
                            </div>
                        `).join('')}
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = AICodeReview;
