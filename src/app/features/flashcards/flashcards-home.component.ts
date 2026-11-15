import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
  OqStatCardComponent,
} from '../../shared/components';
import {
  FlashcardCardView,
  FlashcardDueSummary,
  FlashcardSessionMode,
  FlashcardSessionSummary,
  TopicSummary,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { TopicsApiService } from '../topics/topics-api.service';
import {
  formatIntervalDays,
  formatProgressStatusLabel,
  formatStudyModeLabel,
} from './flashcard-labels';
import { FlashcardsApiService } from './flashcards-api.service';

@Component({
  selector: 'app-flashcards-home',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    OqPageHeaderComponent,
    OqStatCardComponent,
    OqEmptyStateComponent,
    OqIconComponent,
  ],
  templateUrl: './flashcards-home.component.html',
  styleUrl: './flashcards-home.component.scss',
})
export class FlashcardsHomeComponent implements OnInit {
  private readonly flashcardsApi = inject(FlashcardsApiService);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly topics = signal<TopicSummary[]>([]);
  readonly summary = signal<FlashcardDueSummary>({
    totalCount: 0,
    dueCount: 0,
    newCount: 0,
    learningCount: 0,
    masteredCount: 0,
    hardCount: 0,
  });
  readonly dueCards = signal<FlashcardCardView[]>([]);
  readonly sessions = signal<FlashcardSessionSummary[]>([]);

  readonly isLoading = signal(false);
  readonly isStarting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  selectedTopicId: number | null = null;
  selectedMode: FlashcardSessionMode = 'due_and_new';
  sessionLimit = 20;

  readonly modeOptions: Array<{ value: FlashcardSessionMode; label: string }> = [
    { value: 'due_and_new', label: 'Due & New Cards' },
    { value: 'due_only', label: 'Due Only' },
    { value: 'new_only', label: 'New Cards Only' },
    { value: 'hard_only', label: 'Hard Cards (Again / Hard)' },
    { value: 'all', label: 'All Topic / Bank Cards' },
  ];

  readonly formatMode = formatStudyModeLabel;
  readonly formatStatus = formatProgressStatusLabel;
  readonly formatInterval = formatIntervalDays;

  ngOnInit(): void {
    const topicParam = this.route.snapshot.queryParamMap.get('topicId');
    if (topicParam && Number(topicParam) > 0) {
      this.selectedTopicId = Number(topicParam);
    }
    this.loadOverview();
  }

  loadOverview(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      topics: this.topicsApi.list({ limit: 50 }),
      due: this.flashcardsApi.getDueQueue({
        topicId: this.selectedTopicId,
        mode: this.selectedMode,
        limit: 12,
      }),
      sessions: this.flashcardsApi.listSessions({
        topicId: this.selectedTopicId,
        limit: 8,
      }),
    }).subscribe({
      next: ({ topics, due, sessions }) => {
        this.topics.set(topics.items);
        this.summary.set(due.summary);
        this.dueCards.set(due.items);
        this.sessions.set(sessions.items);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(extractApiError(err, 'Could not load flashcard review queue.'));
        this.isLoading.set(false);
      },
    });
  }

  refreshQueue(): void {
    this.loadOverview();
  }

  startSession(modeOverride?: FlashcardSessionMode): void {
    this.isStarting.set(true);
    this.errorMessage.set(null);

    const mode = modeOverride ?? this.selectedMode;
    this.flashcardsApi
      .createSession({
        topicId: this.selectedTopicId,
        mode,
        limit: this.sessionLimit,
      })
      .subscribe({
        next: (session) => {
          this.isStarting.set(false);
          void this.router.navigate(['/flashcards/sessions', session.id]);
        },
        error: (err: unknown) => {
          this.errorMessage.set(extractApiError(err, 'Unable to start flashcard session.'));
          this.isStarting.set(false);
        },
      });
  }
}
