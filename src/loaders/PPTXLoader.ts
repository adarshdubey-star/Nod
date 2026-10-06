import JSZip from 'jszip';
import type { Slide, SlideLoader } from '../types';

function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.emf') || lower.endsWith('.wmf')) return 'image/x-emf';
  return 'image/png';
}

function extractTextFromSlideXml(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const textNodes = doc.getElementsByTagName('a:t');
  const parts: string[] = [];
  for (let i = 0; i < textNodes.length; i++) {
    const content = textNodes[i].textContent;
    if (content) parts.push(content);
  }
  return parts.join(' ').trim();
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export class PPTXLoader implements SlideLoader {
  accepts(file: File): boolean {
    return (
      file.type ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.name.toLowerCase().endsWith('.pptx')
    );
  }

  async load(file: File): Promise<Slide[]> {
    const zip = await JSZip.loadAsync(file);

    const slideXmlEntries: { index: number; path: string }[] = [];
    zip.forEach((relativePath) => {
      const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
      if (match) {
        slideXmlEntries.push({
          index: parseInt(match[1], 10),
          path: relativePath,
        });
      }
    });
    slideXmlEntries.sort((a, b) => a.index - b.index);

    const mediaFiles: Map<string, JSZip.JSZipObject> = new Map();
    zip.forEach((relativePath, entry) => {
      if (relativePath.startsWith('ppt/media/') && !entry.dir) {
        mediaFiles.set(relativePath, entry);
      }
    });

    const slideRelsMap: Map<number, Map<string, string>> = new Map();
    for (const entry of slideXmlEntries) {
      const relsPath = `ppt/slides/_rels/slide${entry.index}.xml.rels`;
      const relsFile = zip.file(relsPath);
      if (relsFile) {
        const relsXml = await relsFile.async('string');
        const parser = new DOMParser();
        const doc = parser.parseFromString(relsXml, 'application/xml');
        const rels = doc.getElementsByTagName('Relationship');
        const relMap = new Map<string, string>();
        for (let i = 0; i < rels.length; i++) {
          const id = rels[i].getAttribute('Id') || '';
          const target = rels[i].getAttribute('Target') || '';
          if (target.includes('media/')) {
            relMap.set(id, 'ppt/slides/' + target.replace('../', '../'));
          }
        }
        slideRelsMap.set(entry.index, relMap);
      }
    }

    const slides: Slide[] = [];

    for (let i = 0; i < slideXmlEntries.length; i++) {
      const entry = slideXmlEntries[i];
      const xmlFile = zip.file(entry.path);
      let textContent = '';

      if (xmlFile) {
        const xmlStr = await xmlFile.async('string');
        textContent = extractTextFromSlideXml(xmlStr);
      }

      let imageDataUrl = '';

      const rels = slideRelsMap.get(entry.index);
      if (rels && rels.size > 0) {
        const firstMediaRel = Array.from(rels.values())[0];
        const normalizedPath = firstMediaRel
          .replace('ppt/slides/../', 'ppt/')
          .replace('../', 'ppt/');
        const mediaEntry = mediaFiles.get(normalizedPath);

        if (mediaEntry) {
          const blob = await mediaEntry.async('blob');
          const mime = mimeFromName(normalizedPath);
          const typedBlob = new Blob([blob], { type: mime });
          imageDataUrl = await blobToDataUrl(typedBlob);
        }
      }

      if (!imageDataUrl) {
        imageDataUrl = generatePlaceholderSlide(i + 1, textContent);
      }

      slides.push({
        index: i,
        imageDataUrl,
        textContent,
      });
    }

    return slides;
  }
}

function generatePlaceholderSlide(
  slideNumber: number,
  textContent: string,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1d27';
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = '#6366f1';
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Slide ${slideNumber}`, 960, 200);

  if (textContent) {
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '28px system-ui, sans-serif';
    const words = textContent.split(' ');
    let line = '';
    let y = 350;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > 1600) {
        ctx.fillText(line.trim(), 960, y);
        line = word + ' ';
        y += 44;
        if (y > 900) break;
      } else {
        line = test;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), 960, y);
  }

  return canvas.toDataURL('image/png');
}
