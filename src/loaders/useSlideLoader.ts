import { useCallback, useState } from 'react';
import type { Slide } from '../types';
import { PDFLoader } from './PDFLoader';
import { ImageLoader } from './ImageLoader';
import { PPTXLoader } from './PPTXLoader';

const pdfLoader = new PDFLoader();
const imageLoader = new ImageLoader();
const pptxLoader = new PPTXLoader();

export function useSlideLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async (files: File[]): Promise<Slide[]> => {
    setIsLoading(true);
    setError(null);

    try {
      if (files.length === 0) {
        throw new Error('No files selected');
      }

      if (files.length === 1) {
        const file = files[0];

        if (pdfLoader.accepts(file)) {
          return await pdfLoader.load(file);
        }

        if (pptxLoader.accepts(file)) {
          return await pptxLoader.load(file);
        }

        if (imageLoader.accepts(file)) {
          return await imageLoader.load(file);
        }

        throw new Error(`Unsupported file type: ${file.name}`);
      }

      const imageFiles = files.filter((f) => imageLoader.accepts(f));
      if (imageFiles.length > 0) {
        return await imageLoader.loadMultiple(imageFiles);
      }

      throw new Error('No supported files found in selection');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load slides';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { loadFiles, isLoading, error };
}
