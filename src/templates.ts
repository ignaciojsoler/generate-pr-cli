import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { PRTemplate, TemplateType } from './types.js';

const TEMPLATES_FILE = './templates.json';

// Default templates
const defaultTemplates: Record<TemplateType, PRTemplate> = {
  frontend: {
    name: 'Frontend',
    structure: `You are a technical writer creating a Pull Request description for a frontend change.

Analyze the Git diff provided and generate a **concise, professional PR description** following this exact structure in Spanish:

**Ticket:** {{TICKET_OR_SKIP}}
**Qué se hizo:** [Descripción de lo que realizaste]
**Datos necesarios para probar:** [Proporciona una lista de los datos necesarios para probar la funcionalidad, si aplica]
**Cómo probar:** [Enumera todos los pasos necesarios para probar la funcionalidad. Sé lo más descriptivo posible]
**Qué falta:** [Deja una lista de las cosas pendientes por hacer en el PR, si aplica]
**Capturas:** [Capturas de pantalla]

Use {{TICKET_OR_SKIP}} placeholder: if ticket is provided, show "Ticket: [ticket]", if not provided, skip this line entirely.
`
  },

  backend: {
    name: 'Backend',
    structure: `You are a technical writer creating a Pull Request description for a backend change.

Analyze the Git diff provided and generate a **concise, professional PR description** following this exact structure in Spanish:

**Ticket:** {{TICKET_OR_SKIP}}
**Qué se hizo:** [Descripción de los cambios realizados (nuevas funciones, refactorización, migraciones, etc.)]
**Migraciones:** [¿Se agregaron o modificaron migraciones? Explica qué cambios se hicieron en la base de datos]

Use {{TICKET_OR_SKIP}} placeholder: if ticket is provided, show "Ticket: [ticket]", if not provided, skip this line entirely.
`
  },

  custom: {
    name: 'Custom',
    structure: `You are a technical writer creating a Pull Request description.

Analyze the Git diff provided and generate a **concise, professional PR description** following this structure:

## 🎯 Purpose
Brief overview of what this PR accomplishes (2-3 sentences)

## 📝 Changes
- List the main changes made
- Be specific about what was added, modified, or removed
- Group related changes together

## 🧪 Testing
- Describe how these changes were tested
- Mention any edge cases covered

## 🔗 Related Issues
_List any related issue numbers_

Keep the description technical but readable, around 200-300 words total.`
  }
};

function loadUserTemplates(): Record<string, PRTemplate> {
  if (!existsSync(TEMPLATES_FILE)) {
    return {};
  }
  
  try {
    const data = readFileSync(TEMPLATES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('Warning: Could not load user templates, using defaults only');
    return {};
  }
}

function saveUserTemplate(name: string, template: PRTemplate): void {
  const userTemplates = loadUserTemplates();
  userTemplates[name] = template;
  
  try {
    writeFileSync(TEMPLATES_FILE, JSON.stringify(userTemplates, null, 2), 'utf-8');
  } catch (error) {
    throw new Error('Failed to save user template');
  }
}

export function getTemplate(type: TemplateType | string): PRTemplate {
  if (type in defaultTemplates) {
    return defaultTemplates[type as TemplateType];
  }
  
  const userTemplates = loadUserTemplates();
  if (userTemplates[type]) {
    return userTemplates[type];
  }
  
  throw new Error(`Template "${type}" not found`);
}

export function getAllTemplateTypes(): Array<{ name: string; value: string }> {
  const userTemplates = loadUserTemplates();
  
  const choices = [
    { name: '🎨 Frontend - Cambios UI/UX', value: 'frontend' },
    { name: '⚙️  Backend - Cambios API/Database', value: 'backend' },
    { name: '📦 Personalizado - Propósito general', value: 'custom' }
  ];
  
  // Add user templates
  Object.keys(userTemplates).forEach(templateName => {
    choices.push({
      name: `✨ ${templateName} - Plantilla personalizada`,
      value: templateName
    });
  });
  
  choices.push({ name: '➕ Crear nueva plantilla personalizada', value: 'create-new' });
  
  return choices;
}

export function addUserTemplate(name: string, structure: string): void {
  const template: PRTemplate = {
    name,
    structure
  };
  
  saveUserTemplate(name, template);
}

export function deleteUserTemplate(name: string): void {
  const userTemplates = loadUserTemplates();
  delete userTemplates[name];
  
  try {
    writeFileSync(TEMPLATES_FILE, JSON.stringify(userTemplates, null, 2), 'utf-8');
  } catch (error) {
    throw new Error('Failed to delete user template');
  }
}

export function getUserTemplates(): Record<string, PRTemplate> {
  return loadUserTemplates();
}

