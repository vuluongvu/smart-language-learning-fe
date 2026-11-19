export { containsHangul } from '../types/learning-language.types';

/**
 * Matches precomposed Hangul syllables (U+AC00..U+D7A3) and Hangul
 * Compatibility Jamo (U+3131..U+318E) supported by `hangul-writer`.
 */
const HANGUL_CHAR_REGEX = /[\u3131-\u318E\uAC00-\uD7A3]/;

/**
 * Extracts individual drawable Hangul syllables or Compatibility Jamo characters
 * in visual order, skipping spaces, punctuation, and Latin/Romanization text.
 */
export function extractHangulCharacters(text: string | null | undefined): string[] {
  if (!text) return [];
  const normalized = text.normalize('NFC');
  const result: string[] = [];
  for (const ch of normalized) {
    if (HANGUL_CHAR_REGEX.test(ch)) {
      result.push(ch);
    }
  }
  return result;
}
