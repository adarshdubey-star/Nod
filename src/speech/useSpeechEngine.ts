import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSpeechEngine, isSpeechRecognitionSupported } from './WebSpeechEngine';

interface UseSpeechEngineReturn {
  transcript: string;
  isFinal: boolean;
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
  const [isFinal, setIsFinal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    if (!isSupported) return;

    const engine = new WebSpeechEngine();
    engineRef.current = engine;

    engine.onTranscript((text, final) => {
      setTranscript(text);
      setIsFinal(final);
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
    isFinal,
    isListening,
    isSupported,
    error,
    toggle,
    start,
    stop,
  };
}
