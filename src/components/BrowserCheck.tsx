import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSpeechRecognitionSupported } from '../utils/browserSupport';

export default function BrowserCheck() {
  const [dismissed, setDismissed] = useState(false);
  const isSupported = isSpeechRecognitionSupported();

  if (isSupported || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between bg-nod-amber/10 px-4 py-2.5 backdrop-blur"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
      >
        <p className="text-sm text-nod-amber">
          <strong>Voice commands unavailable.</strong> Your browser doesn't
          support the Web Speech API. Use Chrome or Edge for voice control,
          or navigate with keyboard/mouse.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 rounded px-2 py-1 text-xs text-nod-amber hover:bg-nod-amber/10"
        >
          Dismiss
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
