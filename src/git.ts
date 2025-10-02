import { exec } from 'child_process';
import { promisify } from 'util';
import type { GitDiffResult } from './types.js';

const execAsync = promisify(exec);

export async function getCurrentBranch(): Promise<string> {
  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD');
    return stdout.trim();
  } catch (error) {
    throw new Error('Failed to get current Git branch. Are you in a Git repository?');
  }
}

export async function getBranchExists(branch: string): Promise<boolean> {
  try {
    await execAsync(`git rev-parse --verify ${branch}`);
    return true;
  } catch {
    return false;
  }
}

export async function getGitDiff(targetBranch: string): Promise<GitDiffResult> {
  const currentBranch = await getCurrentBranch();
  
  const targetExists = await getBranchExists(targetBranch);
  if (!targetExists) {
    throw new Error(`Target branch "${targetBranch}" does not exist`);
  }

  try {
    const { stdout: diffStat } = await execAsync(`git diff --stat ${targetBranch}...${currentBranch}`);
    const { stdout: diffContent } = await execAsync(`git diff ${targetBranch}...${currentBranch}`);

    return {
      currentBranch,
      targetBranch,
      diffStat: diffStat.trim(),
      diffContent: diffContent.trim()
    };
  } catch (error) {
    throw new Error(`Failed to generate Git diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateGitRepository(): boolean {
  try {
    execAsync('git rev-parse --git-dir');
    return true;
  } catch {
    return false;
  }
}

