const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'docs', 'assets', 'logo.svg');
const pngPath = path.join(__dirname, 'docs', 'assets', 'logo.png');

sharp(svgPath)
  .resize(128, 128) // VS Code recommends 128x128 for extension icons
  .png()
  .toFile(pngPath)
  .then(() => console.log('Conversion complete!'))
  .catch(err => console.error('Error converting file:', err));
