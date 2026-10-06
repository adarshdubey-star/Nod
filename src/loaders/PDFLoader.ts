import * as pdfjsLib from 'pdfjs-dist';
import type { Slide, SlideLoader } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const RENDER_WIDTH = 1920;

export class PDFLoader implements SlideLoader {
  accepts(file: File): boolean {
    return (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    );
  }

  async load(file: File): Promise<Slide[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const slides: Slide[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);

      const viewport = page.getViewport({ scale: 1 });
      const scale = RENDER_WIDTH / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      await page.render({ canvas, viewport: scaledViewport }).promise;

      const imageDataUrl = canvas.toDataURL('image/png');

      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim();

      slides.push({
        index: i - 1,
        imageDataUrl,
        textContent: text,
      });
    }

    return slides;
  }
}
