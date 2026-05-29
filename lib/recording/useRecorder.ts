"use client";

import { useCallback, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "error";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const c of MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return "";
}

function extFor(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export interface RecorderResult {
  file: File;
  durationSec: number;
}

interface UseRecorderOptions {
  maxSeconds?: number;
  minSeconds?: number;
  onComplete: (result: RecorderResult) => void;
}

/**
 * MediaRecorder state machine for the record screen.
 * - mime cascade (webm/opus → mp4 for iOS → ogg), extension matched for Whisper
 * - live timer, auto-stop at maxSeconds, min-length guard
 * - maps failures to stable error codes (mic_denied, mic_unavailable, …)
 */
export function useRecorder({
  maxSeconds = 90,
  minSeconds = 3,
  onComplete,
}: UseRecorderOptions) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const canceledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const cancel = useCallback(() => {
    canceledRef.current = true;
    stop();
    cleanup();
    setStatus("idle");
    setSeconds(0);
  }, [stop, cleanup]);

  const start = useCallback(async () => {
    setErrorCode(null);
    canceledRef.current = false;

    const mime = pickMime();
    if (!mime) {
      setErrorCode("recorder_unsupported");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      setErrorCode(
        name === "NotAllowedError"
          ? "mic_denied"
          : name === "NotFoundError"
            ? "mic_unavailable"
            : "mic_error",
      );
      setStatus("error");
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const options: MediaRecorderOptions = { mimeType: mime };
    if (mime.includes("webm")) options.audioBitsPerSecond = 32000;

    const recorder = new MediaRecorder(stream, options);
    recorderRef.current = recorder;

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      cleanup();
      if (canceledRef.current) return;
      const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
      if (durationSec < minSeconds) {
        setErrorCode("recording_too_short");
        setStatus("error");
        return;
      }
      const baseType = mime.split(";")[0] ?? mime;
      const blob = new Blob(chunksRef.current, { type: baseType });
      const file = new File([blob], `note.${extFor(mime)}`, { type: baseType });
      setStatus("idle");
      setSeconds(0);
      onComplete({ file, durationSec });
    };

    startedAtRef.current = Date.now();
    recorder.start();
    setStatus("recording");
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= maxSeconds) stop();
        return next;
      });
    }, 1000);
  }, [cleanup, maxSeconds, minSeconds, onComplete, stop]);

  return { status, seconds, errorCode, start, stop, cancel };
}
