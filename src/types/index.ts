export interface Slide {
  index: number;
  imageDataUrl: string;
  textContent: string;
  notes?: string;
}

export type OrbState =
  | 'idle'
  | 'listening'
  | 'nextSlide'
  | 'prevSlide'
  | 'gotoSlide'
  | 'confused'
  | 'sleeping'
  | 'greeting';

export type Command =
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'goto'; slide: number }
  | { type: 'first' }
  | { type: 'last' }
  | { type: 'unknown'; raw: string };

export interface SpeechEngine {
  start(): void;
  stop(): void;
  isListening: boolean;
  onTranscript(cb: (text: string, isFinal: boolean) => void): void;
  onError(cb: (error: Error) => void): void;
  destroy(): void;
}

export interface SlideLoader {
  accepts(file: File): boolean;
  load(file: File): Promise<Slide[]>;
}

export interface PresentationState {
  slides: Slide[];
  currentSlide: number;
  isPresenting: boolean;
  lastCommand: Command | null;
  isLoading: boolean;
  error: string | null;
}

export type PresentationAction =
  | { type: 'LOAD_SLIDES'; slides: Slide[] }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREV_SLIDE' }
  | { type: 'GOTO_SLIDE'; slide: number }
  | { type: 'FIRST_SLIDE' }
  | { type: 'LAST_SLIDE' }
  | { type: 'SET_PRESENTING'; value: boolean }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_COMMAND' }
  | { type: 'RESET' };
