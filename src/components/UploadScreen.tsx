import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      {/* Logo & title */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Nod Orb mini logo */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-nod-orb-start to-nod-orb-end opacity-40 blur-xl" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-nod-orb-start to-nod-orb-end shadow-lg">
              <svg width="28" height="20" viewBox="0 0 28 20">
                <circle cx="9" cy="9" r="3" fill="#e2e8f0" />
                <circle cx="19" cy="9" r="3" fill="#e2e8f0" />
                <circle cx="9.8" cy="8.5" r="1.3" fill="#0f1117" />
                <circle cx="19.8" cy="8.5" r="1.3" fill="#0f1117" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-nod-text">
          Nod
        </h1>
        <p className="mt-2 text-lg text-nod-muted">
          Voice-controlled presentations
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        className={`relative w-full max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? 'border-nod-orb-start bg-nod-orb-start/10'
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
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-nod-orb-start border-t-transparent" />
              <p className="text-nod-muted">Loading presentation…</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4 text-4xl">
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

      {/* Error display */}
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
