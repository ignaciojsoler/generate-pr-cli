#!/usr/bin/env node

import { select, input } from '@inquirer/prompts';
import { parseArgs } from 'util';
import chalk from 'chalk';
import clipboard from 'clipboardy';
import { writeFile } from 'fs/promises';
import { config } from 'dotenv';
import { getCurrentBranch, getGitDiff } from './git.js';
import { getAllTemplateTypes, getTemplate, addUserTemplate } from './templates.js';
import { initializeAI, generatePRDescription, adjustPRDescription } from './ai.js';
import { loadApiKey, saveApiKey, clearApiKey, setLanguage, getLanguage } from './config.js';
import { SUPPORTED_LANGUAGES, getTranslation, type Language } from './languages.js';

config();

// CLI Arguments interface
interface CLIArgs {
  targetBranch?: string | undefined;
  template?: string | undefined;
  ticket?: string | undefined;
  language?: 'es' | 'en' | undefined;
  output?: 'clipboard' | 'file' | 'console' | undefined;
  filename?: string | undefined;
  apiKey?: string | undefined;
  help?: boolean | undefined;
  setApiKey?: boolean | undefined;
  clearApiKey?: boolean | undefined;
  changeLanguage?: boolean | undefined;
}

function parseCLIArgs(): CLIArgs {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      'target-branch': {
        type: 'string',
        short: 'b'
      },
      'template': {
        type: 'string',
        short: 't'
      },
      'ticket': {
        type: 'string'
      },
      'language': {
        type: 'string',
        short: 'l'
      },
      'output': {
        type: 'string',
        short: 'o'
      },
      'filename': {
        type: 'string',
        short: 'f'
      },
      'api-key': {
        type: 'string'
      },
      'help': {
        type: 'boolean',
        short: 'h'
      },
      'set-api-key': {
        type: 'boolean'
      },
      'clear-api-key': {
        type: 'boolean'
      },
      'lang': {
        type: 'string'
      }
    },
    allowPositionals: true
  });

  // Determine language
  let language: 'es' | 'en' | undefined = undefined;
  if (values['language']) {
    language = values['language'] as 'es' | 'en';
  } else if (values.lang) {
    language = values.lang as 'es' | 'en';
  }

  // Determine if it's just changing language  
  const changeLanguage = !!values.lang || !!values['language'] && !values.template && !values.ticket && !values.output && !positionals?.[0];

  return {
    targetBranch: positionals?.[0] as string | undefined,
    template: values.template,
    ticket: values.ticket,
    language,
    output: values.output as 'clipboard' | 'file' | 'console' | undefined,
    filename: values.filename,
    apiKey: values['api-key'],
    help: !!values.help,
    setApiKey: !!values['set-api-key'],
    clearApiKey: !!values['clear-api-key'],
    changeLanguage,
  };
}

async function setApiKey() {
  console.clear();
  console.log(chalk.bold.cyan('\n🔑 Set Gemini API Key\n'));
  
  console.log(chalk.yellow('📍 Get your API key from: https://aistudio.google.com/app/apikey\n'));
  
  const apiKey = await input({
    message: 'Enter your Gemini API key:'
  });
  
  try {
    // Validate the API key by initializing AI
    await initializeAI(apiKey);
    saveApiKey(apiKey);
    console.log(chalk.green('\n✅ API key saved successfully!\n'));
  } catch (error) {
    console.log(chalk.red('\n❌ Invalid API key:'), error instanceof Error ? error.message : 'Unknown error');
    console.log(chalk.yellow('\n💡 Make sure you have a valid Gemini API key from https://aistudio.google.com/app/apikey\n'));
    process.exit(1);
  }
}

async function clearApiKeyCmd() {
  const currentLanguage = getLanguage() as Language;
  
  console.clear();
  console.log(chalk.bold.cyan(`\n${getTranslation('clearApiKey', currentLanguage)}\n`));
  
  const currentKey = loadApiKey();
  
  if (!currentKey) {
    console.log(chalk.yellow(`${(getTranslation('noApiKeyToClear', currentLanguage))}\n`));
    process.exit(0);
  }
  
  const confirmed = await input({
    message: getTranslation('confirmClearApiKey', currentLanguage),
    default: getTranslation('defaultNo', currentLanguage)
  });
  
  if (confirmed.toLowerCase() === 'y' || confirmed.toLowerCase() === 'yes' || confirmed.toLowerCase() === 's' || confirmed.toLowerCase() === 'si') {
    clearApiKey();
    console.log(chalk.green(`\n${getTranslation('apiKeyCleared', currentLanguage)}\n`));
    console.log(chalk.gray(`${getTranslation('setup', currentLanguage)}: generate-pr --set-api-key\n`));
  } else {
    console.log(chalk.gray(`\n${getTranslation('operationCancelled', currentLanguage)}\n`));
  }
}

