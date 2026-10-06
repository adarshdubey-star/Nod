import type { SpeechEngine } from '../types';

type TranscriptCallback = (text: string, isFinal: boolean, confidence: number) => void;
type ErrorCallback = (error: Error) => void;

const SpeechRecognition =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;

export function isSpeechRecognitionSupported(): boolean {
  return !!SpeechRecognition;
}

/* ───────────────────────────────────────────────────────
 *  Tuning knobs
 * ─────────────────────────────────────────────────────── */

/** If no result arrives for this long, force-restart (ms) */
const WATCHDOG_TIMEOUT_MS = 7_000;

/** Check the watchdog on this interval (ms) */
const WATCHDOG_INTERVAL_MS = 2_500;

/** Force a clean restart every N ms to prevent the API from silently dying */
const PROACTIVE_RESTART_MS = 45_000;

/** Delay before restarting after onend fires (ms) */
const RESTART_DELAY_MS = 150;

export class WebSpeechEngine implements SpeechEngine {
  private recognition: any = null;
  private transcriptCbs: TranscriptCallback[] = [];
  private errorCbs: ErrorCallback[] = [];
  private shouldRestart = false;

  /** Timestamp of the last result (interim or final) */
  private lastResultAt = 0;

  /** Timestamp when the current recognition session started */
  private sessionStartAt = 0;

  /** Watchdog interval handle */
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;

  /** Tracks whether a restart is already in flight */
  private restartPending = false;

  isListening = false;

  constructor(private lang = 'en-US') {
    if (!SpeechRecognition) return;
    this.buildRecognition();
  }

  /* ── build / rebuild the native SpeechRecognition instance ── */

  private buildRecognition() {
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      this.lastResultAt = Date.now();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alt = result[0];
        const transcript = alt.transcript.trim();
        const isFinal = result.isFinal;
        const confidence: number = alt.confidence ?? 0;
        this.transcriptCbs.forEach((cb) => cb(transcript, isFinal, confidence));
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      if (event.error === 'network') {
        this.scheduleRestart();
        return;
      }
      const err = new Error(`Speech recognition error: ${event.error}`);
      this.errorCbs.forEach((cb) => cb(err));
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.shouldRestart) {
        this.scheduleRestart();
      }
    };
  }

  /* ── restart helpers ── */

  private scheduleRestart() {
    if (this.restartPending || !this.shouldRestart) return;
    this.restartPending = true;

    setTimeout(() => {
      this.restartPending = false;
      if (this.shouldRestart) {
        this.beginSession();
      }
    }, RESTART_DELAY_MS);
  }

  private beginSession() {
    try {
      this.recognition?.abort();
    } catch { /* already stopped */ }

    // Rebuild to fully reset internal browser state
    this.buildRecognition();

    try {
      this.recognition.start();
      this.isListening = true;
      this.lastResultAt = Date.now();
      this.sessionStartAt = Date.now();
    } catch {
      // Retry once more after a short delay
      setTimeout(() => {
        try {
          this.recognition.start();
          this.isListening = true;
          this.lastResultAt = Date.now();
          this.sessionStartAt = Date.now();
        } catch { /* give up this cycle, watchdog will retry */ }
      }, 300);
    }
  }

  /* ── watchdog: detects silent death & proactive refresh ── */

  private startWatchdog() {
    this.stopWatchdog();
    this.watchdogTimer = setInterval(() => {
      if (!this.shouldRestart) return;

      const now = Date.now();
      const silentFor = now - this.lastResultAt;
      const sessionAge = now - this.sessionStartAt;

      // Force-restart if no results for too long
      if (silentFor > WATCHDOG_TIMEOUT_MS) {
        this.beginSession();
        return;
      }

      // Proactive restart to avoid long-session decay
      if (sessionAge > PROACTIVE_RESTART_MS) {
        this.beginSession();
      }
    }, WATCHDOG_INTERVAL_MS);
  }

  private stopWatchdog() {
    if (this.watchdogTimer !== null) {
      clearInterval(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /* ── public API ── */

  start(): void {
    if (!this.recognition) return;
    this.shouldRestart = true;
    this.beginSession();
    this.startWatchdog();
  }

  stop(): void {
    this.shouldRestart = false;
    this.isListening = false;
    this.stopWatchdog();
    try {
      this.recognition?.abort();
    } catch { /* already stopped */ }
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
    this.recognition = null;
  }
}
