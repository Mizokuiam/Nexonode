const puppeteer = require('puppeteer');
const path = require('path');

async function generateScreenshots() {
    const browser = await puppeteer.launch({
        defaultViewport: {
            width: 800,
            height: 400,
            deviceScaleFactor: 2
        }
    });

    const page = await browser.newPage();
    
    // Set VS Code dark theme colors
    await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    background: #1E1E1E;
                    margin: 0;
                    padding: 20px;
                    font-family: 'Consolas', monospace;
                }
                pre {
                    color: #D4D4D4;
                    margin: 0;
                }
                .suggestion {
                    background: #2D2D2D;
                    border: 1px solid #454545;
                    border-radius: 3px;
                    padding: 8px;
                    margin-top: 10px;
                    color: #D4D4D4;
                }
                .cursor {
                    background: #569CD6;
                    width: 2px;
                    height: 18px;
                    display: inline-block;
                    animation: blink 1s infinite;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
            </style>
        </head>
        <body>
            <div id="editor"></div>
        </body>
        </html>
    `);

    // Generate code generation demo
    const codeGenContent = await fs.readFile(path.join(__dirname, '../docs/assets/code-generation-demo.js'), 'utf8');
    await page.$eval('#editor', (el, code) => {
        el.innerHTML = `<pre>${code}</pre>
        <div class="suggestion">
            ✨ AI Suggestion: Add input validation middleware for request body
        </div>`;
    }, codeGenContent);
    await page.screenshot({ path: path.join(__dirname, '../docs/assets/code-generation.png') });

    // Generate pair programming demo
    const pairProgContent = await fs.readFile(path.join(__dirname, '../docs/assets/pair-programming-demo.js'), 'utf8');
    await page.$eval('#editor', (el, code) => {
        el.innerHTML = `<pre>${code}</pre>
        <div class="suggestion">
            💡 AI Assistant: Consider adding email validation using a regular expression
        </div>`;
    }, pairProgContent);
    await page.screenshot({ path: path.join(__dirname, '../docs/assets/pair-programming.png') });

    await browser.close();
}

generateScreenshots().catch(console.error);
