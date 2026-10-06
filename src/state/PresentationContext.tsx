import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { PresentationState, PresentationAction } from '../types';
import { presentationReducer, initialState } from './presentationReducer';

const PresentationStateCtx = createContext<PresentationState>(initialState);
const PresentationDispatchCtx = createContext<Dispatch<PresentationAction>>(
  () => {},
);

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(presentationReducer, initialState);

  return (
    <PresentationStateCtx.Provider value={state}>
      <PresentationDispatchCtx.Provider value={dispatch}>
        {children}
      </PresentationDispatchCtx.Provider>
    </PresentationStateCtx.Provider>
  );
}

export function usePresentation(): PresentationState {
  return useContext(PresentationStateCtx);
}

export function usePresentationDispatch(): Dispatch<PresentationAction> {
  return useContext(PresentationDispatchCtx);
}
