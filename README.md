# Nexonode - Interactive Automation Assistant

A powerful VS Code extension that streamlines your development workflow through intelligent automation and context-aware command execution.

## Features

### 🎯 Smart Command Execution
- Context-aware command validation
- Automatic command suggestions based on current context
- Risk assessment and safety checks
- Command history tracking

### ⚡ Quick Access
- Quick command palette (Ctrl+Shift+;)
- Status bar integration with real-time feedback
- Context menu integration
- Keyboard shortcuts for common operations

### 🔧 Supported Commands
- **Format**: Intelligent code formatting
- **Lint**: Code linting with ESLint integration
- **Refactor**: Smart refactoring operations
  - Extract method/variable
  - Rename symbols
  - Move code
- **Git**: Common git operations
  - Commit
  - Push/Pull
  - Branch management
- **Test**: Automatic test framework detection
- **Install**: Package management
- **Search**: Advanced codebase search
- **Snippets**: Context-aware code snippets

### 🔌 External Integrations
- GitHub: Issue and PR management
- Slack: Command notifications
- Jira: Issue tracking
- Jenkins: Build integration

## Requirements

- VS Code ^1.60.0
- Node.js & npm (for development)

## Installation

1. Open VS Code
2. Press `Ctrl+P` to open the Quick Open dialog
3. Type `ext install nexonode` and press Enter

## Usage

### Quick Start
1. Open the command palette (Ctrl+Shift+P)
2. Type "Nexonode" to see available commands
3. Or use the quick command palette (Ctrl+Shift+;)

### Configuration
1. Open VS Code settings
2. Search for "Nexonode"
3. Configure:
   - Auto-approved commands
   - Commands requiring approval
   - Blocked commands
   - External integration settings

### Command Examples
```bash
# Format current file
format

# Lint project
lint

# Refactor operations
refactor rename
refactor extract method
refactor move

# Git operations
git commit
git push
git pull

# Run tests
test

# Install packages
install package-name
```

## Extension Settings

This extension contributes the following settings:

* `nexonode.autoApprove`: Commands to execute without confirmation
* `nexonode.requireApproval`: Commands requiring explicit approval
* `nexonode.blocked`: Blocked commands
* `nexonode.integrations`: External integration settings

## Known Issues

See our [GitHub issues](https://github.com/yourusername/nexonode/issues) for any known issues.

## Release Notes

### 0.1.0
Initial release of Nexonode with core functionality:
- Command execution system
- Context analysis
- Quick command palette
- External integrations
- Status bar integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on our GitHub repository.
