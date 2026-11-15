import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AttemptSummary,
  PaginationMeta,
  QuizAttemptStatus,
  QuizDetail,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { QuizzesApiService } from './quizzes-api.service';

@Component({
  selector: 'app-quiz-history',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './quiz-history.component.html',
  styleUrl: './quiz-history.component.scss',
})
export class QuizHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly quizzesApi = inject(QuizzesApiService);

  protected readonly quizId = signal<number | null>(null);
  protected readonly quiz = signal<QuizDetail | null>(null);
  protected readonly attempts = signal<AttemptSummary[]>([]);
  protected readonly meta = signal<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected statusFilter: QuizAttemptStatus | '' = '';

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? Number(rawId) : null;
    if (id && id > 0) {
      this.quizId.set(id);
      this.quizzesApi.getOne(id).subscribe({
        next: (q) => this.quiz.set(q),
        error: () => undefined,
      });
    }
    this.loadAttempts(1);
  }

  loadAttempts(page = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const specificQuizId = this.quizId();
    this.quizzesApi
      .listAllAttempts({
        quizId: specificQuizId,
        status: this.statusFilter,
        page,
        limit: 20,
      })
      .subscribe({
        next: (res) => {
          this.attempts.set(res.items);
          this.meta.set(res.meta);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          this.errorMessage.set(extractApiError(err, 'Failed to load quiz attempt history'));
          this.isLoading.set(false);
        },
      });
  }
}
