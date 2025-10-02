export type Language = 'es' | 'en';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export const TRANSLATIONS = {
  es: {
    // CLI Headers
    appTitle: '🚀 Generador de Descripción de PR',
    cliHelp: '🚀 Generate PR CLI - Ayuda',
    
    // Commands
    setApiKey: '🔑 Configurar API Key de Gemini',
    clearApiKey: '🗑️  Limpiar API Key de Gemini',
    
    // Common Messages
    description: 'Genera automáticamente descripciones de Pull Request basadas en diffs de Git usando IA',
    poweredBy: 'Alimentado por Google Gemini para descripciones rápidas y precisas en español',
    
    // Usage
    usage: 'Uso:',
    globalUsage: 'Si está instalado globalmente',
    localUsage: 'en modo local',
    examples: 'Ejemplos:',
    
    // API Key Management
    apiKeyManagement: '⚙️  Gestión de API Key:',
    setApiKeyCommand: 'generar-pr --set-api-key',
    setApiKeyDesc: '# Establecer o actualizar API key',
    clearApiKeyCommand: 'generar-pr --clear-api-key',
    clearApiKeyDesc: '# Eliminar API key guardada',
    
    // Templates
    templates: '🎨 Plantillas:',
    frontendTemplate: '🎨 Frontend - Para cambios de UI/UX',
    frontendIncludes: 'Incluye: Ticket, Qué se hizo, Datos para probar, Cómo probar, Qué falta, Capturas',
    backendTemplate: '⚙️  Backend - Para cambios de API/Database',
    backendIncludes: 'Incluye: Ticket, Qué se hizo, Migraciones',
    customTemplate: '📦 Personalizado - Propósito general',
    userTemplates: '✨ Plantillas de Usuario - Crea las tuyas propias',
    
    // Features
    features: '🎫 Características:',
    automaticDetection: '• Detección automática de diff de Git',
    ticketIntegration: '• Integración con tickets Jira/VSTS (opcional)',
    persistentStorage: '• Almacenamiento persistente de API key',
    interactiveRefinement: '• Refinamiento interactivo de PR',
    clipboardCopy: '• Copiar al portapapeles y guardar archivo',
    customTemplates: '• Creación de plantillas personalizadas',
    
    // Setup
    setup: '🔑 Configuración:',
    getApiKey: 'Obtén tu API key de Gemini: https://aistudio.google.com/app/apikey',
    setApiKeyStep: 'Establece tu API key: generar-pr --set-api-key',
    savedSecurely: 'Tu API key se guarda de forma segura para uso futuro',
    
    // Tips
    tips: '💡 Consejos:',
    tip1: '• Asegúrate de estar en un repositorio Git',
    tip2: '• Asegúrate de que tus cambios estén confirmados para diffs precisos',
    tip3: '• Usa números de ticket descriptivos (ej.: FE-123, BE-456)',
    tip4: '• Puedes solicitar ajustes de IA después de la generación inicial',
    
    // Requirements
    requirements: '🚨 Requisitos:',
    req1: '• Repositorio Git',
    req2: '• API key de Gemini',
    req3: '• Cambios entre el branch actual y el destino',
    
    // Links
    links: '🔗 Enlaces:',
    github: '• GitHub: https://github.com/ignaciojsoler/generate-pr-cli',
    issues: '• Reportar problemas: https://github.com/ignaciojsoler/generate-pr-cli/issues',
    
    // Footer
    footer: 'Hecho con ❤️ para desarrolladores que aman la automación',
    
    // API Key Messages
    apiKeyRequired: '❌ API key de Gemini requerida',
    apiKeyFromUrl: '📍 Obtén tu API key de: https://aistudio.google.com/app/apikey',
    apiKeySavedLocally: 'La API key se guardará localmente para uso futuro.',
    apiKeyPrompt: 'Ingresa tu API key de Gemini:',
    api_key_saved_successfully: '✅ API key configurada y guardada exitosamente',
    api_key_loaded: '✅ API key de Gemini cargada',
    invalid_api_key: '❌ API key inválida, por favor ingresa otra:',
    
    // Branch Messages
    currentBranch: '📍 Branch actual:',
    targetBranch: '🎯 Branch destino:',
    noChangesDetected: '⚠️  No se detectaron cambios entre branches',
    targetBranchNotFound: '❌ El branch destino "{branch}" no existe',
    failedToGenerateDiff: 'Error al generar diff de Git: {error}',
    diffGeneratedSuccessfully: '✓ Diff generado exitosamente',
    
    // Ticket Messages
    ticketPrompt: '🎫 Ingresa número y título del ticket Jira/VSTS (opcional):',
    ticketExamples: 'Ejemplos: [TKT-1234] Mi nueva funcionalidad',
    ticketInput: 'Número del ticket (deja vacío para omitir):',
    ticketConfirmed: '✓ Usando ticket: {ticket}',
    noTicketProvided: '✓ No se proporcionó ticket',
    
    // Template Messages
    selectTemplate: 'Selecciona una plantilla PR:',
    usingTemplate: '✓ Usando plantilla {template}',
    createCustomTemplate: '➕ Crear nueva plantilla personalizada',
    
    // AI Messages
    generatingDescription: '🤖 Generando descripción de PR con IA...',
    
    // Interactive Menu
    copyToClipboard: '📋 Copiar al portapapeles',
    saveToFile: '💾 Guardar en archivo',
    requestAdjustments: '✏️  Solicitar ajustes de IA',
    finish: '✅ Terminar',
    whatWouldYouLikeToDo: '¿Qué te gustaría hacer?',
    copiedToClipboard: '✓ ¡Copiado al portapapeles!',
    
    // File Operations
    enterFilename: 'Ingresa nombre de archivo:',
    savedToFile: '✓ Guardado en {filename}',
    filenameDefault: 'descripcion-pr.txt',
    
    // Adjustments
    adjustmentPrompt: '¿Qué cambios te gustaría? (ej.: "hazlo más corto", "añade más detalles sobre migraciones")',
    adjustingDescription: '🤖 Ajustando descripción de PR...',
    descriptionUpdated: '✓ ¡Descripción de PR actualizada!',
    
    // Custom Templates
    templateNamePrompt: 'Ingresa nombre de plantilla:',
    templateStructurePrompt: 'Estructura de plantilla:',
    templateStructureDefault: 'Genera una descripción de PR con las siguientes secciones:',
    customTemplateCreated: '✓ Creada y usando plantilla personalizada: {name}',
    
    // Errors
    invalidApiKeyFormat: 'Formato de API key inválido. Las API keys de Gemini deben empezar con "AIza" y ser mínimo 30 caracteres.',
    errorGeneric: '❌ Error:',
    failedToGenerateDescription: 'Error al generar descripción de PR: {error}',
    failedToAdjustDescription: 'Error al ajustar descripción de PR: {error}',
    
    // Confirmation
    confirmClearApiKey: '¿Estás seguro de que quieres limpiar tu API key guardada? (s/N):',
    defaultNo: 'N',
    apiKeyCleared: '✅ API key limpiada exitosamente!',
    noApiKeyToClear: 'ℹ️  No se encontró API key para limpiar.',
    operationCancelled: 'Operación cancelada.',
    
    // Common Status
    success: '✓'
  },
  
  en: {
    // CLI Headers
    appTitle: '🚀 PR Description Generator',
    cliHelp: '🚀 Generate PR CLI - Help',
    
    // Commands
    setApiKey: '🔑 Set Gemini API Key',
    clearApiKey: '🗑️  Clear Gemini API Key',
    
    // Common Messages
    description: 'Automatically generates Pull Request descriptions based on Git diffs using AI',
    poweredBy: 'Powered by Google Gemini for fast, accurate descriptions',
    
    // Usage
    usage: 'Usage:',
    globalUsage: '# if installed globally',
    localUsage: '# run locally',
    examples: 'Examples:',
    
    // API Key Management
    apiKeyManagement: '⚙️  API Key Management:',
    setApiKeyCommand: 'generate-pr --set-api-key',
    setApiKeyDesc: '# Set or update API key',
    clearApiKeyCommand: 'generate-pr --clear-api-key',
    clearApiKeyDesc: '# Remove saved API key',
    
    // Templates
    templates: '🎨 Templates:',
    frontendTemplate: '🎨 Frontend - For UI/UX changes',
    frontendIncludes: 'Includes: Ticket, What was done, Data needed to test, How to test, What\'s missing, Screenshots',
    backendTemplate: '⚙️  Backend - For API/Database changes',
    backendIncludes: 'Includes: Ticket, What was done, Migrations',
    customTemplate: '📦 Custom - General purpose',
    userTemplates: '✨ User Templates - Create your own',
    
    // Features
    features: '🎫 Features:',
    automaticDetection: '• Automatic Git diff detection',
    ticketIntegration: '• Jira/VSTS ticket integration (optional)',
    persistentStorage: '• Persistent API key storage',
    interactiveRefinement: '• Interactive PR refinement',
    clipboardCopy: '• Copy to clipboard & save to file',
    customTemplates: '• Custom template creation',
    
    // Setup
    setup: '🔑 Setup:',
    getApiKey: 'Get Gemini API key: https://aistudio.google.com/app/apikey',
    setApiKeyStep: 'Set your API key: generate-pr --set-api-key',
    savedSecurely: 'Your API key is saved securely for future use',
    
    // Tips
    tips: '💡 Tips:',
    tip1: '• Ensure you\'re in a Git repository',
    tip2: '• Supports Spanish and English languages',
    tip3: '• Use descriptive ticket numbers (e.g., FE-123, BE-456)',
    tip4: '• You can request AI adjustments after initial generation',
    
    // Requirements
    requirements: '🚨 Requirements:',
    req1: '• Git repository',
    req2: '• Gemini API key',
    req3: '• Changes between current and target branch',
    
    // Links
    links: '🔗 Links:',
    github: '• GitHub: https://github.com/ignaciojsoler/generate-pr-cli',
    issues: '• Report issues: https://github.com/ignaciojsoler/generate-pr-cli/issues',
    
    // Footer
    footer: 'Made with ❤️ for lazy developers',
    
    // API Key Messages
    apiKeyRequired: '❌ Gemini API key required',
    apiKeyFromUrl: '📍 Get your API key from: https://aistudio.google.com/app/apikey',
    apiKeySavedLocally: 'The API key will be saved locally for future use.',
    apiKeyPrompt: 'Enter your Gemini API key:',
    api_key_saved_successfully: '✅ API key configured and saved successfully',
    api_key_loaded: '✅ Gemini API key loaded',
    invalid_api_key: '❌ Invalid saved API key, please re-enter:',
    
    // Branch Messages
    currentBranch: '📍 Current branch:',
    targetBranch: '🎯 Target branch:',
    noChangesDetected: '⚠️  No changes detected between branches',
    targetBranchNotFound: '❌ Target branch "{branch}" does not exist',
    failedToGenerateDiff: 'Error generating Git diff: {error}',
    diffGeneratedSuccessfully: '✓ Diff generated successfully',
    
    // Ticket Messages
    ticketPrompt: '🎫 Enter Jira/VSTS ticket number and title (optional):',
    ticketExamples: 'Examples: [TKT-1234] My new feature',
    ticketInput: 'Ticket number (leave empty to skip):',
    ticketConfirmed: '✓ Using ticket: {ticket}',
    noTicketProvided: '✓ No ticket provided',
    
    // Template Messages
    selectTemplate: 'Select a PR template:',
    usingTemplate: '✓ Using {template} template',
    createCustomTemplate: '➕ Create new custom template',
    
    // AI Messages
    generatingDescription: '🤖 Generating PR description with AI...',
    
    // Interactive Menu
    copyToClipboard: '📋 Copy to clipboard',
    saveToFile: '💾 Save to file',
    requestAdjustments: '✏️  Request AI adjustments',
    finish: '✅ Finish',
    whatWouldYouLikeToDo: 'What would you like to do?',
    copiedToClipboard: '✓ Sent to clipboard!',
    
    // File Operations
    enterFilename: 'Enter filename:',
    savedToFile: '✓ Saved to {filename}',
    filenameDefault: 'pr-description.txt',
    
    // Adjustments
    adjustmentPrompt: 'What changes would you like? (e.g., "make it shorter", "add more details about migrations")',
    adjustingDescription: '🤖 Adjusting description of PR...',
    descriptionUpdated: '✓ Updated PR description!',
    
    // Custom Templates
    templateNamePrompt: 'Enter template name:',
    templateStructurePrompt: 'Template structure:',
    templateStructureDefault: 'Generate a PR description with the following sections:',
    customTemplateCreated: '✓ Created and using custom template: {name}',
    
    // Errors
    invalidApiKeyFormat: 'Invalid API key format. Gemini API keys must start with " Gemini" and be at least 30 characters long.',
    errorGeneric: '❌ Error:',
    failedToGenerateDescription: 'Error generating PR description: {error}',
    failedToAdjustDescription: 'Error adjusting PR description: {error}',
    
    // Confirmation
    confirmClearApiKey: 'Are you sure you want to clear your saved API key? (y/N):',
    defaultNo: 'N',
    apiKeyCleared: '✅ API key cleared successfully!',
    noApiKeyToClear: 'ℹ️  No API key found to clear.',
    operationCancelled: 'Operation cancelled.',
    
    // Common Status
    success: '✓'
  }
};

export function getTranslation(key: keyof typeof TRANSLATIONS.es, lang: Language = 'es'): string {
  return TRANSLATIONS[lang][key] || TRANSLATIONS.es[key] || key;
}

export function formatTranslation(key: string, params: Record<string, string>, lang: Language = 'es'): string {
  let translation = getTranslation(key as keyof typeof TRANSLATIONS.es, lang);
  
  Object.entries(params).forEach(([placeholder, value]) => {
    translation = translation.replace(`{${placeholder}}`, value);
  });
  
  return translation;
}
