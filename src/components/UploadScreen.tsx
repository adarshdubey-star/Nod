import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DinoMascot from './DinoMascot';
import type { Command } from '../types';

interface UploadScreenProps {
  onFilesSelected: (files: File[]) => void;
  isLoading: boolean;
  error: string | null;
}

const FORMAT_BADGES = [
  { label: 'PDF', color: 'bg-red-500/20 text-red-400' },
  { label: 'PPTX', color: 'bg-orange-500/20 text-orange-400' },
  { label: 'Images', color: 'bg-emerald-500/20 text-emerald-400' },
];

export default function UploadScreen({
  onFilesSelected,
  isLoading,
  error,
}: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [heroCommand, setHeroCommand] = useState<Command | null>({ type: 'first' });
  const inputRef = useRef<HTMLInputElement>(null);

  // Brief greeting bounce when the home screen loads
  useEffect(() => {
    const t = setTimeout(() => setHeroCommand(null), 900);
    return () => clearTimeout(t);
  }, []);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesSelected(files);
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFilesSelected(files);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-y-auto p-8">
      {/* Hero: Dino mascot */}
      <motion.div
        className="mb-2 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DinoMascot
          lastCommand={heroCommand}
          isListening={false}
          size={220}
          showBadge={false}
        />

        <h1 className="mt-2 text-5xl font-black tracking-tight text-nod-text">
          Nod
        </h1>
        <p className="mt-2 text-base tracking-wide text-nod-muted">
          Voice-controlled presentations
        </p>
        <p className="mt-1 text-sm text-nod-muted/70">
          Say <span className="text-amber-300">“next”</span> or{' '}
          <span className="text-amber-300">“back”</span> — Nod will guide you
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        className={`relative mt-6 w-full max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? 'border-amber-400 bg-amber-400/10'
            : 'border-nod-border bg-nod-surface/50 hover:border-nod-muted'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.pptx,.png,.jpg,.jpeg,.webp,.gif,.svg"
          multiple
          onChange={handleFileInput}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              <p className="text-nod-muted">Loading your slides…</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 text-4xl text-amber-300">
                {isDragging ? '✦' : '↑'}
              </div>
              <p className="text-lg font-medium text-nod-text">
                {isDragging
                  ? 'Drop your presentation here'
                  : 'Drag & drop your presentation'}
              </p>
              <p className="mt-2 text-sm text-nod-muted">
                or click to browse files
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Format badges */}
      <motion.div
        className="mt-6 flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {FORMAT_BADGES.map(({ label, color }) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}
          >
            {label}
          </span>
        ))}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-4 text-sm text-nod-amber"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
