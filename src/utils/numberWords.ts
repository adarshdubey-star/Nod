const WORD_TO_NUMBER: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,

  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

export function wordToNumber(text: string): number | null {
  const lower = text.toLowerCase().trim();

  const direct = parseInt(lower, 10);
  if (!isNaN(direct)) return direct;

  if (WORD_TO_NUMBER[lower] !== undefined) return WORD_TO_NUMBER[lower];

  const parts = lower.split(/[\s-]+/);
  if (parts.length === 2) {
    const a = WORD_TO_NUMBER[parts[0]];
    const b = WORD_TO_NUMBER[parts[1]];
    if (a !== undefined && b !== undefined) {
      if (a >= 20 && b < 10) return a + b;
    }
  }

  return null;
}
