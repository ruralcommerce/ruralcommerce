import { spawn } from 'child_process';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

let ffmpegOk: boolean | null = null;

function run(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('ffmpeg', args, { stdio: 'ignore' });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('ffmpeg timeout'));
    }, 20000);
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error('ffmpeg'));
    });
  });
}

export async function ffmpegAvailable() {
  if (ffmpegOk !== null) return ffmpegOk;
  ffmpegOk = await new Promise((resolve) => {
    const child = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('exit', (code) => resolve(code === 0));
  });
  return ffmpegOk;
}

export async function trimSementesVideoBuffer(input: Buffer, ext: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!(await ffmpegAvailable()) || input.length < 1200) return null;
  const dir = await mkdtemp(join(tmpdir(), 'sementes-'));
  const src = join(dir, `in.${ext.replace(/[^a-z0-9]/gi, '') || 'bin'}`);
  const dest = join(dir, 'out.mp4');
  await writeFile(src, input);
  try {
    try {
      await run(['-y', '-t', '15', '-i', src, '-c', 'copy', '-movflags', '+faststart', dest]);
    } catch {
      await run([
        '-y',
        '-t',
        '15',
        '-i',
        src,
        '-vf',
        'scale=-2:720',
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-b:v',
        '900k',
        '-c:a',
        'aac',
        '-b:a',
        '96k',
        '-movflags',
        '+faststart',
        dest,
      ]);
    }
    const buffer = await readFile(dest);
    if (buffer.length < 1200) return null;
    return { buffer, contentType: 'video/mp4' };
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
