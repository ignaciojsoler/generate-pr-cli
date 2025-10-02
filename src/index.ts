#!/usr/bin/env node

import { select, input } from '@inquirer/prompts';
import chalk from 'chalk';
import clipboard from 'clipboardy';
import { writeFile } from 'fs/promises';
import { config } from 'dotenv';
import { getCurrentBranch, getGitDiff } from './git.js';
import { getAllTemplateTypes, getTemplate, addUserTemplate } from './templates.js';
import { initializeAI, generatePRDescription, adjustPRDescription } from './ai.js';
import { loadApiKey, saveApiKey, clearApiKey } from './config.js';

config();

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
  console.clear();
  console.log(chalk.bold.cyan('\n🗑️  Clear Gemini API Key\n'));
  
  const currentKey = loadApiKey();
  
  if (!currentKey) {
    console.log(chalk.yellow('ℹ️  No API key found to clear.\n'));
    process.exit(0);
  }
  
  const confirmed = await input({
    message: 'Are you sure you want to clear your saved API key? (y/N):',
    default: 'N'
  });
  
  if (confirmed.toLowerCase() === 'y' || confirmed.toLowerCase() === 'yes') {
    clearApiKey();
    console.log(chalk.green('\n✅ API key cleared successfully!\n'));
    console.log(chalk.gray('You can set a new API key with: generate-pr --set-api-key\n'));
  } else {
    console.log(chalk.gray('\nOperation cancelled.\n'));
  }
}

function showHelp() {
  console.clear();
  console.log(chalk.bold.cyan('\n🚀 Generate PR CLI - Help\n'));
  
  console.log(chalk.bold('📖 Description:'));
  console.log(chalk.gray('   Automatically generates Pull Request descriptions based on Git diffs using AI'));
  console.log(chalk.gray('   Powered by Google Gemini for fast, accurate descriptions in Spanish\n'));

  console.log(chalk.bold('🔧 Usage:'));
  console.log(chalk.green('   npx generate-pr <target-branch>'));
  console.log(chalk.gray('   generate-pr <target-branch>  # if installed globally'));
  console.log(chalk.gray('   node dist/index.js <target-branch>  # run locally\n'));

  console.log(chalk.bold('⚙️  API Key Management:'));
  console.log(chalk.magenta('   generate-pr --set-api-key     # Set or update API key'));
  console.log(chalk.magenta('   generate-pr --clear-api-key   # Remove saved API key\n'));

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
  console.log(chalk.green('   • Make sure your changes are committed for accurate diffs'));
  console.log(chalk.green('   • Use descriptive ticket numbers (e.g., FE-123, BE-456)'));
  console.log(chalk.green('   • You can request AI adjustments after initial generation\n'));

  console.log(chalk.bold('🚨 Requirements:'));
  console.log(chalk.red('   • Git repository'));
  console.log(chalk.red('   • Gemini API key'));
  console.log(chalk.red('   • Changes between current and target branch\n'));

  console.log(chalk.bold('🔗 Links:'));
  console.log(chalk.yellow('   • GitHub: https://github.com/ignaciojsoler/generate-pr-cli'));
  console.log(chalk.yellow('   • Report issues: https://github.com/ignaciojsoler/generate-pr-cli/issues\n'));
  process.exit(0);
}

async function main() {
  console.clear();
  console.log(chalk.bold.cyan('\n🚀 PR Description Generator\n'));

  try {
    // Check for special commands
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
    }
    
    if (args.includes('--set-api-key')) {
      await setApiKey();
      return;
    }
    
    if (args.includes('--clear-api-key')) {
      await clearApiKeyCmd();
      return;
    }
    
    // Check if no arguments provided
    if (args.length === 0) {
      showHelp();
    }

    const targetBranch = args[0];
    
    if (!targetBranch) {
      console.log(chalk.red('❌ Error: Target branch is required'));
      console.log(chalk.yellow('\nUsage: npx generate-pr <target-branch>'));
      console.log(chalk.gray('Example: npx generate-pr develop'));
      console.log(chalk.gray('Help: npx generate-pr --help\n'));
      process.exit(1);
    }

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

    // Select template
    let templateType = await select({
      message: 'Select a PR template:',
      choices: getAllTemplateTypes()
    });

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

    // Ask for optional ticket
    console.log(chalk.yellow('\n🎫 Enter Jira/VSTS ticket number and title (optional):'));
    console.log(chalk.gray('Examples: [TKT-1234] My new feature\n'));
    
    const ticket = await input({
      message: 'Ticket number (leave empty to skip):',
      default: ''
    });

    if (ticket.trim()) {
      console.log(chalk.green(`✓ Using ticket: ${ticket}\n`));
    } else {
      console.log(chalk.gray('✓ No ticket provided\n'));
    }

    // Generate initial PR description
    console.log(chalk.gray('🤖 Generating PR description with AI...\n'));
    const prRequest = ticket.trim() 
      ? { diff, template, ticket: ticket.trim() }
      : { diff, template };
    
    let prDescription = await generatePRDescription(prRequest);

    // Interactive menu loop
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

  } catch (error) {
    console.log(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
