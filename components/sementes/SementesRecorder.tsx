'use client';

import { useEffect, useRef, useState } from 'react';
import {
  inspectSementesVideo,
  prepareSementesVideo,
  SEMENTES_VIDEO_SECONDS,
  SEMENTES_VIDEO_TARGET_BYTES,
} from '@/components/sementes/prepare-sementes-video';

const LIMIT_MS = SEMENTES_VIDEO_SECONDS * 1000;

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  const options = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  return options.find((item) => MediaRecorder.isTypeSupported(item)) || '';
}

export function SementesRecorder({
  copy,
  onReady,
  onResetError,
  disabled,
}: {
  copy: {
    recordCta: string;
    recordAgain: string;
    recordUse: string;
    recordNeedCam: string;
    recordFallback: string;
    recordPreparing: string;
    recordTrimmed: string;
    recordCompressing: string;
    recordCompressed: string;
    recordTooHeavy: string;
  };
  onReady: (file: File) => void;
  onResetError?: () => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SEMENTES_VIDEO_SECONDS);
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function openCam() {
    setError('');
    setNotice('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 }, frameRate: { ideal: 24 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLive(true);
    } catch {
      setError(copy.recordNeedCam);
    }
  }

  function stopTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
  }

  function showPreview(next: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    stopTracks();
  }

  async function adoptFile(raw: File, fromGallery: boolean) {
    setError('');
    setNotice('');
    onResetError?.();
    setFile(null);
    stopTracks();
    if (!fromGallery) {
      showPreview(raw);
      return;
    }
    setPreparing(true);
    try {
      if (raw.size > SEMENTES_VIDEO_TARGET_BYTES) {
        setNotice(copy.recordCompressing);
        const prepared = await prepareSementesVideo(raw);
        showPreview(prepared.file);
        if (prepared.trimmed) setNotice(copy.recordTrimmed);
        else if (prepared.compressed) setNotice(copy.recordCompressed);
        return;
      }
      showPreview(raw);
      const { duration } = await inspectSementesVideo(raw);
      if (duration > SEMENTES_VIDEO_SECONDS + 0.8) setNotice(copy.recordTrimmed);
    } catch {
      setError(copy.recordTooHeavy);
      setFile(null);
      setPreviewUrl('');
    } finally {
      setPreparing(false);
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mime = pickMime();
    const recorder = mime
      ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 800_000, audioBitsPerSecond: 64_000 })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type });
      void adoptFile(new File([blob], type.includes('mp4') ? 'verso.mp4' : 'verso.webm', { type }), false);
    };
    recorder.start(200);
    setRecording(true);
    setSecondsLeft(SEMENTES_VIDEO_SECONDS);
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, LIMIT_MS - (Date.now() - started));
      setSecondsLeft(Math.ceil(left / 1000));
      if (left <= 0) {
        window.clearInterval(tick);
        if (recorder.state === 'recording') recorder.stop();
        setRecording(false);
      }
    }, 120);
  }

  function onFile(list: FileList | null) {
    const chosen = list?.[0];
    if (!chosen) return;
    if (chosen.size > SEMENTES_VIDEO_TARGET_BYTES) setNotice(copy.recordCompressing);
    void adoptFile(chosen, true);
  }

  const locked = disabled || preparing;

  return (
    <div className="sem-record">
      <div className="sem-record-frame">
        {previewUrl ? (
          <video className="h-full w-full object-cover" src={previewUrl} controls playsInline />
        ) : (
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
        )}
        {!live && !previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#071F5E]/70 text-sm font-semibold tracking-[0.18em] text-white/80">
            {SEMENTES_VIDEO_SECONDS}s
          </div>
        ) : null}
        {recording ? (
          <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">
            {secondsLeft}s
          </div>
        ) : null}
        {preparing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#071F5E]/75 px-4 text-center text-sm font-semibold text-white">
            {copy.recordPreparing}
          </div>
        ) : null}
      </div>
      {notice ? <p className="text-sm text-[#A5D9EF]">{notice}</p> : null}
      {error ? <p className="text-sm text-[#A5D9EF]">{error}</p> : null}
      <div className="flex w-full shrink-0 gap-2">
        {!live && !previewUrl ? (
          <button type="button" className="sem-cta flex-1" onClick={openCam} disabled={locked}>
            {copy.recordCta}
          </button>
        ) : null}
        {live && !recording && !previewUrl ? (
          <button type="button" className="sem-cta flex-1" onClick={startRecording} disabled={locked}>
            {copy.recordCta}
          </button>
        ) : null}
        {previewUrl ? (
          <>
            <button
              type="button"
              className="sem-ghost flex-1"
              onClick={() => {
                setFile(null);
                setPreviewUrl('');
                setNotice('');
                setError('');
                void openCam();
              }}
              disabled={locked}
            >
              {copy.recordAgain}
            </button>
            <button
              type="button"
              className="sem-cta flex-1"
              disabled={!file || locked}
              onClick={() => file && onReady(file)}
            >
              {copy.recordUse}
            </button>
          </>
        ) : null}
      </div>
      <button type="button" className="sem-resume" onClick={() => fileRef.current?.click()} disabled={locked}>
        {copy.recordFallback}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(event) => {
          onFile(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
