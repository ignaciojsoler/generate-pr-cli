import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.generate-pr-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

interface Config {
  apiKey?: string;
}

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function saveApiKey(apiKey: string): void {
  ensureConfigDir();
  
  const config: Config = { apiKey };
  
  try {
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw new Error('Failed to save API key to config');
  }
}

export function loadApiKey(): string | null {
  if (!existsSync(CONFIG_FILE)) {
    return null;
  }
  
  try {
    const data = readFileSync(CONFIG_FILE, 'utf-8');
    const config: Config = JSON.parse(data);
    return config.apiKey || null;
  } catch (error) {
    return null;
  }
}

export function clearApiKey(): void {
  if (existsSync(CONFIG_FILE)) {
    try {
      unlinkSync(CONFIG_FILE);
    } catch (error) {
      // Ignore errors when clearing
    }
  }
}
