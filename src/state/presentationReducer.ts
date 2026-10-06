import type { PresentationState, PresentationAction, Command } from '../types';

export const initialState: PresentationState = {
  slides: [],
  currentSlide: 0,
  isPresenting: false,
  lastCommand: null,
  isLoading: false,
  error: null,
};

function commandForAction(action: PresentationAction): Command | null {
  switch (action.type) {
    case 'NEXT_SLIDE':
      return { type: 'next' };
    case 'PREV_SLIDE':
      return { type: 'previous' };
    case 'GOTO_SLIDE':
      return { type: 'goto', slide: action.slide };
    case 'FIRST_SLIDE':
      return { type: 'first' };
    case 'LAST_SLIDE':
      return { type: 'last' };
    default:
      return null;
  }
}

export function presentationReducer(
  state: PresentationState,
  action: PresentationAction,
): PresentationState {
  const maxSlide = Math.max(0, state.slides.length - 1);

  switch (action.type) {
    case 'LOAD_SLIDES':
      return {
        ...state,
        slides: action.slides,
        currentSlide: 0,
        isLoading: false,
        error: null,
      };

    case 'NEXT_SLIDE':
      return {
        ...state,
        currentSlide: Math.min(state.currentSlide + 1, maxSlide),
        lastCommand: commandForAction(action),
      };

    case 'PREV_SLIDE':
      return {
        ...state,
        currentSlide: Math.max(state.currentSlide - 1, 0),
        lastCommand: commandForAction(action),
      };

    case 'GOTO_SLIDE': {
      const target = Math.max(0, Math.min(action.slide, maxSlide));
      return {
        ...state,
        currentSlide: target,
        lastCommand: commandForAction(action),
      };
    }

    case 'FIRST_SLIDE':
      return {
        ...state,
        currentSlide: 0,
        lastCommand: commandForAction(action),
      };

    case 'LAST_SLIDE':
      return {
        ...state,
        currentSlide: maxSlide,
        lastCommand: commandForAction(action),
      };

    case 'SET_PRESENTING':
      return { ...state, isPresenting: action.value };

    case 'SET_LOADING':
      return { ...state, isLoading: action.value };

    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };

    case 'CLEAR_COMMAND':
      return { ...state, lastCommand: null };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
