import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isListening: boolean;
}

export default function VoiceIndicator({ isListening }: VoiceIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Mic status dot — green pulse when listening, dim when off */}
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
    </div>
  );
}
