const markdownpdf = require('markdown-pdf');
const fs = require('fs');
const path = require('path');

const options = {
  cssPath: path.join(__dirname, 'pdf-style.css'),
  remarkable: {
    html: true,
    breaks: true,
    plugins: ['remarkable-meta']
  }
};

// Create PDF output directory
const pdfDir = path.join(__dirname, '..', 'gumroad', 'product');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Convert markdown files to PDF
async function convertToPDF() {
  const files = [
    {
      input: '../gumroad/docs/quick-start-guide.md',
      output: 'quick-start-guide.pdf'
    },
    {
      input: '../gumroad/docs/premium-features-guide.md',
      output: 'premium-features-guide.pdf'
    }
  ];

  for (const file of files) {
    const inputPath = path.join(__dirname, file.input);
    const outputPath = path.join(pdfDir, file.output);

    await new Promise((resolve, reject) => {
      markdownpdf(options)
        .from(inputPath)
        .to(outputPath, function (err) {
          if (err) {
            console.error(`Error converting ${file.input}:`, err);
            reject(err);
          } else {
            console.log(`Successfully converted ${file.input} to PDF`);
            resolve();
          }
        });
    });
  }
}

// Add CSS styling for PDFs
const cssContent = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1, h2, h3 {
  color: #4F46E5;
  margin-top: 2em;
}

h1 {
  border-bottom: 2px solid #4F46E5;
  padding-bottom: 0.5em;
}

code {
  background: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

pre {
  background: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

ul, ol {
  padding-left: 2em;
}

a {
  color: #7C3AED;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`;

fs.writeFileSync(path.join(__dirname, 'pdf-style.css'), cssContent);

// Run conversion
console.log('Converting markdown files to PDF...');
convertToPDF().catch(console.error);
