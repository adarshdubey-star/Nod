import type { Slide, SlideLoader } from '../types';

const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export class ImageLoader implements SlideLoader {
  accepts(file: File): boolean {
    if (IMAGE_TYPES.includes(file.type)) return true;
    const name = file.name.toLowerCase();
    return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
  }

  async load(file: File): Promise<Slide[]> {
    const imageDataUrl = await readFileAsDataUrl(file);
    return [
      {
        index: 0,
        imageDataUrl,
        textContent: '',
      },
    ];
  }

  async loadMultiple(files: File[]): Promise<Slide[]> {
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    const slides: Slide[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const imageDataUrl = await readFileAsDataUrl(sorted[i]);
      slides.push({
        index: i,
        imageDataUrl,
        textContent: '',
      });
    }

    return slides;
  }
}
