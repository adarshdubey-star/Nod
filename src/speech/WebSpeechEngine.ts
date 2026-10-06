import type { SpeechEngine } from '../types';

type TranscriptCallback = (text: string, isFinal: boolean) => void;
type ErrorCallback = (error: Error) => void;

const SpeechRecognition =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;

export function isSpeechRecognitionSupported(): boolean {
  return !!SpeechRecognition;
}

export class WebSpeechEngine implements SpeechEngine {
  private recognition: any = null;
  private transcriptCbs: TranscriptCallback[] = [];
  private errorCbs: ErrorCallback[] = [];
  private shouldRestart = false;

  isListening = false;

  constructor(lang = 'en-US') {
    if (!SpeechRecognition) {
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        const isFinal = result.isFinal;
        this.transcriptCbs.forEach((cb) => cb(transcript, isFinal));
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      const err = new Error(`Speech recognition error: ${event.error}`);
      this.errorCbs.forEach((cb) => cb(err));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.shouldRestart) {
        setTimeout(() => {
          if (this.shouldRestart) {
            this.startRecognition();
          }
        }, 100);
      }
    };
  }

  private startRecognition() {
    try {
      this.recognition?.start();
      this.isListening = true;
    } catch {
      // Already started
    }
  }

  start(): void {
    if (!this.recognition) return;
    this.shouldRestart = true;
    this.startRecognition();
  }

  stop(): void {
    this.shouldRestart = false;
    this.isListening = false;
    try {
      this.recognition?.stop();
    } catch {
      // Already stopped
    }
  }

  onTranscript(cb: TranscriptCallback): void {
    this.transcriptCbs.push(cb);
  }

  onError(cb: ErrorCallback): void {
    this.errorCbs.push(cb);
  }

  destroy(): void {
    this.stop();
    this.transcriptCbs = [];
    this.errorCbs = [];
    try {
      this.recognition?.abort();
    } catch {
      // Already aborted
    }
    this.recognition = null;
  }
}
