const vscode = require('vscode');

class StatusBarManager {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'nexonode.showQuickCommands';
        this.updateStatusBar('ready');
        this.statusBarItem.show();
    }

    updateStatusBar(status, detail = '') {
        switch (status) {
            case 'ready':
                this.statusBarItem.text = '$(zap) Nexonode';
                this.statusBarItem.tooltip = 'Click to show quick commands';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'working':
                this.statusBarItem.text = '$(sync~spin) Nexonode';
                this.statusBarItem.tooltip = `Working: ${detail}`;
                break;
            case 'error':
                this.statusBarItem.text = '$(error) Nexonode';
                this.statusBarItem.tooltip = `Error: ${detail}`;
                this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                break;
            case 'success':
                this.statusBarItem.text = '$(check) Nexonode';
                this.statusBarItem.tooltip = `Success: ${detail}`;
                setTimeout(() => this.updateStatusBar('ready'), 3000);
                break;
        }
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}

module.exports = StatusBarManager;
