export type LearningLanguageCode = 'en' | 'ko';

export interface LearningLanguageOption {
  code: LearningLanguageCode;
  shortCode: string;
  badgeCode: string;
  nativeLabel: string;
  enLabel: string;
  viLabel: string;
}

export const LEARNING_LANGUAGE_OPTIONS: LearningLanguageOption[] = [
  {
    code: 'en',
    shortCode: 'EN',
    badgeCode: 'EN',
    nativeLabel: 'English',
    enLabel: 'English',
    viLabel: 'Tiếng Anh',
  },
  {
    code: 'ko',
    shortCode: 'KO',
    badgeCode: '한',
    nativeLabel: '한국어',
    enLabel: 'Korean',
    viLabel: 'Tiếng Hàn',
  },
];

export function isLearningLanguageCode(value: unknown): value is LearningLanguageCode {
  return value === 'en' || value === 'ko';
}

export function containsHangul(text: string): boolean {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
}
