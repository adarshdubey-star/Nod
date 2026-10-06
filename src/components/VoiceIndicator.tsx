import { motion, AnimatePresence } from 'framer-motion';

interface VoiceIndicatorProps {
  isListening: boolean;
  transcript: string;
}

export default function VoiceIndicator({
  isListening,
  transcript,
}: VoiceIndicatorProps) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {/* Mic status dot */}
      <div className="relative flex h-3 w-3 flex-shrink-0 items-center justify-center">
        <div
          className={`h-2 w-2 rounded-full transition-colors ${
            isListening ? 'bg-emerald-400' : 'bg-nod-muted/50'
          }`}
        />
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400/40"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </div>

      {/* Live transcript */}
      <AnimatePresence mode="wait">
        {transcript ? (
          <motion.span
            key={transcript}
            className="max-w-xs truncate text-xs text-nod-muted"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 0.8, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {transcript}
          </motion.span>
        ) : (
          <motion.span
            key="status"
            className="text-xs text-nod-muted/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isListening ? 'Listening…' : 'Mic off'}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
