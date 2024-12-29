const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const config = {
  version: '0.2.0',
  name: 'nexonode-premium',
  files: [
    'extension.js',
    'package.json',
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    'lib/**/*',
    'src/**/*'
  ],
  excludes: [
    'node_modules/**',
    '.git/**',
    '.github/**',
    'docs/**',
    'scripts/**',
    'test/**'
  ]
};

// Update package.json for premium version
function updatePackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const package = require(packagePath);
  
  package.name = config.name;
  package.version = config.version;
  package.displayName = 'Nexonode Premium';
  package.description = 'Advanced AI-powered development assistant with premium features';
  
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
}

// Package extension
function packageExtension() {
  exec('vsce package', {
    cwd: path.join(__dirname, '..')
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error packaging extension:', error);
      return;
    }
    console.log('Extension packaged successfully:', stdout);
    
    // Move to gumroad folder
    const vsixFile = `${config.name}-${config.version}.vsix`;
    const source = path.join(__dirname, '..', vsixFile);
    const dest = path.join(__dirname, '..', 'gumroad', 'product', vsixFile);
    
    fs.mkdirSync(path.join(__dirname, '..', 'gumroad', 'product'), { recursive: true });
    fs.renameSync(source, dest);
    console.log('VSIX file moved to gumroad folder');
  });
}

// Main execution
console.log('Packaging Nexonode Premium...');
updatePackageJson();
packageExtension();
