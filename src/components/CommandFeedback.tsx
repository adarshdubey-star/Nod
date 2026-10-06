import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Command } from '../types';

interface CommandFeedbackProps {
  command: Command | null;
}

function formatCommand(command: Command): string {
  switch (command.type) {
    case 'next':
      return 'Next slide →';
    case 'previous':
      return '← Previous slide';
    case 'goto':
      return `Slide ${command.slide + 1}`;
    case 'first':
      return 'First slide';
    case 'last':
      return 'Last slide';
    case 'unknown':
      return `"${command.raw}"`;
    default:
      return '';
  }
}

export default function CommandFeedback({ command }: CommandFeedbackProps) {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (command) {
      setDisplayText(formatCommand(command));
      setVisible(true);

      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [command]);

  return (
    <AnimatePresence>
      {visible && displayText && (
        <motion.div
          className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-nod-surface/90 px-3 py-1.5 text-xs font-medium text-nod-text shadow-lg backdrop-blur"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {displayText}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
