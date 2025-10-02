export interface GitDiffResult {
  currentBranch: string;
  targetBranch: string;
  diffStat: string;
  diffContent: string;
}

export type TemplateType = 'frontend' | 'backend' | 'custom';

export interface PRTemplate {
  name: string;
  structure: string;
  language?: 'es' | 'en';
}

export interface PRGenerationRequest {
  diff: GitDiffResult;
  template: PRTemplate;
  ticket?: string;
  additionalInstructions?: string;
}

export interface MenuAction {
  name: string;
  value: 'copy' | 'save' | 'adjust' | 'finish';
}

