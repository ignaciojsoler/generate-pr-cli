import type { PRGenerationRequest } from './types.js';

interface GeminiClient {
  generateContent: (request: any) => Promise<any>;
}

let geminiClient: GeminiClient | null = null;

export async function initializeAI(apiKey?: string): Promise<void> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  
  if (!key) {
    throw new Error('Gemini API key not provided. Set GEMINI_API_KEY environment variable or pass it as an argument.');
  }

  // Initialize Gemini client
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(key);
    geminiClient = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (error) {
    throw new Error('Failed to initialize Gemini client. Make sure @google/generative-ai is installed.');
  }
}

export function isAIInitialized(): boolean {
  return geminiClient !== null;
}

export async function generatePRDescription(request: PRGenerationRequest): Promise<string> {
  if (!geminiClient) {
    throw new Error('AI client not initialized. Call initializeAI() first.');
  }

  const { diff, template, ticket } = request;

  // Replace ticket placeholder in template
  let processedTemplate = template.structure;
  if (ticket) {
    // Simple replacement
    processedTemplate = processedTemplate.replace('{{TICKET_OR_SKIP}}', ticket);
  } else {
    // Remove the entire ticket line including the line break
    processedTemplate = processedTemplate.replace(/^\*\*Ticket:\*\* \{\{TICKET_OR_SKIP\}\}\n?/m, '');
  }
  
  // Debug disabled for production

  const systemPrompt = `Usa EXACTAMENTE esta estructura y completa cada línea:

${processedTemplate}

- Mantén los headers en negrita exactamente como están
- Completa cada línea con información específica del git diff`;

  const userPrompt = `GIT DIFF:

**Branch:** ${diff.currentBranch} → ${diff.targetBranch}
**Files changed:** ${diff.diffStat}
**Changes:** ${diff.diffContent.substring(0, 4000)}

Genera la descripción del PR usando EXACTAMENTE la estructura mostrada arriba:`;

  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await geminiClient.generateContent(fullPrompt);
    const generatedText = result.response.text();
    
    if (!generatedText) {
      throw new Error('No response generated from AI');
    }

    return generatedText.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate PR description: ${error.message}`);
    }
    throw new Error('Failed to generate PR description: Unknown error');
  }
}

export async function adjustPRDescription(
  currentPR: string,
  adjustmentRequest: string
): Promise<string> {
  if (!geminiClient) {
    throw new Error('AI client not initialized. Call initializeAI() first.');
  }

  const systemPrompt = `You are a technical writer helping to refine a Pull Request description.
The user will provide the current PR description and request modifications.
Apply the requested changes and return the updated PR description.

IMPORTANT: Generate ONLY the PR description content. Do NOT include any markdown code blocks, backticks, or language identifiers. Output clean markdown that can be used directly.`;

  const userPrompt = `Current PR Description:
${currentPR}

Adjustment Request: ${adjustmentRequest}

Please modify the PR description according to the request and return the updated version:`;

  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const result = await geminiClient.generateContent(fullPrompt);
    const generatedText = result.response.text();
    
    if (!generatedText) {
      throw new Error('No response generated from AI');
    }

    return generatedText.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to adjust PR description: ${error.message}`);
    }
    throw new Error('Failed to adjust PR description: Unknown error');
  }
}

