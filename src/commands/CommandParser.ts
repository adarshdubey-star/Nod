import type { Command } from '../types';
import { wordToNumber } from '../utils/numberWords';

const NEXT_PATTERNS =
  /\b(next|next\s+slide|forward|move\s+forward|go\s+forward|advance)\b/i;

const PREV_PATTERNS =
  /\b(previous|prev|back|go\s+back|move\s+back|last\s+one|before)\b/i;

const FIRST_PATTERNS =
  /\b(first\s+slide|beginning|start|go\s+to\s+(?:the\s+)?start|go\s+to\s+(?:the\s+)?beginning)\b/i;

const LAST_PATTERNS =
  /\b(last\s+slide|end|go\s+to\s+(?:the\s+)?end|final\s+slide)\b/i;

const GOTO_PATTERNS = [
  /(?:go\s+to|jump\s+to|show|open|switch\s+to)\s+(?:slide\s+)?(.+)/i,
  /slide\s+(?:number\s+)?(.+)/i,
];

export function parseCommand(transcript: string): Command | null {
  const text = transcript.toLowerCase().trim();

  if (!text) return null;

  if (FIRST_PATTERNS.test(text)) {
    return { type: 'first' };
  }

  if (LAST_PATTERNS.test(text)) {
    return { type: 'last' };
  }

  for (const pattern of GOTO_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const numText = match[1].trim();
      const num = wordToNumber(numText);
      if (num !== null && num > 0) {
        return { type: 'goto', slide: num - 1 };
      }
    }
  }

  if (NEXT_PATTERNS.test(text)) {
    return { type: 'next' };
  }

  if (PREV_PATTERNS.test(text)) {
    return { type: 'previous' };
  }

  return null;
}
