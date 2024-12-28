const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createDemoImage(type) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Set dark background
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, 800, 400);

    // Draw VS Code-like interface
    ctx.fillStyle = '#252526';
    ctx.fillRect(20, 20, 760, 360);

    // Draw code lines
    ctx.fillStyle = '#D4D4D4';
    const lines = type === 'code-generation' ? [
        '// AI-powered code generation',
        'function calculateTotal(items) {',
        '    return items.reduce((sum, item) => {',
        '        return sum + item.price * item.quantity;',
        '    }, 0);',
        '}'
    ] : [
        '// AI pair programming assistance',
        'class UserService {',
        '    async createUser(userData) {',
        '        // Validate and create user',
        '        const user = new User(userData);',
        '        return user.save();',
        '    }',
        '}'
    ];

    ctx.font = '14px Consolas';
    lines.forEach((line, i) => {
        ctx.fillText(line, 40, 50 + i * 20);
    });

    // Draw suggestion box
    ctx.fillStyle = '#2D2D2D';
    ctx.fillRect(40, 200, 720, 80);
    ctx.strokeStyle = '#454545';
    ctx.strokeRect(40, 200, 720, 80);

    // Draw suggestion text
    ctx.fillStyle = '#D4D4D4';
    ctx.font = '13px Consolas';
    const suggestion = type === 'code-generation' 
        ? '✨ AI Suggestion: Add input validation for items array'
        : '💡 AI Assistant: Consider adding error handling for invalid user data';
    ctx.fillText(suggestion, 50, 230);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(
        path.join(__dirname, '..', 'docs', 'assets', `${type}.png`),
        buffer
    );
}

// Generate both images
createDemoImage('code-generation');
createDemoImage('pair-programming');

console.log('Demo images generated successfully!');
