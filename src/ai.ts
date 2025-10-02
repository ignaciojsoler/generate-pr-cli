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

  const { diff, template, ticket, additionalInstructions } = request;

  // Replace ticket placeholder in template
  let processedTemplate = template.structure;
  if (ticket) {
    processedTemplate = processedTemplate.replace('{{TICKET_OR_SKIP}}', ticket);
  } else {
    // Remove the entire ticket line including the line break
    processedTemplate = processedTemplate.replace(/^\*\*Ticket:\*\* \{\{TICKET_OR_SKIP\}\}\n?/m, '');
  }
  
  // Debug: log the processed template
  console.log('🔍 Ticket provided:', ticket);
  console.log('🔍 Template before processing:', template.structure.substring(0, 150) + '...');
  console.log('🔍 Template after processing:', processedTemplate.substring(0, 150) + '...');

  const systemPrompt = `You are a technical writer creating a Pull Request description.

IMPORTANT: You MUST follow this EXACT template structure:

${processedTemplate}

REQUIREMENTS:
1. Fill in each section with relevant information based on the Git diff provided
2. If a section doesn't apply (like "No migrations"), write "N/A" or skip it
3. Use the EXACT formatting with **bold** headers
4. Write in Spanish as indicated in the template
5. Be concise but informative
6. Do NOT change the structure or headers

${additionalInstructions ? `\nADDITIONAL INSTRUCTIONS: ${additionalInstructions}` : ''}`;

  const userPrompt = `Based on this Git diff, generate a PR description following the exact template above:

**Current Branch:** ${diff.currentBranch}
**Target Branch:** ${diff.targetBranch}

**Diff Statistics:**
${diff.diffStat || 'No files changed'}

**Diff Content:**
${diff.diffContent.substring(0, 8000) || 'No changes detected'}

Generate the PR description following the template structure exactly:`;

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

