import { AnimatePresence, motion } from 'framer-motion';
import type { Slide } from '../types';

interface SlideViewerProps {
  slide: Slide;
}

export default function SlideViewer({ slide }: SlideViewerProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={slide.index}
          src={slide.imageDataUrl}
          alt={`Slide ${slide.index + 1}`}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  );
}
