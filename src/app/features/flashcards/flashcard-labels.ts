import {
  FlashcardSessionMode,
  ReviewRating,
  VocabularyProgressStatus,
} from '../../shared/types/learning.types';

export function formatStudyModeLabel(mode: FlashcardSessionMode): string {
  switch (mode) {
    case 'due_and_new':
      return 'Due & New';
    case 'due_only':
      return 'Due Only';
    case 'new_only':
      return 'New Cards Only';
    case 'hard_only':
      return 'Hard Cards';
    case 'all':
      return 'All Cards';
    case 'custom':
    default:
      return 'Custom Deck';
  }
}

export function formatProgressStatusLabel(
  status: VocabularyProgressStatus | undefined,
  isDue = false,
): string {
  if (isDue) {
    return 'Due';
  }
  switch (status) {
    case 'learning':
      return 'Learning';
    case 'mastered':
      return 'Mastered';
    case 'new':
    default:
      return 'New';
  }
}

export function formatIntervalDays(days: number): string {
  if (days <= 0) {
    return '< 1 day';
  }
  return days === 1 ? '1 day' : `${days} days`;
}

export function formatReviewRatingLabel(rating: ReviewRating): string {
  switch (rating) {
    case 'again':
      return 'Again';
    case 'hard':
      return 'Hard';
    case 'good':
      return 'Good';
    case 'easy':
      return 'Easy';
  }
}
