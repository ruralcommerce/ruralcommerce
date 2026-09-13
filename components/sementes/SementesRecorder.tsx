'use client';

import { useEffect, useRef, useState } from 'react';

const LIMIT_MS = 15000;

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  const options = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'];
  return options.find((item) => MediaRecorder.isTypeSupported(item)) || '';
}

export function SementesRecorder({
  copy,
  onReady,
  disabled,
}: {
  copy: {
    recordCta: string;
    recordAgain: string;
    recordUse: string;
    recordNeedCam: string;
    recordFallback: string;
  };
  onReady: (file: File) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [previewUrl, setPreviewUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function openCam() {
    setError('');
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

  function consumeBlob(blob: Blob, name: string) {
    const next = new File([blob], name, { type: blob.type || 'video/webm' });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    stopTracks();
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mime = pickMime();
    const recorder = mime
      ? new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_200_000 })
      : new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/webm';
      consumeBlob(new Blob(chunksRef.current, { type }), type.includes('mp4') ? 'verso.mp4' : 'verso.webm');
    };
    recorder.start();
    setRecording(true);
    setSecondsLeft(15);
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(chosen);
    setPreviewUrl(URL.createObjectURL(chosen));
    stopTracks();
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[28px] bg-black aspect-[9/14] max-h-[52vh]">
        {previewUrl ? (
          <video className="h-full w-full object-cover" src={previewUrl} controls playsInline />
        ) : (
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
        )}
        {!live && !previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#071F5E]/70 text-sm text-white/80">
            9:16 · 15s
          </div>
        ) : null}
        {recording ? (
          <div className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            {secondsLeft}s
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-[#A5D9EF]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {!live && !previewUrl ? (
          <button type="button" className="sem-cta" onClick={openCam} disabled={disabled}>
            {copy.recordCta}
          </button>
        ) : null}
        {live && !recording && !previewUrl ? (
          <button type="button" className="sem-cta" onClick={startRecording} disabled={disabled}>
            {copy.recordCta}
          </button>
        ) : null}
        {previewUrl ? (
          <>
            <button
              type="button"
              className="sem-ghost"
              onClick={() => {
                setFile(null);
                setPreviewUrl('');
                void openCam();
              }}
              disabled={disabled}
            >
              {copy.recordAgain}
            </button>
            <button
              type="button"
              className="sem-cta"
              disabled={!file || disabled}
              onClick={() => file && onReady(file)}
            >
              {copy.recordUse}
            </button>
          </>
        ) : null}
      </div>
      <label className="block text-xs text-white/55">
        {copy.recordFallback}
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          capture="user"
          className="mt-2 block w-full text-xs"
          onChange={(event) => onFile(event.target.files)}
        />
      </label>
    </div>
  );
}
