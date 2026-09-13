export const SEMENTES_VIDEO_SECONDS = 15;
export const SEMENTES_VIDEO_TARGET_BYTES = 2.5 * 1024 * 1024;

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  const options = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return options.find((item) => MediaRecorder.isTypeSupported(item)) || '';
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function when(el: HTMLVideoElement, event: string) {
  return new Promise<void>((resolve, reject) => {
    const ok = () => {
      el.removeEventListener(event, ok);
      el.removeEventListener('error', fail);
      resolve();
    };
    const fail = () => {
      el.removeEventListener(event, ok);
      el.removeEventListener('error', fail);
      reject(new Error('video'));
    };
    el.addEventListener(event, ok);
    el.addEventListener('error', fail);
  });
}

function canvasSize(video: HTMLVideoElement) {
  const width = video.videoWidth || 480;
  const height = video.videoHeight || 854;
  const scale = Math.min(1, 480 / width, 854 / height);
  return {
    width: Math.max(2, Math.round(width * scale / 2) * 2),
    height: Math.max(2, Math.round(height * scale / 2) * 2),
  };
}

function attachAudio(video: HTMLVideoElement, canvasStream: MediaStream) {
  const withCapture = video as HTMLVideoElement & {
    captureStream?: (fps?: number) => MediaStream;
    mozCaptureStream?: (fps?: number) => MediaStream;
  };
  try {
    const captured =
      typeof withCapture.captureStream === 'function'
        ? withCapture.captureStream()
        : typeof withCapture.mozCaptureStream === 'function'
          ? withCapture.mozCaptureStream()
          : null;
    if (captured) {
      captured.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
      captured.getVideoTracks().forEach((track) => track.stop());
    }
  } catch {
    /* gallery recode can still go video-only */
  }
  return canvasStream;
}

async function recodeClip(video: HTMLVideoElement, seconds: number): Promise<File> {
  const { width, height } = canvasSize(video);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('canvas');

  video.pause();
  video.currentTime = 0;
  if (video.currentTime > 0.05) await when(video, 'seeked');

  const canvasStream = canvas.captureStream(24);
  const stream = attachAudio(video, canvasStream);
  const mime = pickMime();
  const recorder = mime
    ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 400_000, audioBitsPerSecond: 48_000 })
    : new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size) chunks.push(event.data);
  };

  let drawing = true;
  const draw = () => {
    if (!drawing) return;
    ctx.drawImage(video, 0, 0, width, height);
    requestAnimationFrame(draw);
  };

  const stopped = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
    recorder.onerror = () => reject(new Error('recorder'));
  });

  try {
    video.muted = true;
    await video.play();
    video.muted = false;
  } catch {
    video.muted = true;
    await video.play();
  }

  requestAnimationFrame(draw);
  recorder.start(200);

  const limit = Math.max(0.6, seconds);
  await new Promise<void>((resolve) => {
    const finish = () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', finish);
      window.clearTimeout(timer);
      resolve();
    };
    const onTime = () => {
      if (video.currentTime >= limit - 0.04) finish();
    };
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', finish);
    const timer = window.setTimeout(finish, (limit + 1.2) * 1000);
  });

  drawing = false;
  if (recorder.state === 'recording') recorder.stop();
  video.pause();
  stream.getTracks().forEach((track) => track.stop());

  const blob = await stopped;
  if (blob.size < 1200) throw new Error('empty');
  const type = blob.type || recorder.mimeType || 'video/webm';
  const ext = type.includes('mp4') ? 'mp4' : 'webm';
  return new File([blob], `verso.${ext}`, { type });
}

export async function prepareSementesVideo(file: File): Promise<{ file: File; trimmed: boolean; compressed: boolean }> {
  if (!file.size) throw new Error('empty');

  const compressedNeeded = file.size > SEMENTES_VIDEO_TARGET_BYTES;
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.playsInline = true;
  video.preload = 'auto';
  video.controls = false;
  video.src = url;
  video.setAttribute('playsinline', 'true');
  video.setAttribute('webkit-playsinline', 'true');
  video.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none';
  document.body.appendChild(video);

  let trimmed = false;
  try {
    await Promise.race([when(video, 'loadedmetadata'), wait(12000).then(() => Promise.reject(new Error('timeout')))]);
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    trimmed = duration > SEMENTES_VIDEO_SECONDS + 0.8;

    if (!trimmed && !compressedNeeded) {
      return { file, trimmed: false, compressed: false };
    }

    const recoded = await recodeClip(video, Math.min(duration || SEMENTES_VIDEO_SECONDS, SEMENTES_VIDEO_SECONDS));
    if (recoded.size > SEMENTES_VIDEO_TARGET_BYTES) throw new Error('heavy');
    return { file: recoded, trimmed, compressed: recoded.size < file.size };
  } catch (err) {
    if (err instanceof Error && err.message === 'heavy') throw err;
    if (!trimmed && !compressedNeeded && file.type.startsWith('video/')) {
      return { file, trimmed: false, compressed: false };
    }
    throw new Error('heavy');
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
    URL.revokeObjectURL(url);
  }
}
