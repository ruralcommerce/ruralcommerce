import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface GitPushConfig {
  branch: string;
  remoteUrl: string;
}

function getGitPushConfig(): GitPushConfig | null {
  if (process.env.GIT_PUSH_ENABLED !== '1') {
    return null;
  }

  const branch = process.env.GIT_PUSH_BRANCH || 'master';
  const username = process.env.GIT_USERNAME;
  const token = process.env.GIT_TOKEN;
  const remoteUrlFromEnv = process.env.GIT_REMOTE_URL;

  if (!username || !token) {
    throw new Error('GIT_USERNAME and GIT_TOKEN are required when GIT_PUSH_ENABLED=1');
  }

  const repoUrl = remoteUrlFromEnv
    ? remoteUrlFromEnv.replace(/^(https?:\/\/)/, `$1${encodeURIComponent(username)}:${encodeURIComponent(token)}@`)
    : `https://${encodeURIComponent(username)}:${encodeURIComponent(token)}@github.com/ruralcommerce/ruralcommerce.git`;

  return {
    branch,
    remoteUrl: repoUrl,
  };
}

export async function commitAndPushGitFiles(filePaths: string[], message: string) {
  const config = getGitPushConfig();
  if (!config) {
    return;
  }

  const env = {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
  };

  await execFileAsync('git', ['add', ...filePaths], {
    cwd: process.cwd(),
    env,
  });

  try {
    await execFileAsync('git', ['commit', '-m', message], {
      cwd: process.cwd(),
      env,
    });
  } catch (error: any) {
    const stderr = String(error.stderr || '');
    if (stderr.includes('nothing to commit')) {
      return;
    }
    throw error;
  }

  await execFileAsync('git', ['push', config.remoteUrl, config.branch], {
    cwd: process.cwd(),
    env,
  });
}
