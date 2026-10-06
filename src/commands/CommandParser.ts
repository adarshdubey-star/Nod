import type { Command } from '../types';
import { wordToNumber } from '../utils/numberWords';

/* ────────────────────────────────────────────────
 *  Wake-word: optionally prefix any command with
 *  "nod" or "hey nod" for explicit activation.
 *  When wake-word is present, confidence threshold
 *  is lowered because intent is unambiguous.
 * ──────────────────────────────────────────────── */
const WAKE_PREFIX = /^(?:hey\s+)?nod[\s,]+/i;

/* ────────────────────────────────────────────────
 *  Pattern tiers:
 *    STRONG  — unambiguous keywords, fine on their own
 *    PHRASE  — need 2+ word phrases to avoid false positives
 *
 *  Every pattern is wrapped in \b…\b and tested
 *  against the *stripped* transcript (wake-word removed).
 * ──────────────────────────────────────────────── */

// ── NEXT ──
const NEXT_STRONG = /\b(next(?:\s+slide)?|advance)\b/i;
const NEXT_PHRASE = /\b(move\s+forward|go\s+forward|step\s+forward)\b/i;

// ── PREVIOUS ──
const PREV_STRONG = /\b(previous(?:\s+slide)?|prev(?:\s+slide)?)\b/i;
const PREV_PHRASE = /\b(go\s+back(?:\s+one)?|move\s+back|step\s+back|one\s+back)\b/i;

// ── FIRST ──
const FIRST_PATTERN =
  /\b(first\s+slide|go\s+to\s+(?:the\s+)?(?:start|beginning|first)|start\s+over)\b/i;

// ── LAST ──
const LAST_PATTERN =
  /\b(last\s+slide|final\s+slide|go\s+to\s+(?:the\s+)?end)\b/i;

// ── GOTO ──
const GOTO_PATTERNS = [
  /\b(?:go\s+to|jump\s+to|switch\s+to|show)\s+(?:slide\s+)?(.+)/i,
  /\bslide\s+(?:number\s+)?(.+)/i,
];

/* ────────────────────────────────────────────────
 *  Confidence thresholds
 * ──────────────────────────────────────────────── */
const CONF_DEFAULT = 0.72;     // minimum without wake-word
const CONF_WITH_WAKE = 0.25;   // very low when user said "Nod, …"
const CONF_STRONG_WORD = 0.60; // strong keywords get a small discount

export interface ParseOptions {
  /** Confidence from the Speech API (0–1). Defaults to 1 (always accept). */
  confidence?: number;
}

export interface ParseResult {
  command: Command;
  /** Whether the wake-word "Nod" was used */
  hadWakeWord: boolean;
}

export function parseCommand(
  transcript: string,
  opts: ParseOptions = {},
): Command | null {
  const raw = transcript.trim();
  if (!raw || raw.length < 2) return null;

  const confidence = opts.confidence ?? 1;

  // Strip wake-word prefix if present
  const hasWake = WAKE_PREFIX.test(raw);
  const text = (hasWake ? raw.replace(WAKE_PREFIX, '') : raw)
    .toLowerCase()
    .trim();

  if (!text) return null;

  const minConf = hasWake ? CONF_WITH_WAKE : CONF_DEFAULT;
  const minConfStrong = hasWake ? CONF_WITH_WAKE : CONF_STRONG_WORD;

  // ── FIRST (test before GOTO to avoid "go to start" matching goto) ──
  if (FIRST_PATTERN.test(text) && confidence >= minConf) {
    return { type: 'first' };
  }

  // ── LAST ──
  if (LAST_PATTERN.test(text) && confidence >= minConf) {
    return { type: 'last' };
  }

  // ── GOTO ──
  for (const pattern of GOTO_PATTERNS) {
    const match = text.match(pattern);
    if (match && confidence >= minConf) {
      const numText = match[1].trim();
      const num = wordToNumber(numText);
      if (num !== null && num > 0) {
        return { type: 'goto', slide: num - 1 };
      }
    }
  }

  // ── NEXT ──
  if (NEXT_STRONG.test(text) && confidence >= minConfStrong) {
    return { type: 'next' };
  }
  if (NEXT_PHRASE.test(text) && confidence >= minConf) {
    return { type: 'next' };
  }

  // ── PREVIOUS ──
  if (PREV_STRONG.test(text) && confidence >= minConfStrong) {
    return { type: 'previous' };
  }
  if (PREV_PHRASE.test(text) && confidence >= minConf) {
    return { type: 'previous' };
  }

  return null;
}