async function changeLanguage() {
  console.clear();
  console.log(chalk.bold.cyan('\n🌍 Select Language / Seleccionar Idioma\n'));
  
  const language = await select({
    message: 'Choose your preferred language / Elige tu idioma preferido:',
    choices: SUPPORTED_LANGUAGES.map(lang => ({
      name: `${lang.flag} ${lang.name}`,
      value: lang.code
    }))
  }) as Language;
  
  setLanguage(language);
  
  const translation = getTranslation('success', language);
  console.log(chalk.green(`\n${translation} Language set to ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.name}\n`));
}

function showHelp() {
  const currentLanguage = getLanguage() as Language;
  
  console.clear();
  console.log(chalk.bold.cyan(`\n${getTranslation('cliHelp', currentLanguage)}\n`));
  
  console.log(chalk.bold('📖 Description:'));
  console.log(chalk.gray('   Automatically generates Pull Request descriptions based on Git diffs using AI'));
  console.log(chalk.gray('   Powered by Google Gemini for fast, accurate descriptions in Spanish\n'));

  console.log(chalk.bold('🔧 Usage:'));
  console.log(chalk.green('   npx generate-pr <target-branch>'));
  console.log(chalk.gray('   generate-pr <target-branch>  # if installed globally'));
  console.log(chalk.gray('   node dist/index.js <target-branch>  # run locally\n'));

  console.log(chalk.bold('⚡ Quick Commands / Comandos Rápidos:'));
  console.log(chalk.green('   generate-pr main --template frontend                    # PR Frontend con template'));
  console.log(chalk.green('   generate-pr develop --template backend --ticket BE-123  # PR Backend con ticket'));
  console.log(chalk.green('   generate-pr main --language en --output clipboard       # Inglés + clipboard'));
  console.log(chalk.green('   generate-pr develop --template custom -o file -f pr.txt # Custom template + archivo\n'));

  console.log(chalk.bold('📋 Detailed Options / Opciones Detalladas:'));
  console.log(chalk.cyan('   --template <type>              # Template: frontend, backend, custom'));
  console.log(chalk.cyan('   --ticket <number>             # Ticket number (e.g., FE-123)'));
  console.log(chalk.cyan('   --language <lang>              # Language: es, en'));
  console.log(chalk.cyan('   --output <option>              # Output: clipboard, file, console'));
  console.log(chalk.cyan('   --filename <name>              # Filename for file output\n'));

  console.log(chalk.bold('⚙️  API Key Management:'));
  console.log(chalk.magenta('   generate-pr --set-api-key     # Set or update API key'));
  console.log(chalk.magenta('   generate-pr --clear-api-key   # Remove saved API key'));
  console.log(chalk.magenta('   generate-pr --language        # Change language / Cambiar idioma\n'));

  console.log(chalk.bold('📋 Examples:'));
  console.log(chalk.yellow('   npx generate-pr develop'));
  console.log(chalk.yellow('   npx generate-pr main'));
  console.log(chalk.yellow('   npx generate-pr staging\n'));

  console.log(chalk.bold('🎨 Templates:'));
  console.log(chalk.magenta('   🎨 Frontend - For UI/UX changes'));
  console.log(chalk.gray('      Includes: Ticket, Qué se hizo, Datos para probar, Cómo probar, Qué falta, Capturas'));
  console.log(chalk.magenta('   ⚙️  Backend - For API/Database changes'));
  console.log(chalk.gray('      Includes: Ticket, Qué se hizo, Migraciones'));
  console.log(chalk.magenta('   📦 Custom - General purpose'));
  console.log(chalk.magenta('   ✨ User Templates - Create your own\n'));

  console.log(chalk.bold('🎫 Features:'));
  console.log(chalk.blue('   • Automatic Git diff detection'));
  console.log(chalk.blue('   • Jira/VSTS ticket integration (optional)'));
  console.log(chalk.blue('   • Persistent API key storage'));
  console.log(chalk.blue('   • Interactive PR refinement'));
  console.log(chalk.blue('   • Copy to clipboard & save to file'));
  console.log(chalk.blue('   • Custom template creation\n'));

  console.log(chalk.bold('🔑 Setup:'));
  console.log(chalk.cyan('   1. Get Gemini API key: https://aistudio.google.com/app/apikey'));
  console.log(chalk.cyan('   2. Set your API key: generate-pr --set-api-key'));
  console.log(chalk.cyan('   3. Your API key is saved securely for future use\n'));

  console.log(chalk.bold('💡 Tips:'));
  console.log(chalk.green('   • Ensure you\'re in a Git repository'));
  console.log(chalk.green('   • Change language anytime with: generate-pr --language'));
  console.log(chalk.green('   • Use descriptive ticket numbers (e.g., FE-123, BE-456)'));
  console.log(chalk.green('   • You can request AI adjustments after initial generation\n'));

  console.log(chalk.bold('🚨 Requirements:'));
  console.log(chalk.red('   • Git repository'));
  console.log(chalk.red('   • Gemini API key'));
  console.log(chalk.red('   • Changes between current and target branch\n'));

  console.log(chalk.bold('🔗 Links:'));
  console.log(chalk.yellow('   • GitHub: https://github.com/ignaciojsoler/generate-pr-cli'));
  console.log(chalk.yellow('   • Report issues: https://github.com/ignaciojsoler/generate-pr-cli/issues\n'));
  
  console.log(chalk.gray('Made with ❤️ for lazy developers'));
  console.log(chalk.bold('Supported languages: English (en) | Español (es)'));
  process.exit(0);
}

