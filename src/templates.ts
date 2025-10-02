import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { PRTemplate, TemplateType } from './types.js';

const TEMPLATES_FILE = './templates.json';

// Default templates
const defaultTemplates: Record<TemplateType, PRTemplate> = {
  frontend: {
    name: 'Frontend',
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

