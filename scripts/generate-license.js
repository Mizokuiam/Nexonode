const crypto = require('crypto');

class LicenseKeyGenerator {
  constructor() {
    this.allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars
  }

  // Generate a random string of specified length
  generateRandomString(length) {
    let result = '';
    const charactersLength = this.allowedChars.length;
    
    for (let i = 0; i < length; i++) {
      result += this.allowedChars.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }

  // Generate checksum for validation
  generateChecksum(key) {
    return crypto
      .createHash('sha256')
      .update(key)
      .digest('hex')
      .substring(0, 4)
      .toUpperCase();
  }

  // Generate a complete license key
  generateLicenseKey() {
    // Generate 5 groups of 5 characters
    const groups = [];
    for (let i = 0; i < 4; i++) {
      groups.push(this.generateRandomString(5));
    }

    // Generate checksum from the first 4 groups
    const baseKey = groups.join('');
    const checksum = this.generateChecksum(baseKey);
    groups.push(checksum);

    // Format with dashes
    return groups.join('-');
  }

  // Validate a license key
  validateLicenseKey(key) {
    // Remove any spaces or dashes
    const cleanKey = key.replace(/[-\s]/g, '').toUpperCase();
    
    if (cleanKey.length !== 25) {
      return false;
    }

    // Extract base key and checksum
    const baseKey = cleanKey.substring(0, 20);
    const providedChecksum = cleanKey.substring(20);
    const calculatedChecksum = this.generateChecksum(baseKey);

    return providedChecksum === calculatedChecksum;
  }
}

// Example usage
const generator = new LicenseKeyGenerator();

// Generate a new license key
const licenseKey = generator.generateLicenseKey();
console.log('Generated License Key:', licenseKey);

// Validate the license key
const isValid = generator.validateLicenseKey(licenseKey);
console.log('License Key is Valid:', isValid);

module.exports = LicenseKeyGenerator;
