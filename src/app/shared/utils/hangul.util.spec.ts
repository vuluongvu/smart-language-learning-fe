import { describe, expect, it } from 'vitest';
import { containsHangul, extractHangulCharacters } from './hangul.util';

describe('hangul.util', () => {
  it('detects Hangul presence in Korean strings and ignores plain Latin text', () => {
    expect(containsHangul('안녕하세요')).toBe(true);
    expect(containsHangul('ㄱ ㅏ')).toBe(true);
    expect(containsHangul('hello world')).toBe(false);
    expect(containsHangul('')).toBe(false);
  });

  it('extracts Hangul syllables and Jamo while stripping punctuation and spaces', () => {
    expect(extractHangulCharacters('안녕하세요!')).toEqual(['안', '녕', '하', '세', '요']);
    expect(extractHangulCharacters('감사합니다 (gamsahamnida)')).toEqual([
      '감',
      '사',
      '합',
      '니',
      '다',
    ]);
    expect(extractHangulCharacters('가나다 / ㄱㄴ')).toEqual(['가', '나', '다', 'ㄱ', 'ㄴ']);
    expect(extractHangulCharacters('resilient')).toEqual([]);
  });
});
