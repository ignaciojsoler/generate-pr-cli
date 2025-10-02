# 📚 Generate PR CLI - Complete Documentation

> **Ready to start using the CLI?** See the [main README](../README.md) for quick setup!

This document contains detailed information about configure PR CLI for advanced usage, customization, and troubleshooting.

## 📦 Installation Options

### Option 1: Global Installation

```bash
# Install once, use everywhere
npm install -g generate-pr-cli

# Then just run:
generate-pr main --template frontend
```

### Option 2: Local Development

```bash
# Clone or navigate to the repository
cd generate-pr-cli

# Install dependencies
npm install

# Set up your Google Gemini API key
cp .env.example .env
# Edit .env and add your Google Gemini API key

# Build the project
npm run build
```

## 🔧 Environment Variables

### Available Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

### .env File Setup

Create a `.env` file in your project root:

```bash
# Google Gemini API Key
# Get your API key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🤖 AI Model Configuration

The application uses `gemini-1.5-flash` for fast, high-quality results at a lower cost than other models.

## 📝 Template System

### Default Templates

#### 🎨 Frontend Template
Spanish template optimized for UI/UX changes:
```
Ticket: [Nombre del ticket y enlace]
Qué se hizo: [Descripción de lo que realizaste]
Datos necesarios para probar: [Datos requeridos]
Cómo probar: [Pasos detallados para probar]
Qué falta: [Tareas pendientes]
Capturas: [Capturas de pantalla]
```

#### ⚙️ Backend Template
Spanish template for API/database changes:
```
Ticket: [Nombre del ticket y enlace]
Qué se hizo: [Descripción de cambios realizados]
Migraciones: [Cambios en base de datos]
```

#### 📦 Custom Template
General-purpose English template for any type of change.

### ✨ Custom Templates
- Create and save your own templates
- Templates are stored locally in `templates.json`
- Use variables and placeholders in your templates
- Manage multiple personalized templates

### Template Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{TICKET_OR_SKIP}}` | Automatically replaced with user ticket or removed |

## 🌍 Language System

### Supported Languages

| Language | Code | Interface | Templates |
|----------|------|-----------|-----------|
| 🇺🇸 English | `en` | ✓ Full English | ✓ English templates |
| 🇪🇸 Español | `es` | ✓ Spanish interface | ✓ Spanish templates |

### Language Features

- **✅ Interface**: All menu options, prompts, and messages
- **✅ Templates**: Frontend, Backend, and Custom templates
- **✅ Help**: Complete documentation in selected language
- **✅ Error Messages**: Localized error reporting
- **✅ Validation**: API key and template validation messages

### Changing Language

```bash
# Interactive selection
generate-pr --language

# Direct selection
generate-pr --language en
generate-pr --language es
```

## 🏗️ Project Structure

```
generate-pr-cli/
├── src/
│   ├── index.ts       # CLI entry point & main flow
│   ├── git.ts         # Git operations (branch, diff)
│   ├── templates.ts   # PR template definitions
│   ├── ai.ts          # Google Gemini integration
│   ├── config.ts      # Configuration management
│   ├── languages.ts   # Multi-language support
│   └── types.ts       # TypeScript interfaces
├── docs/
│   └── README-full.md # This documentation
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies & scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Main documentation
```

## 🛠️ Development

### Local Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- develop

# Build for production
npm run build

# Run built version
npm start develop
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run in development mode |
| `npm start` | Run built version |
| `npm run test` | Run tests (placeholder) |

### Building for Production

```bash
# Clean build
npm run build

# Test the build
node dist/index.js --help

# Package for npm (dry run)
npm pack --dry-run
```

## 🔍 Troubleshooting

### Common Issues

#### "Failed to get current Git branch"
- Ensure you're in a Git repository
- Check that Git is installed: `git --version`

#### "Gemini API key not provided"
- Verify your `.env` file exists and contains `GEMINI_API_KEY`
- Check that the API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Try: `generate-pr --set-api-key`

#### "Target branch does not exist"
- Verify the target branch name is correct
- Run `git branch -a` to see all available branches

#### "Failed to initialize AI"
- Check your internet connection
- Verify the API key format (should start with "AIza")
- Ensure you have Node.js 16+ installed

### Debug Information

### Configuration Files

The CLI stores configuration in:
```
~/.generate-pr-cli/config.json
```

This file contains:
```json
{
  "apiKey": "your_saved_api_key",
  "language": "es"
}
```

### Logging and Debugging

The CLI provides detailed error messages for troubleshooting:

```bash
# Test API key
generate-pr --set-api-key

# Test connectivity
npx generate-pr-cli main --template frontend --output console

# Verbose output
DEBUG=true npm run dev -- main
```

## 🔧 Configuration Options

### Local Configuration

The CLI automatically saves your preferences:

- **API Key**: Stored securely in `~/.generate-pr-cli/config.json`
- **Language**: Default language preference
- **Custom Templates**: Saved in `./templates.json`

### Environment Setup

For development environments:

```bash
# Development .env
GEMINI_API_KEY=your_dev_api_key
NODE_ENV=development

# Production (if deploying)
GEMINI_API_KEY=your_prod_api_key
NODE_ENV=production
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow existing patterns, keep functions focused
2. **Testing**: Test changes thoroughly before submitting
3. **Documentation**: Update docs for new features
4. **Commit Messages**: Use descriptive commit messages

### Setting Up Development Environment

```bash
# Fork the repository
git clone https://github.com/yourusername/generate-pr-cli.git
cd generate-pr-cli

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Add your API key for testing

# Build the project
npm run build

# Run development mode
npm run dev -- main --template frontend
```

### Publishing Updates

```bash
# Update version
npm version patch/minor/major

# Build and test
npm run build
npm pack --dry-run

# Publish (when ready)
npm publish
```

## 📄 API Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

### Command Line Arguments

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `<target-branch>` | Yes | Git branch to compare against | `main` |
| `--template` | No | PR template type | `frontend` |
| `--ticket` | No | Jira/VSTS ticket | `"[BE-123] Fix"` |
| `--language` | No | Interface language | `en` |
| `--output` | No | Output method | `clipboard` |
| `--filename` | No | File output name | `pr.txt` |

### Template Structure

```typescript
interface PRTemplate {
  name: string;
  structure: string;
  language?: 'es' | 'en';
}
```

### Git Integration

The CLI automatically:
- Detects current Git branch
- Generates diff statistics
- Analyzes file changes
- Handles merge conflicts

---

**Ready to contribute?** Check the [Issues](https://github.com/ignaciojsoler/generate-pr-cli/issues) page!

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [npm CLI Package Documentation](https://docs.npmjs.com/cli/v8/commands/npm-pack)
- [Node.js CLI Best Practices](https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner)

---

Made with ❤️ for developers who love automation
