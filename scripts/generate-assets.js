const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Brand colors
const COLORS = {
  primary: '#4F46E5',
  secondary: '#7C3AED',
  accent: '#818CF8',
  background: '#030712',
  text: '#E2E8F0'
};

// Create directory if it doesn't exist
const assetsDir = path.join(__dirname, '..', 'gumroad', 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Helper function to create gradient
function createGradient(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, COLORS.primary);
  gradient.addColorStop(1, COLORS.secondary);
  return gradient;
}

// Create premium cover image (1280x720)
async function createCoverImage() {
  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, 1280, 720);

  // Gradient accent
  ctx.fillStyle = createGradient(ctx, 1280, 720);
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.globalAlpha = 1;

  // Title
  ctx.font = 'bold 64px Inter';
  ctx.fillStyle = COLORS.text;
  ctx.fillText('Nexonode Premium', 80, 120);

  // Subtitle
  ctx.font = '32px Inter';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText('AI-Powered Development Assistant', 80, 170);

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'premium-cover.png'), buffer);
}

// Create thumbnail (600x400)
async function createThumbnail() {
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, 600, 400);

  // Gradient accent
  ctx.fillStyle = createGradient(ctx, 600, 400);
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, 600, 400);
  ctx.globalAlpha = 1;

  // Logo/Title
  ctx.font = 'bold 48px Inter';
  ctx.fillStyle = COLORS.text;
  ctx.fillText('Nexonode', 40, 100);
  
  ctx.font = 'bold 36px Inter';
  ctx.fillStyle = COLORS.accent;
  ctx.fillText('Premium', 40, 150);

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'premium-thumbnail.png'), buffer);
}

// Create social preview (1200x630)
async function createSocialPreview() {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, 1200, 630);

  // Gradient accent
  ctx.fillStyle = createGradient(ctx, 1200, 630);
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.globalAlpha = 1;

  // Title
  ctx.font = 'bold 56px Inter';
  ctx.fillStyle = COLORS.text;
  ctx.fillText('Nexonode Premium', 60, 100);

  // Features
  ctx.font = '32px Inter';
  ctx.fillStyle = COLORS.accent;
  const features = [
    '🤖 Advanced AI Code Generation',
    '🔍 Enhanced Code Analysis',
    '🚀 Productivity Boosters',
    '💎 Only $9.99'
  ];
  features.forEach((feature, index) => {
    ctx.fillText(feature, 60, 200 + (index * 50));
  });

  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'premium-social.png'), buffer);
}

// Generate all assets
async function generateAssets() {
  console.log('Generating visual assets...');
  await createCoverImage();
  await createThumbnail();
  await createSocialPreview();
  console.log('Visual assets generated successfully!');
}

generateAssets().catch(console.error);
