import { motion } from 'framer-motion';

interface PresenterToolbarProps {
  currentSlide: number;
  totalSlides: number;
  isListening: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleMic: () => void;
  onToggleFullscreen: () => void;
  onExit: () => void;
}

export default function PresenterToolbar({
  currentSlide,
  totalSlides,
  isListening,
  onPrev,
  onNext,
  onToggleMic,
  onToggleFullscreen,
  onExit,
}: PresenterToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Slide counter */}
      <span className="text-sm font-medium tabular-nums text-nod-muted">
        {currentSlide + 1}{' '}
        <span className="text-nod-muted/50">/</span> {totalSlides}
      </span>

      <div className="mx-1 h-4 w-px bg-nod-border" />

      {/* Prev */}
      <ToolbarButton onClick={onPrev} label="Previous slide" disabled={currentSlide === 0}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      {/* Next */}
      <ToolbarButton onClick={onNext} label="Next slide" disabled={currentSlide >= totalSlides - 1}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      <div className="mx-1 h-4 w-px bg-nod-border" />

      {/* Mic toggle */}
      <ToolbarButton
        onClick={onToggleMic}
        label={isListening ? 'Mute mic' : 'Unmute mic'}
        active={isListening}
      >
        {isListening ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="6" y="1" width="4" height="9" rx="2" fill="currentColor" />
            <path d="M3 7a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="6" y="1" width="4" height="9" rx="2" fill="currentColor" opacity="0.4" />
            <path d="M3 7a5 5 0 0010 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </ToolbarButton>

      {/* Fullscreen */}
      <ToolbarButton onClick={onToggleFullscreen} label="Toggle fullscreen">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarButton>

      {/* Exit */}
      <ToolbarButton onClick={onExit} label="Exit presentation">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-nod-orb-start/20 text-nod-orb-start'
          : 'text-nod-muted hover:bg-nod-surface hover:text-nod-text'
      } disabled:opacity-30 disabled:cursor-not-allowed`}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
    >
      {children}
    </motion.button>
  );
}
