import { describe, it, expect } from 'vitest';
import { parseCommand } from './CommandParser';

/* Helper: simulate high-confidence final result (default for explicit commands) */
const hi = { confidence: 0.95 };
const lo = { confidence: 0.35 };

describe('parseCommand', () => {
  describe('next slide', () => {
    it.each([
      'next',
      'next slide',
      'advance',
      'move forward',
      'go forward',
      'step forward',
    ])('parses "%s" as next', (input) => {
      expect(parseCommand(input, hi)).toEqual({ type: 'next' });
    });
  });

  describe('previous slide', () => {
    it.each([
      'previous',
      'prev',
      'previous slide',
      'prev slide',
      'go back',
      'go back one',
      'move back',
      'step back',
      'one back',
    ])('parses "%s" as previous', (input) => {
      expect(parseCommand(input, hi)).toEqual({ type: 'previous' });
    });
  });

  describe('first slide', () => {
    it.each([
      'first slide',
      'go to the start',
      'go to the beginning',
      'go to the first',
      'start over',
    ])('parses "%s" as first', (input) => {
      expect(parseCommand(input, hi)).toEqual({ type: 'first' });
    });
  });

  describe('last slide', () => {
    it.each([
      'last slide',
      'go to the end',
      'final slide',
    ])('parses "%s" as last', (input) => {
      expect(parseCommand(input, hi)).toEqual({ type: 'last' });
    });
  });

  describe('goto slide', () => {
    it('parses "go to slide 5"', () => {
      expect(parseCommand('go to slide 5', hi)).toEqual({ type: 'goto', slide: 4 });
    });

    it('parses "slide 3"', () => {
      expect(parseCommand('slide 3', hi)).toEqual({ type: 'goto', slide: 2 });
    });

    it('parses "jump to 10"', () => {
      expect(parseCommand('jump to 10', hi)).toEqual({ type: 'goto', slide: 9 });
    });

    it('parses "go to slide five"', () => {
      expect(parseCommand('go to slide five', hi)).toEqual({ type: 'goto', slide: 4 });
    });

    it('parses "slide number seven"', () => {
      expect(parseCommand('slide number seven', hi)).toEqual({ type: 'goto', slide: 6 });
    });

    it('parses "show slide twenty three"', () => {
      expect(parseCommand('show slide twenty three', hi)).toEqual({ type: 'goto', slide: 22 });
    });
  });

  describe('non-commands (should NOT trigger)', () => {
    it.each([
      'hello everyone',
      'today we will discuss',
      'let me explain this chart',
      '',
      '   ',
    ])('returns null for "%s"', (input) => {
      expect(parseCommand(input, hi)).toBeNull();
    });

    // Ambiguous single words that used to false-trigger
    it.each([
      'back',
      'forward',
      'start',
      'end',
      'before',
      'beginning',
    ])('rejects ambiguous standalone word "%s"', (input) => {
      expect(parseCommand(input, hi)).toBeNull();
    });
  });

  describe('low confidence rejection', () => {
    it('rejects "next" at low confidence', () => {
      expect(parseCommand('next', lo)).toBeNull();
    });

    it('rejects "previous" at low confidence', () => {
      expect(parseCommand('previous', lo)).toBeNull();
    });

    it('rejects "go to slide 3" at low confidence', () => {
      expect(parseCommand('go to slide 3', lo)).toBeNull();
    });
  });

  describe('wake word "Nod"', () => {
    it('accepts "nod next" even at low confidence', () => {
      expect(parseCommand('nod next', lo)).toEqual({ type: 'next' });
    });

    it('accepts "hey nod, go back" at low confidence', () => {
      expect(parseCommand('hey nod, go back', lo)).toEqual({ type: 'previous' });
    });

    it('accepts "nod slide 5" at low confidence', () => {
      expect(parseCommand('nod slide 5', lo)).toEqual({ type: 'goto', slide: 4 });
    });

    it('accepts "nod last slide" at low confidence', () => {
      expect(parseCommand('nod last slide', lo)).toEqual({ type: 'last' });
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase', () => {
      expect(parseCommand('NEXT', hi)).toEqual({ type: 'next' });
    });

    it('handles mixed case', () => {
      expect(parseCommand('Go To Slide 3', hi)).toEqual({ type: 'goto', slide: 2 });
    });
  });

  describe('backward compat — no confidence arg defaults to accept', () => {
    it('accepts "next" with no options', () => {
      expect(parseCommand('next')).toEqual({ type: 'next' });
    });

    it('accepts "go to slide 3" with no options', () => {
      expect(parseCommand('go to slide 3')).toEqual({ type: 'goto', slide: 2 });
    });
  });
});
