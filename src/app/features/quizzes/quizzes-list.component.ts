import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqModalComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe, TxKey } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { LearningLanguageCode } from '../../shared/types/learning-language.types';
import {
  PaginationMeta,
  QuizDifficulty,
  QuizSortKey,
  QuizStatus,
  QuizSummary,
  TopicSummary,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { TopicsApiService } from '../topics/topics-api.service';
import { QuizzesApiService } from './quizzes-api.service';

@Component({
  selector: 'app-quizzes-list',
  imports: [
    FormsModule,
    RouterLink,
    OqPageHeaderComponent,
    OqModalComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    TranslatePipe,
  ],
  templateUrl: './quizzes-list.component.html',
  styleUrl: './quizzes-list.component.scss',
})
export class QuizzesListComponent implements OnInit {
  private readonly quizzesApi = inject(QuizzesApiService);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);
  private lastLoadedLang: LearningLanguageCode | null = null;

  constructor() {
    effect(() => {
      const lang = this.learningLang.activeLang();
      if (this.lastLoadedLang && this.lastLoadedLang !== lang) {
        this.selectedTopicId = null;
        this.loadTopics();
        this.loadQuizzes(1);
      }
    });
  }

  protected readonly quizzes = signal<QuizSummary[]>([]);
  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly meta = signal<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected search = '';
  protected selectedTopicId: number | null = null;
  protected statusFilter: QuizStatus | '' = '';
  protected difficultyFilter: QuizDifficulty | '' = '';
  protected sortBy: QuizSortKey = 'newest';

  protected readonly confirmDeleteQuiz = signal<QuizSummary | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly showMoreFilters = signal(false);

  ngOnInit(): void {
    this.loadTopics();
    this.loadQuizzes(1);
  }

  private loadTopics(): void {
    this.topicsApi.list({ limit: 100, languageCode: this.learningLang.activeLang() }).subscribe({
      next: (res) => this.topics.set(res.items),
      error: () => undefined,
    });
  }

  loadQuizzes(page = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const activeLang = this.learningLang.activeLang();
    this.lastLoadedLang = activeLang;

    this.quizzesApi
      .list({
        search: this.search,
        languageCode: activeLang,
        topicId: this.selectedTopicId,
        status: this.statusFilter,
        difficulty: this.difficultyFilter,
        sortBy: this.sortBy,
        page,
        limit: 12,
      })
      .subscribe({
        next: (res) => {
          this.quizzes.set(res.items);
          this.meta.set(res.meta);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể tải danh sách bài kiểm tra'
                : 'Failed to load quizzes',
            ),
          );
          this.isLoading.set(false);
        },
      });
  }

  resetFilters(): void {
    this.search = '';
    this.selectedTopicId = null;
    this.statusFilter = '';
    this.difficultyFilter = '';
    this.sortBy = 'newest';
    this.loadQuizzes(1);
  }

  deleteSelectedQuiz(): void {
    const target = this.confirmDeleteQuiz();
    if (!target) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.quizzesApi.remove(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.confirmDeleteQuiz.set(null);
        this.successMessage.set(
          this.i18n.lang() === 'vi'
            ? `Đã xóa bài kiểm tra "${target.title}".`
            : `Deleted quiz "${target.title}".`,
        );
        this.loadQuizzes(this.meta().page);
      },
      error: (err: unknown) => {
        this.isDeleting.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi' ? 'Không thể xóa bài kiểm tra' : 'Failed to delete quiz',
          ),
        );
      },
    });
  }

  difficultyKey(diff: QuizDifficulty): TxKey {
    switch (diff) {
      case 'easy':
        return 'quizzes.easy';
      case 'medium':
        return 'quizzes.medium';
      case 'hard':
        return 'quizzes.hard';
    }
  }
}
