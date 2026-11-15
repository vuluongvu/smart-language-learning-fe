import { AppLocale, EN_TRANSLATIONS, TxKey, VI_TRANSLATIONS } from '../../shared/i18n';
import {
  FlashcardSessionMode,
  ReviewRating,
  VocabularyProgressStatus,
} from '../../shared/types/learning.types';

function pickTx(key: TxKey, lang: AppLocale): string {
  return lang === 'vi' ? VI_TRANSLATIONS[key] : EN_TRANSLATIONS[key];
}

export function formatStudyModeLabel(mode: FlashcardSessionMode, lang: AppLocale = 'en'): string {
  switch (mode) {
    case 'due_and_new':
      return pickTx('fc.modeDueNewShort', lang);
    case 'due_only':
      return pickTx('fc.modeDueOnly', lang);
    case 'new_only':
      return pickTx('fc.modeNewOnly', lang);
    case 'hard_only':
      return pickTx('fc.modeHardShort', lang);
    case 'all':
      return pickTx('fc.modeAllShort', lang);
    case 'custom':
    default:
      return pickTx('fc.modeCustomShort', lang);
  }
}

export function formatProgressStatusLabel(
  status: VocabularyProgressStatus | undefined,
  isDue = false,
  lang: AppLocale = 'en',
): string {
  if (isDue) {
    return pickTx('vocab.statusDue', lang);
  }
  switch (status) {
    case 'learning':
      return pickTx('vocab.statusLearning', lang);
    case 'mastered':
      return pickTx('vocab.statusMastered', lang);
    case 'new':
    default:
      return pickTx('vocab.statusNew', lang);
  }
}

export function formatIntervalDays(days: number, lang: AppLocale = 'en'): string {
  if (days <= 0) {
    return pickTx('fc.intervalLtDay', lang);
  }
  if (days === 1) {
    return pickTx('fc.interval1Day', lang);
  }
  return pickTx('fc.intervalNDays', lang).replaceAll('{{days}}', String(days));
}

export function formatReviewRatingLabel(rating: ReviewRating, lang: AppLocale = 'en'): string {
  switch (rating) {
    case 'again':
      return pickTx('fc.ratingAgain', lang);
    case 'hard':
      return pickTx('fc.ratingHard', lang);
    case 'good':
      return pickTx('fc.ratingGood', lang);
    case 'easy':
      return pickTx('fc.ratingEasy', lang);
  }
}
