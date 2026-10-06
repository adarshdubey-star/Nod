import { useEffect, useCallback, useRef } from 'react';
import {
  PresentationProvider,
  usePresentation,
  usePresentationDispatch,
} from './state/PresentationContext';
import { useSlideLoader } from './loaders/useSlideLoader';
import { useSpeechEngine } from './speech/useSpeechEngine';
import { parseCommand } from './commands/CommandParser';
import UploadScreen from './components/UploadScreen';
import SlideViewer from './components/SlideViewer';
import SlideNavigator from './components/SlideNavigator';
import PresenterToolbar from './components/PresenterToolbar';
import NodOrb from './components/NodOrb';
import VoiceIndicator from './components/VoiceIndicator';
import CommandFeedback from './components/CommandFeedback';
import ErrorBoundary from './components/ErrorBoundary';
import BrowserCheck from './components/BrowserCheck';
import type { Command } from './types';

function AppContent() {
  const state = usePresentation();
  const dispatch = usePresentationDispatch();
  const { loadFiles, isLoading, error } = useSlideLoader();
  const speech = useSpeechEngine();
  const lastProcessedRef = useRef<string>('');

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      dispatch({ type: 'SET_LOADING', value: true });
      try {
        const slides = await loadFiles(files);
        dispatch({ type: 'LOAD_SLIDES', slides });
        dispatch({ type: 'SET_PRESENTING', value: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load';
        dispatch({ type: 'SET_ERROR', error: message });
      }
    },
    [dispatch, loadFiles],
  );

  const dispatchCommand = useCallback(
    (command: Command) => {
      switch (command.type) {
        case 'next':
          dispatch({ type: 'NEXT_SLIDE' });
          break;
        case 'previous':
          dispatch({ type: 'PREV_SLIDE' });
          break;
        case 'goto':
          dispatch({ type: 'GOTO_SLIDE', slide: command.slide });
          break;
        case 'first':
          dispatch({ type: 'FIRST_SLIDE' });
          break;
        case 'last':
          dispatch({ type: 'LAST_SLIDE' });
          break;
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (speech.isFinal && speech.transcript) {
      if (speech.transcript === lastProcessedRef.current) return;
      lastProcessedRef.current = speech.transcript;

      const command = parseCommand(speech.transcript);
      if (command) {
        dispatchCommand(command);
      }
    }
  }, [speech.transcript, speech.isFinal, dispatchCommand]);

  useEffect(() => {
    if (state.lastCommand) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_COMMAND' }), 700);
      return () => clearTimeout(timer);
    }
  }, [state.lastCommand, dispatch]);

  useEffect(() => {
    if (!state.isPresenting) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          dispatch({ type: 'NEXT_SLIDE' });
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          dispatch({ type: 'PREV_SLIDE' });
          break;
        case 'Home':
          e.preventDefault();
          dispatch({ type: 'FIRST_SLIDE' });
          break;
        case 'End':
          e.preventDefault();
          dispatch({ type: 'LAST_SLIDE' });
          break;
        case ' ':
          e.preventDefault();
          speech.toggle();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            dispatch({ type: 'RESET' });
          }
          break;
        default:
          if (e.key >= '1' && e.key <= '9') {
            const slideNum = parseInt(e.key, 10) - 1;
            if (slideNum < state.slides.length) {
              dispatch({ type: 'GOTO_SLIDE', slide: slideNum });
            }
          }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPresenting, state.slides.length, dispatch, speech]);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  if (!state.isPresenting || state.slides.length === 0) {
    return (
      <UploadScreen
        onFilesSelected={handleFilesSelected}
        isLoading={isLoading || state.isLoading}
        error={error || state.error}
      />
    );
  }

  const currentSlide = state.slides[state.currentSlide];
  const gotoSlideNumber =
    state.lastCommand?.type === 'goto' ? state.lastCommand.slide : undefined;

  return (
    <div className="flex h-full w-full flex-col bg-nod-bg">
      {/* Main slide area */}
      <div className="flex-1 p-4 pb-0">
        <SlideViewer slide={currentSlide} />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 px-4 py-2">
        {/* Left: Nod Orb + voice */}
        <div className="relative flex items-center gap-3">
          <CommandFeedback command={state.lastCommand} />
          <div className="-my-4">
            <NodOrb
              lastCommand={state.lastCommand}
              isListening={speech.isListening}
              gotoSlideNumber={gotoSlideNumber}
            />
          </div>
          <VoiceIndicator
            isListening={speech.isListening}
            transcript={speech.transcript}
          />
        </div>

        {/* Center: thumbnails */}
        <div className="flex-1 overflow-hidden">
          <SlideNavigator
            slides={state.slides}
            currentSlide={state.currentSlide}
            onSlideClick={(i) => dispatch({ type: 'GOTO_SLIDE', slide: i })}
          />
        </div>

        {/* Right: toolbar */}
        <PresenterToolbar
          currentSlide={state.currentSlide}
          totalSlides={state.slides.length}
          isListening={speech.isListening}
          onPrev={() => dispatch({ type: 'PREV_SLIDE' })}
          onNext={() => dispatch({ type: 'NEXT_SLIDE' })}
          onToggleMic={speech.toggle}
          onToggleFullscreen={toggleFullscreen}
          onExit={() => dispatch({ type: 'RESET' })}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PresentationProvider>
        <BrowserCheck />
        <AppContent />
      </PresentationProvider>
    </ErrorBoundary>
  );
}
