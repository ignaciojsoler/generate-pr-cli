import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { PRTemplate, TemplateType } from './types.js';
import { type Language } from './languages.js';
import { getLanguage } from './config.js';

const TEMPLATES_FILE = './templates.json';

// Spanish templates
const spanishTemplates: Record<TemplateType, PRTemplate> = {
  frontend: {
    name: 'Frontend',
    language: 'es',
    structure: `Usa EXACTAMENTE esta estructura para el PR Frontend:

**Ticket:** {{TICKET_OR_SKIP}}

**Qué se hizo:**
[Descripción detallada de los cambios realizados - usa puntos para cada cambio específico]

**Datos necesarios para probar:**
[Datos necesarios para probar la funcionalidad - lista con puntos]

**Cómo probar:**
[Pasos específicos para probar - lista con puntos numerados]

**Qué falta:**
[Tareas pendientes - lista con puntos]

**Capturas:**
[Si hay capturas de pantalla]

EJEMPLO:
**Ticket:** [FE-102] - Mejorar formulario de registro de usuarios

**Qué se hizo:**
- Se rediseñó el formulario de registro para que sea más intuitivo y responsive
- Se agregaron validaciones en tiempo real para los campos de email y contraseña
- Se implementó un indicador de fuerza de contraseña

**Datos necesarios para probar:**
- Un navegador moderno (Chrome, Firefox, Edge)
- Cuenta de prueba para verificar la validación de emails duplicados

**Cómo probar:**
- Abrir la página de registro en /register
- Intentar registrar un usuario con un email ya existente
- Completar todos los campos correctamente

**Qué falta:**
- Integrar con el endpoint real de registro
- Test unitarios para los componentes del formulario

**Capturas:**
[Imágenes aquí si aplica]`
  },

  backend: {
    name: 'Backend',
    language: 'es',
    structure: `Usa EXACTAMENTE esta estructura para el PR Backend:

**Ticket:** {{TICKET_OR_SKIP}}

**Qué se hizo:**
[Descripción detallada de los cambios realizados - usa puntos para cada cambio específico]

**Migraciones:**
[Si se modificaron migraciones - lista con puntos específicos]

EJEMPLO:
**Ticket:** [BE-58] - Endpoint para listar pedidos por usuario

**Qué se hizo:**
- Se creó un endpoint GET /orders/user/:userId para listar todos los pedidos de un usuario específico
- Se implementó la validación del userId y manejo de errores si no existen pedidos
- Se agregaron servicios y repositorios para manejar la consulta de manera eficiente usando TypeORM
- Se documentó el endpoint en Swagger

**Migraciones:**
- Se creó una nueva columna status en la tabla orders para indicar el estado del pedido (pending, shipped, delivered)`
  },

  custom: {
    name: 'Custom',
    language: 'es',
    structure: `Use EXACTLY this structure for the PR:

## 🎯 Purpose
Brief overview of what this PR accomplishes (2-3 sentences)

## 📝 Changes
[List main changes - use bullet points for specifics]

## 🧪 Testing
[Describe how changes were tested]

## 🔗 Related Issues
  
Keep description technical but readable.`
  }
};

// English templates
const englishTemplates: Record<TemplateType, PRTemplate> = {
  frontend: {
    name: 'Frontend',
    language: 'en',
    structure: `Use EXACTLY this structure for Frontend PR:

**Ticket:** {{TICKET_OR_SKIP}}

**What was done:**
[Detailed description of changes made - use bullet points for each specific change]

**Data needed to test:**
[Data needed to test functionality - list with bullet points]

**How to test:**
[Specific steps to test - numbered list with bullet points]

**What's missing:**
[Pending tasks - list with bullet points]

**Screenshots:**
[If there are screenshots]

EXAMPLE:
**Ticket:** [FE-102] - Improve user registration form

**What was done:**
- Redesigned registration form to be more intuitive and responsive
- Added real-time validation for email and password fields
- Implemented password strength indicator

**Data needed to test:**
- Modern browser (Chrome, Firefox, Edge)
- Test account to verify duplicate email validation

**How to test:**
- Open registration page at /register
- Try to register user with existing email
- Complete all fields correctly

**What's missing:**
- Integrate with real registration endpoint
- Unit tests for form components

**Screenshots:**
[Images here if applicable]`
  },

  backend: {
    name: 'Backend',
    language: 'en',
    structure: `Use EXACTLY this structure for Backend PR:

**Ticket:** {{TICKET_OR_SKIP}}

**What was done:**
[Detailed description of changes made - use bullet points for each specific change]

**Migrations:**
[If migrations were modified - list with specific bullet points]

EXAMPLE:
**Ticket:** [BE-58] - User orders listing endpoint

**What was done:**
- Created GET /orders/user/:userId endpoint to list all orders for specific user
- Implemented userId validation and error handling for non-existent orders
- Added services and repositories to handle query efficiently using TypeORM
- Documented endpoint in Swagger

**Migrations:**
- Added new status column in orders table to indicate order state (pending, shipped, delivered)`
  },

  custom: {
    name: 'Custom',
    language: 'en',
    structure: `Use EXACTLY this structure for PR:

## 🎯 Purpose
Brief overview of what this PR accomplishes (2-3 sentences)

## 📝 Changes
[List main changes - use bullet points for specifics]

## 🧪 Testing
[Describe how changes were tested]

## 🔗 Related Issues
  
Keep description technical but readable.`
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

function getTemplatesByLanguage(language: Language): Record<TemplateType, PRTemplate> {
  return language === 'en' ? englishTemplates : spanishTemplates;
}

export function getTemplate(type: TemplateType | string): PRTemplate {
  const currentLanguage = getLanguage() as Language;
  const templates = getTemplatesByLanguage(currentLanguage);
  
  if (type in templates) {
    return templates[type as TemplateType];
  }
  
  const userTemplates = loadUserTemplates();
  if (userTemplates[type]) {
    return userTemplates[type];
  }
  
  throw new Error(`Template "${type}" not found`);
}

export function getAllTemplateTypes(): Array<{ name: string; value: string }> {
  const currentLanguage = getLanguage() as Language;
  const userTemplates = loadUserTemplates();
  
  const translations = {
    es: {
      frontend: '🎨 Frontend - Cambios UI/UX',
      backend: '⚙️  Backend - Cambios API/Database',
      custom: '📦 Personalizado - Propósito general',
      userTemplate: 'Plantilla personalizada',
      createNew: '➕ Crear nueva plantilla personalizada'
    },
    en: {
      frontend: '🎨 Frontend - UI/UX changes',
      backend: '⚙️  Backend - API/Database changes',
      custom: '📦 Custom - General purpose',
      userTemplate: 'User template',
      createNew: '➕ Create new custom template'
    }
  };
  
  const t = translations[currentLanguage];
  
  const choices = [
    { name: t.frontend, value: 'frontend' },
    { name: t.backend, value: 'backend' },
    { name: t.custom, value: 'custom' }
  ];
  
  // Add user templates
  Object.keys(userTemplates).forEach(templateName => {
    choices.push({
      name: `✨ ${templateName} - ${t.userTemplate}`,
      value: templateName
    });
  });
  
  choices.push({ name: t.createNew, value: 'create-new' });
  
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

