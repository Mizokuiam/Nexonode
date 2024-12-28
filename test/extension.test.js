const assert = require('assert');
const vscode = require('vscode');
const { CommandValidator } = require('../src/commandValidator');
const { ContextAnalyzer } = require('../src/contextAnalyzer');

suite('Nexonode Extension Test Suite', () => {
    vscode.window.showInformationMessage('Starting all tests.');

    test('Command Validator Test', () => {
        const validator = new CommandValidator();
        assert.strictEqual(validator.isValidSyntax('format'), true);
        assert.strictEqual(validator.isValidSyntax(''), false);
        assert.strictEqual(validator.isValidSyntax('rm -rf /'), false);
    });

    test('Risk Assessment Test', () => {
        const validator = new CommandValidator();
        assert.strictEqual(validator.assessRisk('format'), 'low');
        assert.strictEqual(validator.assessRisk('delete'), 'high');
        assert.strictEqual(validator.assessRisk('refactor'), 'medium');
    });

    test('Context Analyzer Test', async () => {
        const analyzer = new ContextAnalyzer();
        const context = await analyzer.analyzeContext();
        
        // If no editor is active, context should be null
        if (!vscode.window.activeTextEditor) {
            assert.strictEqual(context, null);
        } else {
            assert.notStrictEqual(context, null);
            assert.ok(context.file);
            assert.ok(context.diagnostics);
        }
    });
});
