import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpeechService {
  readonly speakingId = signal<string | null>(null);
  readonly isRecording = signal(false);
  readonly recordingSeconds = signal(0);

  private mediaRecorder: MediaRecorder | null = null;
  private activeStream: MediaStream | null = null;
  private recordedChunks: BlobPart[] = [];
  private timerHandle: ReturnType<typeof setInterval> | null = null;
  private stopResolve: ((blob: Blob | null) => void) | null = null;
  private abortRecording = false;

  get isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  get isMicSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  speak(text: string, id: string, rate = 0.95): void {
    const clean = text.trim();
    if (!clean || !this.isTtsSupported) {
      return;
    }

    const wasSameId = this.speakingId() === id;
    this.stopSpeaking();
    if (wasSameId) {
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-US';
      utterance.rate = Math.min(1.2, Math.max(0.75, rate));

      const voices = window.speechSynthesis.getVoices?.() ?? [];
      const englishVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('en-us')) ??
        voices.find((v) => v.lang.toLowerCase().startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        if (this.speakingId() === id) {
          this.speakingId.set(null);
        }
      };
      utterance.onerror = () => {
        if (this.speakingId() === id) {
          this.speakingId.set(null);
        }
      };

      this.speakingId.set(id);
      window.speechSynthesis.speak(utterance);
    } catch {
      this.speakingId.set(null);
    }
  }

  stopSpeaking(): void {
    if (!this.isTtsSupported) {
      this.speakingId.set(null);
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore speech synthesis cancellation failures in headless environments.
    }
    this.speakingId.set(null);
  }

  async startRecording(): Promise<void> {
    if (!this.isMicSupported) {
      throw new Error('MIC_UNSUPPORTED');
    }
    if (this.isRecording()) {
      return;
    }

    this.stopSpeaking();
    this.abortRecording = false;
    this.recordedChunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.activeStream = stream;

    const preferredMime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((mime) =>
      typeof MediaRecorder.isTypeSupported === 'function'
        ? MediaRecorder.isTypeSupported(mime)
        : false,
    );

    const recorder = preferredMime
      ? new MediaRecorder(stream, { mimeType: preferredMime })
      : new MediaRecorder(stream);

    this.mediaRecorder = recorder;
    recorder.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) {
        this.recordedChunks.push(ev.data);
      }
    };

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || preferredMime || 'audio/webm';
      const chunks = this.recordedChunks;
      const aborted = this.abortRecording;
      this.cleanupRecorderState();

      if (this.stopResolve) {
        const resolve = this.stopResolve;
        this.stopResolve = null;
        if (aborted || chunks.length === 0) {
          resolve(null);
        } else {
          resolve(new Blob(chunks, { type: mimeType }));
        }
      }
    };

    recorder.start(250);
    this.isRecording.set(true);
    this.recordingSeconds.set(0);
    this.timerHandle = setInterval(() => {
      this.recordingSeconds.update((s) => s + 1);
    }, 1000);
  }

  stopRecording(): Promise<Blob | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      this.cleanupRecorderState();
      return Promise.resolve(null);
    }

    return new Promise<Blob | null>((resolve) => {
      this.stopResolve = resolve;
      this.mediaRecorder?.stop();
    });
  }

  cancelRecording(): void {
    this.abortRecording = true;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    } else {
      this.cleanupRecorderState();
      if (this.stopResolve) {
        this.stopResolve(null);
        this.stopResolve = null;
      }
    }
  }

  private cleanupRecorderState(): void {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
    if (this.activeStream) {
      for (const track of this.activeStream.getTracks()) {
        track.stop();
      }
      this.activeStream = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording.set(false);
    this.recordingSeconds.set(0);
  }
}
