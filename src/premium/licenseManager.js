const vscode = require('vscode');
const crypto = require('crypto');

class LicenseManager {
    constructor() {
        this.licenseStatus = {
            isValid: false,
            type: 'standard',
            expiryDate: null,
            features: []
        };
    }

    async initialize() {
        // Load license from settings
        const config = vscode.workspace.getConfiguration('nexonode');
        const licenseKey = config.get('premium.licenseKey');
        
        if (licenseKey) {
            await this.validateLicense(licenseKey);
        }
    }

    async validateLicense(licenseKey) {
        try {
            // Verify license key format
            if (!this.isValidLicenseFormat(licenseKey)) {
                throw new Error('Invalid license format');
            }

            // Verify license with server
            const validation = await this.verifyWithServer(licenseKey);
            
            if (validation.isValid) {
                this.licenseStatus = {
                    isValid: true,
                    type: validation.type,
                    expiryDate: new Date(validation.expiryDate),
                    features: validation.features
                };

                // Save valid license
                await this.saveLicense(licenseKey);
                
                return true;
            }
        } catch (error) {
            console.error('License validation failed:', error);
            this.licenseStatus.isValid = false;
        }
        
        return false;
    }

    isValidLicenseFormat(licenseKey) {
        // Check if license key matches expected format
        const licenseRegex = /^NEXO-\w{4}-\w{4}-\w{4}$/;
        return licenseRegex.test(licenseKey);
    }

    async verifyWithServer(licenseKey) {
        // This would be replaced with actual server verification
        // For now, return mock data
        return {
            isValid: true,
            type: 'premium',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            features: [
                'ai_integration',
                'auto_response',
                'priority_support'
            ]
        };
    }

    async saveLicense(licenseKey) {
        const config = vscode.workspace.getConfiguration('nexonode');
        await config.update('premium.licenseKey', licenseKey, true);
        await config.update('premium.enabled', true, true);
    }

    isPremium() {
        return this.licenseStatus.isValid && 
               this.licenseStatus.type === 'premium' &&
               new Date() < this.licenseStatus.expiryDate;
    }

    hasFeature(featureName) {
        return this.isPremium() && this.licenseStatus.features.includes(featureName);
    }

    getDaysRemaining() {
        if (!this.isPremium()) return 0;
        
        const now = new Date();
        const diff = this.licenseStatus.expiryDate - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    async showUpgradeDialog() {
        const action = await vscode.window.showInformationMessage(
            'This feature requires Nexonode Premium. Would you like to upgrade?',
            'Upgrade Now',
            'Learn More',
            'Maybe Later'
        );

        if (action === 'Upgrade Now') {
            vscode.env.openExternal(vscode.Uri.parse('https://nexonode.com/premium'));
        } else if (action === 'Learn More') {
            vscode.env.openExternal(vscode.Uri.parse('https://nexonode.com/features'));
        }
    }
}

module.exports = LicenseManager;
