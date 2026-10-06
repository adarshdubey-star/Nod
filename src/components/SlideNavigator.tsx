import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Slide } from '../types';

interface SlideNavigatorProps {
  slides: Slide[];
  currentSlide: number;
  onSlideClick: (index: number) => void;
}

export default function SlideNavigator({
  slides,
  currentSlide,
  onSlideClick,
}: SlideNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentSlide]);

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto px-2 py-2 scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {slides.map((slide, i) => {
        const isActive = i === currentSlide;
        return (
          <motion.button
            key={i}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSlideClick(i)}
            className={`relative flex-shrink-0 overflow-hidden rounded-md transition-all ${
              isActive
                ? 'ring-2 ring-nod-orb-start ring-offset-2 ring-offset-nod-bg'
                : 'opacity-50 hover:opacity-80'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={slide.imageDataUrl}
              alt={`Slide ${i + 1}`}
              className="h-14 w-24 object-cover"
            />
            <span className="absolute bottom-0.5 right-1 text-[10px] font-medium text-white/80 drop-shadow">
              {i + 1}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