async function main() {
  console.clear();
  console.log(chalk.bold.cyan('\n🚀 PR Description Generator\n'));

  try {
    // Parse CLI arguments
    const cliArgs = parseCLIArgs();

    if (cliArgs.help) {
      showHelp();
    }

    if (cliArgs.setApiKey) {
      await setApiKey();
      return;
    }

    if (cliArgs.clearApiKey) {
      await clearApiKeyCmd();
      return;
    }

    // Set language if provided via CLI (priority check)
    if (cliArgs.language) {
      setLanguage(cliArgs.language);
      console.log(chalk.green(`✅ Language set to: ${cliArgs.language}\n`));
      if (!cliArgs.targetBranch) {
        return; // Just changing language if no target branch
      }
    } else if (cliArgs.changeLanguage) {
      await changeLanguage();
      return;
    }

    // Check if no target branch provided
    if (!cliArgs.targetBranch) {
      showHelp();
      return;
    }

    const targetBranch = cliArgs.targetBranch;

    // Check for saved API key or request new one
    let apiKey = loadApiKey();
    
    if (!apiKey) {
      console.log(chalk.red('❌ Gemini API key required'));
      console.log(chalk.yellow('\n🔑 Please set your GEMINI_API_KEY:'));
      console.log(chalk.gray('Get your API key from: https://aistudio.google.com/app/apikey'));
      console.log(chalk.gray('The API key will be saved locally for future use.\n'));
      
      apiKey = await input({
        message: 'Enter your Gemini API key:'
      });
      
      try {
        await initializeAI(apiKey);
        saveApiKey(apiKey);
        console.log(chalk.green('✅ API key configured and saved successfully\n'));
      } catch (initError) {
        console.log(chalk.red('❌ Invalid API key:'), initError instanceof Error ? initError.message : 'Unknown error');
        console.log(chalk.yellow('\n💡 Make sure you have a valid Gemini API key from https://aistudio.google.com/app/apikey\n'));
        process.exit(1);
      }
    } else {
      try {
        await initializeAI(apiKey);
        console.log(chalk.green('✅ Gemini API key loaded\n'));
      } catch (error) {
        console.log(chalk.red('❌ Invalid saved API key, please re-enter:'));
        console.log(chalk.yellow('\n🔑 Please set your GEMINI_API_KEY:'));
        console.log(chalk.gray('Get your API key from: https://aistudio.google.com/app/apikey\n'));
        
        const newApiKey = await input({
          message: 'Enter your Gemini API key:'
        });
        
        try {
          await initializeAI(newApiKey);
          saveApiKey(newApiKey);
          console.log(chalk.green('✅ API key configured and saved successfully\n'));
        } catch (initError) {
          console.log(chalk.red('❌ Invalid API key:'), initError instanceof Error ? initError.message : 'Unknown error');
          console.log(chalk.yellow('\n💡 Make sure you have a valid Gemini API key from https://aistudio.google.com/app/apikey\n'));
          process.exit(1);
        }
      }
    }

    // Get current branch
    const currentBranch = await getCurrentBranch();
    console.log(chalk.blue(`📍 Current branch: ${chalk.bold(currentBranch)}`));
    console.log(chalk.blue(`🎯 Target branch: ${chalk.bold(targetBranch)}\n`));

    // Generate Git diff
    console.log(chalk.gray('Generating diff...'));
    const diff = await getGitDiff(targetBranch);

    if (!diff.diffStat) {
      console.log(chalk.yellow('⚠️  No changes detected between branches\n'));
      process.exit(0);
    }

    console.log(chalk.green('✓ Diff generated successfully\n'));
    console.log(chalk.gray('Diff statistics:'));
    console.log(chalk.gray(diff.diffStat));
    console.log();

    // Select template (CLI arg or interactive)
    let templateType: string;
    
    if (cliArgs.template) {
      templateType = cliArgs.template;
      console.log(chalk.green(`✓ Using template: ${templateType}\n`));
      
      // Validate template
      const validTypes = ['frontend', 'backend', 'custom'];
      if (!validTypes.includes(templateType)) {
        console.log(chalk.red('❌ Invalid template type. Valid options: frontend, backend, custom\n'));
        process.exit(1);
      }
    } else {
      templateType = await select({
        message: 'Select a PR template:',
        choices: getAllTemplateTypes()
      });
    }

    let template;
    
    if (templateType === 'create-new') {
      // Create new custom template
      const templateName = await input({
        message: 'Enter template name:'
      });
      
      console.log(chalk.gray('\nEnter the template structure (define how the AI should generate the PR description):'));
      console.log(chalk.gray('You can use placeholders like [content], [details], etc.\n'));
      
      const templateStructure = await input({
        message: 'Template structure:',
        default: 'Generate a PR description with the following sections:\n\n**Ticket:** [Ticket name and link]\n**Qué se hizo:** [Description of changes]\n**Details:** [Additional details]'
      });
      
      addUserTemplate(templateName, templateStructure);
      template = getTemplate(templateName);
      
      console.log(chalk.green(`\n✓ Created and using custom template: ${templateName}\n`));
    } else {
      template = getTemplate(templateType);
      console.log(chalk.green(`\n✓ Using ${template.name} template\n`));
    }

    // Ticket input (CLI arg or interactive)
    let ticket: string;
    
    if (cliArgs.ticket) {
      ticket = cliArgs.ticket;
      console.log(chalk.green(`✓ Using ticket: ${ticket}\n`));
    } else {
      console.log(chalk.yellow('\n🎫 Enter Jira/VSTS ticket number and title (optional):'));
      console.log(chalk.gray('Examples: [TKT-1234] My new feature\n'));
      
      ticket = await input({
        message: 'Ticket number (leave empty to skip):',
        default: ''
      });

      if (ticket.trim()) {
        console.log(chalk.green(`✓ Using ticket: ${ticket}\n`));
      } else {
        console.log(chalk.gray('✓ No ticket provided\n'));
      }
    }

    // Generate initial PR description
    console.log(chalk.gray('🤖 Generating PR description with AI...\n'));
    const prRequest = ticket.trim() 
      ? { diff, template, ticket: ticket.trim() }
      : { diff, template };
    
    let prDescription = await generatePRDescription(prRequest);

    // Handle output (CLI arg or interactive)
    if (cliArgs.output) {
      // CLI mode - direct output
      console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      console.log(chalk.bold('Generated PR Description:\n'));
      console.log(prDescription);
      console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      switch (cliArgs.output) {
        case 'clipboard':
          await clipboard.write(prDescription);
          console.log(chalk.green('\n✓ Copied to clipboard!\n'));
          break;

        case 'file':
          const filename = cliArgs.filename || 'pr-description.txt';
          await writeFile(filename, prDescription, 'utf-8');
          console.log(chalk.green(`\n✓ Saved to ${filename}\n`));
          break;

        case 'console':
          console.log(chalk.green('\n✓ Output to console!\n'));
          break;
      }
      
      console.log(chalk.green('\n✨ Done! Thank you for using PR Description Generator\n'));
    } else {
      // Interactive mode
      let continueLoop = true;
      
      while (continueLoop) {
        console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
        console.log(chalk.bold('Generated PR Description:\n'));
        console.log(prDescription);
        console.log(chalk.bold.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        const action = await select({
          message: 'What would you like to do?',
          choices: [
            { name: '📋 Copy to clipboard', value: 'copy' },
            { name: '💾 Save to file', value: 'save' },
            { name: '✏️  Request AI adjustments', value: 'adjust' },
            { name: '✅ Finish', value: 'finish' }
          ]
        });

        switch (action) {
          case 'copy':
            await clipboard.write(prDescription);
            console.log(chalk.green('\n✓ Copied to clipboard!\n'));
            break;

          case 'save':
            const filename = await input({
              message: 'Enter filename:',
              default: 'pr-description.txt'
            });
            await writeFile(filename, prDescription, 'utf-8');
            console.log(chalk.green(`\n✓ Saved to ${filename}\n`));
            break;

          case 'adjust':
            const adjustmentRequest = await input({
              message: 'What changes would you like? (e.g., "make it shorter", "add more details about migrations")'
            });
            
            console.log(chalk.gray('\n🤖 Adjusting PR description...\n'));
            prDescription = await adjustPRDescription(prDescription, adjustmentRequest);
            console.log(chalk.green('✓ PR description updated!\n'));
            break;

          case 'finish':
            continueLoop = false;
            console.log(chalk.green('\n✨ Done! Thank you for using PR Description Generator\n'));
            break;
        }
      }
    }

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
