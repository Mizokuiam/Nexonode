const vscode = require('vscode');
const LicenseServer = require('./licenseServer');

class SubscriptionManager {
    constructor() {
        this.licenseServer = new LicenseServer();
        this.premiumFeatures = [
            'ai_pair_programming',
            'smart_code_generation',
            'ai_editor_integration',
            'advanced_refactoring',
            'smart_debugging',
            'ai_code_review'
        ];
    }

    async showPurchaseDialog() {
        const action = await vscode.window.showInformationMessage(
            'Upgrade to Nexonode Premium for $15 (one-time purchase)',
            'View Features',
            'Purchase',
            'Cancel'
        );

        switch (action) {
            case 'View Features':
                await this.showFeatures();
                break;
            case 'Purchase':
                await this.startPurchaseFlow();
                break;
        }
    }

    async showFeatures() {
        const panel = vscode.window.createWebviewPanel(
            'nexonodeFeatures',
            'Nexonode Premium Features',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getFeaturesHTML();
    }

    async startPurchaseFlow() {
        // Open purchase page in browser
        const purchaseUrl = 'https://nexonode.com/purchase/premium';
        await vscode.env.openExternal(vscode.Uri.parse(purchaseUrl));
    }

    async activateLicense(licenseKey) {
        const result = await this.licenseServer.activateLicense(
            licenseKey,
            await this.getUserEmail()
        );

        if (result.success) {
            await this.saveLicenseDetails(licenseKey, result.details);
            await vscode.window.showInformationMessage(
                'Premium features activated successfully! Enjoy Nexonode Premium!'
            );
            return true;
        } else {
            await vscode.window.showErrorMessage(
                `License activation failed: ${result.error}`
            );
            return false;
        }
    }

    async checkLicenseStatus() {
        const config = vscode.workspace.getConfiguration('nexonode');
        const licenseKey = config.get('premium.licenseKey');

        if (!licenseKey) return false;

        const result = await this.licenseServer.validateLicense(licenseKey);
        return result.isValid;
    }

    async getUserEmail() {
        return await vscode.window.showInputBox({
            prompt: 'Enter your email address for license activation',
            validateInput: (value) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    ? null
                    : 'Please enter a valid email address';
            }
        });
    }

    async saveLicenseDetails(licenseKey, details) {
        const config = vscode.workspace.getConfiguration('nexonode');
        await config.update('premium.licenseKey', licenseKey, true);
        await config.update('premium.enabled', true, true);
        await config.update('premium.purchaseDate', new Date().toISOString(), true);
    }

    getFeaturesHTML() {
        const features = [
            {
                name: 'AI Pair Programming',
                description: 'Real-time AI assistance while you code',
                icon: ''
            },
            {
                name: 'Smart Code Generation',
                description: 'Generate entire components and features using AI',
                icon: ''
            },
            {
                name: 'AI Editor Integration',
                description: 'Seamless integration with popular AI-powered editors',
                icon: ''
            },
            {
                name: 'Advanced Refactoring',
                description: 'AI-powered code refactoring and optimization',
                icon: ''
            },
            {
                name: 'Smart Debugging',
                description: 'AI-assisted debugging with intelligent insights',
                icon: ''
            },
            {
                name: 'AI Code Review',
                description: 'Automated code review with detailed suggestions',
                icon: ''
            }
        ];

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        padding: 20px;
                        font-family: system-ui;
                        max-width: 800px;
                        margin: 0 auto;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .price {
                        font-size: 2em;
                        color: #0066cc;
                        margin: 20px 0;
                    }
                    .one-time {
                        font-size: 0.8em;
                        color: #666;
                    }
                    .features {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 20px;
                        margin-top: 30px;
                    }
                    .feature {
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .feature-icon {
                        font-size: 2em;
                        margin-bottom: 10px;
                    }
                    .feature-name {
                        font-size: 1.2em;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .feature-description {
                        color: #666;
                    }
                    .cta {
                        text-align: center;
                        margin-top: 40px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background: #0066cc;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .button:hover {
                        background: #0052a3;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Nexonode Premium</h1>
                    <div class="price">
                        $15
                        <span class="one-time">one-time purchase</span>
                    </div>
                </div>
                <div class="features">
                    ${features.map(feature => `
                        <div class="feature">
                            <div class="feature-icon">${feature.icon}</div>
                            <div class="feature-name">${feature.name}</div>
                            <div class="feature-description">${feature.description}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="cta">
                    <a href="https://nexonode.com/purchase/premium" class="button">
                        Upgrade to Premium
                    </a>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = SubscriptionManager;
