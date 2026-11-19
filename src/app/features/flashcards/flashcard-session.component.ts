import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  OqIconComponent,
  OqPageHeaderComponent,
  OqProgressBarComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe, TxKey } from '../../shared/i18n';
import { SpeechService } from '../../shared/services/speech.service';
import {
  FlashcardCardView,
  FlashcardSessionDetail,
  ReviewRating,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import {
  formatIntervalDays,
  formatProgressStatusLabel,
  formatReviewRatingLabel,
  formatStudyModeLabel,
} from './flashcard-labels';
import { FlashcardsApiService } from './flashcards-api.service';

@Component({
  selector: 'app-flashcard-session',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    OqPageHeaderComponent,
    OqProgressBarComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './flashcard-session.component.html',
  styleUrl: './flashcard-session.component.scss',
  host: {
    '(window:keydown)': 'onKeydown($event)',
  },
})
export class FlashcardSessionComponent implements OnInit {
  private readonly api = inject(FlashcardsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  protected readonly speech = inject(SpeechService);

  readonly session = signal<FlashcardSessionDetail | null>(null);
  readonly currentIndex = signal(0);
  readonly isFlipped = signal(false);
  readonly hasFlippedOnce = signal(false);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isCompleting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackMessage = signal<string | null>(null);

  readonly currentCard = computed<FlashcardCardView | null>(() => {
    const s = this.session();
    if (!s || s.cards.length === 0) {
      return null;
    }
    const idx = Math.min(Math.max(0, this.currentIndex()), s.cards.length - 1);
    return s.cards[idx] ?? null;
  });

  readonly forgottenCards = computed<FlashcardCardView[]>(() => {
    const s = this.session();
    if (!s) {
      return [];
    }
    const ids = new Set(s.forgottenVocabularyIds);
    return s.cards.filter((card) => ids.has(card.id));
  });

  readonly ratingButtons: Array<{
    rating: ReviewRating;
    keyHint: string;
    labelKey: TxKey;
    hintEn: string;
    hintVi: string;
    tone: 'danger' | 'warning' | 'primary' | 'success';
  }> = [
    {
      rating: 'again',
      keyHint: '1',
      labelKey: 'fc.ratingAgain',
      hintEn: 'Reset (< 1 day)',
      hintVi: 'Đặt lại (< 1 ngày)',
      tone: 'danger',
    },
    {
      rating: 'hard',
      keyHint: '2',
      labelKey: 'fc.ratingHard',
      hintEn: 'Shorter interval',
      hintVi: 'Rút ngắn khoảng ôn',
      tone: 'warning',
    },
    {
      rating: 'good',
      keyHint: '3',
      labelKey: 'fc.ratingGood',
      hintEn: 'Standard step',
      hintVi: 'Mức tiêu chuẩn',
      tone: 'primary',
    },
    {
      rating: 'easy',
      keyHint: '4',
      labelKey: 'fc.ratingEasy',
      hintEn: 'Boosted interval',
      hintVi: 'Tăng khoảng ôn',
      tone: 'success',
    },
  ];

  readonly formatMode = formatStudyModeLabel;
  readonly formatStatus = formatProgressStatusLabel;
  readonly formatInterval = formatIntervalDays;
  readonly formatRating = formatReviewRatingLabel;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id > 0) {
        this.loadSession(id);
      }
    });
  }

  loadSession(sessionId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.feedbackMessage.set(null);

    this.api.getSession(sessionId).subscribe({
      next: (detail) => {
        this.session.set(detail);
        const firstUnreviewed = detail.cards.findIndex((card) => card.sessionReviewCount === 0);
        this.currentIndex.set(firstUnreviewed >= 0 ? firstUnreviewed : 0);
        this.resetCardFlip();
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải phiên thẻ ghi nhớ.'
              : 'Could not load flashcard session.',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  toggleFlip(): void {
    const next = !this.isFlipped();
    if (next) {
      this.hasFlippedOnce.set(true);
    }
    this.isFlipped.set(next);
  }

  previousCard(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.resetCardFlip();
    }
  }

  nextCard(): void {
    const s = this.session();
    if (!s) {
      return;
    }
    if (this.currentIndex() < s.cards.length - 1) {
      this.currentIndex.update((i) => i + 1);
      this.resetCardFlip();
    }
  }

  selectCard(index: number): void {
    const s = this.session();
    if (!s || index < 0 || index >= s.cards.length) {
      return;
    }
    this.currentIndex.set(index);
    this.resetCardFlip();
  }

  private resetCardFlip(): void {
    this.isFlipped.set(false);
    this.hasFlippedOnce.set(false);
  }

  rateCurrent(rating: ReviewRating): void {
    const s = this.session();
    const card = this.currentCard();
    if (!s || !card || s.status === 'completed' || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.api.recordReview(s.id, card.id, rating).subscribe({
      next: ({ session, updatedProgress }) => {
        this.session.set(session);
        this.isSubmitting.set(false);
        const lang = this.i18n.lang();
        this.feedbackMessage.set(
          lang === 'vi'
            ? `Đã lưu "${card.term}" ở mức ${this.formatRating(rating, lang)} — ôn lại sau ${this.formatInterval(updatedProgress.intervalDays, lang)}.`
            : `Saved "${card.term}" as ${this.formatRating(rating, lang)} — next review in ${this.formatInterval(updatedProgress.intervalDays, lang)}.`,
        );

        const nextUnreviewedIdx = session.cards.findIndex(
          (c, idx) => idx > this.currentIndex() && c.sessionReviewCount === 0,
        );
        if (nextUnreviewedIdx >= 0) {
          this.currentIndex.set(nextUnreviewedIdx);
          this.resetCardFlip();
        } else if (this.currentIndex() < session.cards.length - 1) {
          this.currentIndex.update((i) => i + 1);
          this.resetCardFlip();
        } else {
          this.resetCardFlip();
        }
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể lưu đánh giá thẻ.'
              : 'Could not save card rating.',
          ),
        );
        this.isSubmitting.set(false);
      },
    });
  }

  completeSession(): void {
    const s = this.session();
    if (!s || this.isCompleting()) {
      return;
    }

    this.isCompleting.set(true);
    this.errorMessage.set(null);

    this.api.completeSession(s.id).subscribe({
      next: (completed) => {
        this.session.set(completed);
        this.isCompleting.set(false);
        this.resetCardFlip();
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể hoàn thành phiên ôn tập.'
              : 'Could not complete review session.',
          ),
        );
        this.isCompleting.set(false);
      },
    });
  }

  practiceForgottenAgain(): void {
    const s = this.session();
    if (!s || s.forgottenVocabularyIds.length === 0 || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.api
      .createSession({
        languageCode: s.languageCode,
        topicId: s.topicId,
        vocabularyIds: s.forgottenVocabularyIds,
      })
      .subscribe({
        next: (nextSession) => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/flashcards/sessions', nextSession.id]);
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể bắt đầu bộ thẻ cần ôn lại.'
                : 'Could not start forgotten cards deck.',
            ),
          );
          this.isSubmitting.set(false);
        },
      });
  }

  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
    ) {
      return;
    }

    const s = this.session();
    if (!s || s.status !== 'in_progress') {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousCard();
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextCard();
      return;
    }

    if (
      (event.code === 'Space' || event.key === 'Enter') &&
      target?.tagName !== 'BUTTON' &&
      target?.tagName !== 'A'
    ) {
      event.preventDefault();
      this.toggleFlip();
      return;
    }

    if (this.isFlipped() && !this.isSubmitting()) {
      if (event.key === '1') this.rateCurrent('again');
      if (event.key === '2') this.rateCurrent('hard');
      if (event.key === '3') this.rateCurrent('good');
      if (event.key === '4') this.rateCurrent('easy');
    }
  }
}
