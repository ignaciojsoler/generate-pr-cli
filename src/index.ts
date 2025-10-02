#!/usr/bin/env node

import { select, input } from '@inquirer/prompts';
import chalk from 'chalk';
import clipboard from 'clipboardy';
import { writeFile } from 'fs/promises';
import { config } from 'dotenv';
import { getCurrentBranch, getGitDiff } from './git.js';
import { getAllTemplateTypes, getTemplate, addUserTemplate } from './templates.js';
import { initializeAI, generatePRDescription, adjustPRDescription } from './ai.js';
import { loadApiKey, saveApiKey } from './config.js';

config();

async function main() {
  console.clear();
  console.log(chalk.bold.cyan('\n🚀 PR Description Generator\n'));

  try {
    // Get target branch from command line argument
    const targetBranch = process.argv[2];
    
    if (!targetBranch) {
      console.log(chalk.red('❌ Error: Target branch is required'));
      console.log(chalk.yellow('\nUsage: npx generate-pr <target-branch>'));
      console.log(chalk.gray('Example: npx generate-pr develop\n'));
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
    console.log(chalk.yellow('\n🎫 Enter Jira/VSTS ticket (optional):'));
    console.log(chalk.gray('Examples: MIES2-1234, CNP-123, PROJ-456\n'));
    
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
