import { describe, it, expect } from 'vitest';
import { parseCommand } from './CommandParser';

describe('parseCommand', () => {
  describe('next slide', () => {
    it.each([
      'next',
      'next slide',
      'forward',
      'move forward',
      'advance',
    ])('parses "%s" as next', (input) => {
      expect(parseCommand(input)).toEqual({ type: 'next' });
    });
  });

  describe('previous slide', () => {
    it.each([
      'previous',
      'prev',
      'back',
      'go back',
      'move back',
    ])('parses "%s" as previous', (input) => {
      expect(parseCommand(input)).toEqual({ type: 'previous' });
    });
  });

  describe('first slide', () => {
    it.each([
      'first slide',
      'beginning',
      'start',
      'go to the start',
      'go to the beginning',
    ])('parses "%s" as first', (input) => {
      expect(parseCommand(input)).toEqual({ type: 'first' });
    });
  });

  describe('last slide', () => {
    it.each([
      'last slide',
      'end',
      'go to the end',
      'final slide',
    ])('parses "%s" as last', (input) => {
      expect(parseCommand(input)).toEqual({ type: 'last' });
    });
  });

  describe('goto slide', () => {
    it('parses "go to slide 5"', () => {
      expect(parseCommand('go to slide 5')).toEqual({ type: 'goto', slide: 4 });
    });

    it('parses "slide 3"', () => {
      expect(parseCommand('slide 3')).toEqual({ type: 'goto', slide: 2 });
    });

    it('parses "jump to 10"', () => {
      expect(parseCommand('jump to 10')).toEqual({ type: 'goto', slide: 9 });
    });

    it('parses "go to slide five"', () => {
      expect(parseCommand('go to slide five')).toEqual({ type: 'goto', slide: 4 });
    });

    it('parses "slide number seven"', () => {
      expect(parseCommand('slide number seven')).toEqual({ type: 'goto', slide: 6 });
    });

    it('parses "show slide twenty three"', () => {
      expect(parseCommand('show slide twenty three')).toEqual({ type: 'goto', slide: 22 });
    });
  });

  describe('non-commands', () => {
    it.each([
      'hello everyone',
      'today we will discuss',
      'let me explain this chart',
      '',
      '   ',
    ])('returns null for "%s"', (input) => {
      expect(parseCommand(input)).toBeNull();
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase', () => {
      expect(parseCommand('NEXT')).toEqual({ type: 'next' });
    });

    it('handles mixed case', () => {
      expect(parseCommand('Go To Slide 3')).toEqual({ type: 'goto', slide: 2 });
    });
  });
});
