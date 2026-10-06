import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSpeechEngine, isSpeechRecognitionSupported } from './WebSpeechEngine';

interface UseSpeechEngineReturn {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  /** Monotonically increasing counter — bumps on every final result */
  resultId: number;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  toggle: () => void;
  start: () => void;
  stop: () => void;
}

export function useSpeechEngine(): UseSpeechEngineReturn {
  const engineRef = useRef<WebSpeechEngine | null>(null);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isFinal, setIsFinal] = useState(false);
  const [resultId, setResultId] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isSupported) return;

    const engine = new WebSpeechEngine();
    engineRef.current = engine;

    engine.onTranscript((text, final, conf) => {
      setTranscript(text);
      setIsFinal(final);
      setConfidence(conf);
      if (final) {
        setResultId((prev) => prev + 1);
      }
    });

    engine.onError((err) => {
      setError(err.message);
    });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [isSupported]);

  const start = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.start();
      setIsListening(true);
      setError(null);
    }
  }, []);

  const stop = useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.stop();
      setIsListening(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return {
    transcript,
    confidence,
    isFinal,
    resultId,
    isListening,
    isSupported,
    error,
    toggle,
    start,
    stop,
  };
}
