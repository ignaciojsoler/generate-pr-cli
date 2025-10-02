# 🚀 Generate PR CLI

A powerful CLI tool that automatically generates Pull Request descriptions based on Git diffs using AI. Built with Node.js, TypeScript, and Google Gemini.

## ✨ Features

- 🔍 **Automatic Git diff detection** - Analyzes changes between branches
- 🎨 **Multiple PR Templates** - Frontend, Backend, Custom templates + User templates
- ✨ **Custom Templates** - Create and save your own PR templates
- 🤖 **AI-powered descriptions** - Uses Google Gemini to generate professional PR descriptions in Spanish
- ✏️ **Interactive adjustments** - Iteratively refine the PR with AI assistance
- 📋 **Copy to clipboard** - One-click copy to clipboard
- 💾 **Save to file** - Export PR description as text file
- 🔧 **Template Management** - Add, edit, and manage custom templates
- 🎫 **Jira/VSTS Integration** - Optional ticket number inclusion in PR descriptions
- 💾 **Persistent API Key Storage** - Save API key locally for convenience
- 🎯 **Clean & modular** - Well-structured, maintainable codebase

## 📦 Installation

### Option 1: Local Development

```bash
# Clone or navigate to the repository
cd generate-pr-cli

# Install dependencies
npm install

# Set up your OpenAI API key
cp .env.example .env
# Edit .env and add your OpenAI API key

# Build the project
npm run build
```

### Option 2: Global Installation (after publishing)

```bash
npm install -g generate-pr-cli
```

## 🔑 Setup

1. Get your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

2. Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🚀 Usage

### Basic Usage

```bash
# Using npm script (development)
npm run dev -- <target-branch>

# Or after building
node dist/index.js <target-branch>

# Examples
npm run dev -- develop
npm run dev -- main
npm run dev -- staging
```

### Global Usage (if installed globally)

```bash
generate-pr <target-branch>

# Examples
generate-pr develop
generate-pr main
```

## 📖 How It Works

1. **Detect Current Branch** - Automatically detects your current Git branch
2. **Generate Diff** - Creates a diff between your branch and the target branch
3. **Select Template** - Choose from Frontend, Backend, or Custom templates
4. **AI Generation** - AI analyzes the diff and generates a professional PR description
5. **Interactive Menu** - Refine, copy, save, or finish

### Interactive Menu Options

- **📋 Copy to clipboard** - Instantly copy the PR description
- **💾 Save to file** - Save as a text file (default: `pr-description.txt`)
- **✏️ Request AI adjustments** - Ask AI to modify the description (e.g., "make it shorter", "add more technical details")
- **✅ Finish** - Exit the application

## 🏗️ Project Structure

```
generate-pr-cli/
├── src/
│   ├── index.ts       # CLI entry point & main flow
│   ├── git.ts         # Git operations (branch, diff)
│   ├── templates.ts   # PR template definitions
│   ├── ai.ts          # OpenAI integration
│   └── types.ts       # TypeScript interfaces
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies & scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## 🛠️ Development

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

## 📝 Templates

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

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

### AI Model

The application uses `gemini-2.0-flash` for fast, high-quality results at a lower cost than other models.

## 📋 Requirements

- Node.js 18+ (for ES Modules support)
- Git repository
- OpenAI API key
- npm or yarn

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the existing code style and clean code principles
2. Keep functions small and focused
3. Write descriptive commit messages
4. Test your changes thoroughly

## 📄 License

ISC

## 🙏 Acknowledgments

Built with:
- [Google Gemini](https://ai.google.dev/) - AI-powered PR generation
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive CLI prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Clipboardy](https://github.com/sindresorhus/clipboardy) - Clipboard operations

## 💡 Tips

- Ensure you're in a Git repository before running
- Make sure your changes are committed or staged for accurate diffs
- Use descriptive adjustment requests for better AI refinements
- Keep your Gemini API key secure and never commit it to version control
- Custom templates are saved locally - you can backup your `templates.json` file

## 🐛 Troubleshooting

### "Failed to get current Git branch"
- Ensure you're in a Git repository
- Check that Git is installed: `git --version`

### "Gemini API key not provided"
- Verify your `.env` file exists and contains `GEMINI_API_KEY`
- Check that the API key is valid

### "Target branch does not exist"
- Verify the target branch name is correct
- Run `git branch -a` to see all available branches

---

Made with ❤️ for developers who love automation

