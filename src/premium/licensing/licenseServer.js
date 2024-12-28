const crypto = require('crypto');
const https = require('https');

class LicenseServer {
    constructor() {
        this.apiEndpoint = 'https://api.nexonode.com/license';
        this.publicKey = process.env.NEXONODE_LICENSE_PUBLIC_KEY;
    }

    async validateLicense(licenseKey) {
        try {
            const response = await this.makeRequest('/validate', {
                licenseKey,
                machineId: await this.getMachineId()
            });

            if (response.valid) {
                return {
                    isValid: true,
                    type: response.type,
                    features: response.features,
                    expiryDate: new Date(response.expiryDate)
                };
            }

            return { isValid: false };
        } catch (error) {
            console.error('License validation failed:', error);
            return { isValid: false, error: error.message };
        }
    }

    async activateLicense(licenseKey, email) {
        try {
            const response = await this.makeRequest('/activate', {
                licenseKey,
                email,
                machineId: await this.getMachineId()
            });

            return {
                success: response.activated,
                message: response.message,
                details: response.details
            };
        } catch (error) {
            console.error('License activation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async deactivateLicense(licenseKey) {
        try {
            const response = await this.makeRequest('/deactivate', {
                licenseKey,
                machineId: await this.getMachineId()
            });

            return {
                success: response.deactivated,
                message: response.message
            };
        } catch (error) {
            console.error('License deactivation failed:', error);
            return { success: false, error: error.message };
        }
    }

    async checkUpdates(licenseKey) {
        try {
            const response = await this.makeRequest('/check-updates', {
                licenseKey,
                machineId: await this.getMachineId()
            });

            return {
                hasUpdates: response.hasUpdates,
                features: response.features,
                expiryDate: new Date(response.expiryDate)
            };
        } catch (error) {
            console.error('Update check failed:', error);
            return { hasUpdates: false, error: error.message };
        }
    }

    async makeRequest(endpoint, data) {
        return new Promise((resolve, reject) => {
            const request = https.request(
                \`\${this.apiEndpoint}\${endpoint}\`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Nexonode-Client': 'vscode-extension'
                    }
                },
                (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (error) {
                            reject(error);
                        }
                    });
                }
            );

            request.on('error', reject);
            request.write(JSON.stringify(data));
            request.end();
        });
    }

    async getMachineId() {
        // Generate a unique machine identifier
        const userInfo = process.env.USERNAME || process.env.USER;
        const osInfo = process.platform;
        const timestamp = Date.now();

        const data = \`\${userInfo}-\${osInfo}-\${timestamp}\`;
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }

    verifyLicenseSignature(license, signature) {
        try {
            const verify = crypto.createVerify('SHA256');
            verify.update(JSON.stringify(license));
            return verify.verify(this.publicKey, signature, 'base64');
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }
}

module.exports = LicenseServer;
