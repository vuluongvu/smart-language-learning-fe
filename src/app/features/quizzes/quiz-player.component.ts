import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  OqIconComponent,
  OqModalComponent,
  OqPageHeaderComponent,
  OqProgressBarComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import {
  AttemptAnswerSubmission,
  AttemptDetail,
  QuestionType,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { QuizzesApiService } from './quizzes-api.service';

@Component({
  selector: 'app-quiz-player',
  imports: [
    FormsModule,
    RouterLink,
    OqPageHeaderComponent,
    OqProgressBarComponent,
    OqModalComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './quiz-player.component.html',
  styleUrl: './quiz-player.component.scss',
})
export class QuizPlayerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quizzesApi = inject(QuizzesApiService);
  private readonly i18n = inject(I18nService);

  protected readonly attempt = signal<AttemptDetail | null>(null);
  protected readonly currentIndex = signal(0);
  protected readonly selectedOptions = signal<Record<number, number | null>>({});
  protected readonly blankTexts = signal<Record<number, string | undefined>>({});

  protected readonly isLoading = signal(true);
  protected readonly isSavingProgress = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly confirmPartialSubmit = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly currentQuestion = computed(() => {
    const att = this.attempt();
    if (!att || att.questions.length === 0) return null;
    return att.questions[this.currentIndex()] ?? null;
  });

  protected readonly answeredCount = computed(() => {
    const att = this.attempt();
    if (!att) return 0;
    return att.questions.filter((q) => this.isQuestionAnswered(q.id, q.questionType)).length;
  });

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    const forceNew = this.route.snapshot.queryParamMap.get('new') === '1';

    if (!quizId || quizId <= 0) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi' ? 'ID bài kiểm tra không hợp lệ.' : 'Invalid quiz ID.',
      );
      this.isLoading.set(false);
      return;
    }

    this.quizzesApi.startAttempt(quizId, forceNew).subscribe({
      next: (attempt) => {
        if (attempt.status === 'completed') {
          void this.router.navigate(['/attempts', attempt.id]);
          return;
        }
        const optMap: Record<number, number | null> = {};
        const textMap: Record<number, string> = {};
        for (const q of attempt.questions) {
          optMap[q.id] = q.savedSelectedOptionId;
          textMap[q.id] = q.savedAnswerText ?? '';
        }
        this.selectedOptions.set(optMap);
        this.blankTexts.set(textMap);
        this.attempt.set(attempt);
        this.currentIndex.set(0);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể bắt đầu bài kiểm tra' : 'Unable to start quiz',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  isQuestionAnswered(questionId: number, type: QuestionType): boolean {
    if (type === 'fill_blank') {
      return Boolean((this.blankTexts()[questionId] ?? '').trim());
    }
    return this.selectedOptions()[questionId] != null;
  }

  selectOption(questionId: number, optionId: number): void {
    this.confirmPartialSubmit.set(false);
    this.selectedOptions.update((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }

  updateBlankText(questionId: number, text: string): void {
    this.confirmPartialSubmit.set(false);
    this.blankTexts.update((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  }

  goToQuestion(index: number): void {
    const att = this.attempt();
    if (!att || index < 0 || index >= att.questions.length) return;
    this.saveProgressQuietly();
    this.currentIndex.set(index);
  }

  saveAndExit(): void {
    const att = this.attempt();
    if (!att) {
      void this.router.navigate(['/quizzes']);
      return;
    }

    this.isSavingProgress.set(true);
    this.quizzesApi.saveAttemptProgress(att.id, this.buildSubmissions()).subscribe({
      next: () => {
        this.isSavingProgress.set(false);
        void this.router.navigate(['/quizzes']);
      },
      error: () => {
        this.isSavingProgress.set(false);
        void this.router.navigate(['/quizzes']);
      },
    });
  }

  requestSubmit(): void {
    const att = this.attempt();
    if (!att) return;

    const unanswered = att.questions.length - this.answeredCount();
    if (unanswered > 0 && !this.confirmPartialSubmit()) {
      this.confirmPartialSubmit.set(true);
      return;
    }

    this.submitNow();
  }

  submitNow(): void {
    const att = this.attempt();
    if (!att || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.quizzesApi.submitAttempt(att.id, this.buildSubmissions()).subscribe({
      next: (completed) => {
        this.isSubmitting.set(false);
        void this.router.navigate(['/attempts', completed.id]);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể nộp bài kiểm tra' : 'Failed to submit quiz',
          ),
        );
      },
    });
  }

  questionTypeLabel(type: QuestionType): string {
    switch (type) {
      case 'multiple_choice':
        return this.i18n.t('qb.typeMcq');
      case 'word_meaning':
        return this.i18n.t('qb.typeMeaning');
      case 'fill_blank':
        return this.i18n.t('qb.typeBlank');
    }
  }

  private saveProgressQuietly(): void {
    const att = this.attempt();
    if (!att) return;
    this.quizzesApi
      .saveAttemptProgress(att.id, this.buildSubmissions())
      .subscribe({ error: () => undefined });
  }

  private buildSubmissions(): AttemptAnswerSubmission[] {
    const att = this.attempt();
    if (!att) return [];
    const optMap = this.selectedOptions();
    const textMap = this.blankTexts();

    return att.questions.map((q) =>
      q.questionType === 'fill_blank'
        ? {
            questionId: q.id,
            answerText: textMap[q.id] ?? '',
          }
        : {
            questionId: q.id,
            selectedOptionId: optMap[q.id] ?? null,
          },
    );
  }
}
