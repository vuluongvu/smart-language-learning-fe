import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqModalComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import {
  DuplicateCheckResult,
  PaginationMeta,
  TopicSummary,
  VocabularyItem,
  VocabularyReviewStatusFilter,
  VocabularySortKey,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { formatProgressStatusLabel } from '../flashcards/flashcard-labels';
import { TopicsApiService } from '../topics/topics-api.service';
import { VocabularyApiService } from './vocabulary-api.service';

@Component({
  selector: 'app-vocabulary-list',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    OqPageHeaderComponent,
    OqModalComponent,
    OqEmptyStateComponent,
    OqIconComponent,
  ],
  templateUrl: './vocabulary-list.component.html',
  styleUrl: './vocabulary-list.component.scss',
})
export class VocabularyListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly topicsApi = inject(TopicsApiService);

  protected readonly items = signal<VocabularyItem[]>([]);
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
  protected partOfSpeechFilter = '';
  protected reviewStatusFilter: VocabularyReviewStatusFilter = 'all';
  protected sortBy: VocabularySortKey = 'newest';

  protected readonly showForm = signal(false);
  protected readonly editingItem = signal<VocabularyItem | null>(null);
  protected readonly selectedTopicIds = signal<number[]>([]);
  protected readonly duplicateCheck = signal<DuplicateCheckResult | null>(null);
  protected readonly isSaving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly confirmDeleteItem = signal<VocabularyItem | null>(null);
  protected readonly isDeleting = signal(false);

  protected readonly formatProgressStatus = formatProgressStatusLabel;

  protected readonly partOfSpeechOptions = [
    'noun',
    'verb',
    'adjective',
    'adverb',
    'phrase',
    'idiom',
    'preposition',
  ];

  protected readonly form = this.fb.nonNullable.group({
    term: ['', [Validators.required, Validators.maxLength(255)]],
    pronunciation: ['', [Validators.maxLength(255)]],
    partOfSpeech: ['', [Validators.maxLength(64)]],
    definition: ['', [Validators.required, Validators.maxLength(5000)]],
    example: ['', [Validators.maxLength(5000)]],
    notes: ['', [Validators.maxLength(5000)]],
  });

  ngOnInit(): void {
    const qpTopicId = Number(this.route.snapshot.queryParamMap.get('topicId'));
    if (qpTopicId > 0) {
      this.selectedTopicId = qpTopicId;
    }
    this.loadTopics();
    this.loadVocabulary(1);
  }

  loadTopics(): void {
    this.topicsApi.list({ limit: 100 }).subscribe({
      next: (res) => this.topics.set(res.items),
      error: () => undefined,
    });
  }

  loadVocabulary(page = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.vocabularyApi
      .list({
        search: this.search,
        topicId: this.selectedTopicId,
        partOfSpeech: this.partOfSpeechFilter,
        reviewStatus: this.reviewStatusFilter,
        sortBy: this.sortBy,
        page,
        limit: 12,
      })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.meta.set(res.meta);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          this.errorMessage.set(extractApiError(err, 'Failed to load vocabulary'));
          this.isLoading.set(false);
        },
      });
  }

  openCreate(): void {
    this.editingItem.set(null);
    this.duplicateCheck.set(null);
    this.formError.set(null);
    this.form.reset({
      term: '',
      pronunciation: '',
      partOfSpeech: '',
      definition: '',
      example: '',
      notes: '',
    });
    this.selectedTopicIds.set(this.selectedTopicId ? [this.selectedTopicId] : []);
    this.showForm.set(true);
  }

  openEdit(item: VocabularyItem): void {
    this.editingItem.set(item);
    this.duplicateCheck.set(null);
    this.formError.set(null);
    this.form.reset({
      term: item.term,
      pronunciation: item.pronunciation ?? '',
      partOfSpeech: item.partOfSpeech ?? '',
      definition: item.definition,
      example: item.example ?? '',
      notes: item.notes ?? '',
    });
    this.selectedTopicIds.set(item.topics.map((t) => t.id));
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.duplicateCheck.set(null);
    this.formError.set(null);
  }

  isTopicSelected(topicId: number): boolean {
    return this.selectedTopicIds().includes(topicId);
  }

  toggleTopicSelection(topicId: number): void {
    this.selectedTopicIds.update((ids) =>
      ids.includes(topicId) ? ids.filter((id) => id !== topicId) : [...ids, topicId],
    );
  }

  onTermBlur(): void {
    if (this.editingItem()) return;
    const term = this.form.controls.term.value.trim();
    if (!term) {
      this.duplicateCheck.set(null);
      return;
    }

    this.vocabularyApi.checkDuplicate(term).subscribe({
      next: (res) => this.duplicateCheck.set(res.exists ? res : null),
      error: () => undefined,
    });
  }

  saveVocabulary(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const term = raw.term.trim();
    const definition = raw.definition.trim();
    if (!term || !definition) {
      this.formError.set('Term and definition cannot be empty.');
      return;
    }

    this.isSaving.set(true);
    this.formError.set(null);
    this.successMessage.set(null);

    const payload = {
      term,
      pronunciation: raw.pronunciation.trim() || null,
      partOfSpeech: raw.partOfSpeech.trim() || null,
      definition,
      example: raw.example.trim() || null,
      notes: raw.notes.trim() || null,
      topicIds: this.selectedTopicIds(),
    };

    const editing = this.editingItem();
    if (editing) {
      this.vocabularyApi.update(editing.id, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.showForm.set(false);
          this.editingItem.set(null);
          this.successMessage.set('Vocabulary item updated.');
          this.loadVocabulary(this.meta().page);
        },
        error: (err: unknown) => {
          this.isSaving.set(false);
          this.formError.set(extractApiError(err, 'Failed to update vocabulary item'));
        },
      });
    } else {
      this.vocabularyApi.create(payload).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.showForm.set(false);
          this.duplicateCheck.set(null);
          this.successMessage.set(
            created.duplicateWarning
              ? `Added "${created.term}" (note: ${created.existingMatchCount} existing item(s) share this term).`
              : `Added "${created.term}" to your Vocabulary Bank.`,
          );
          this.loadVocabulary(1);
        },
        error: (err: unknown) => {
          this.isSaving.set(false);
          this.formError.set(extractApiError(err, 'Failed to create vocabulary item'));
        },
      });
    }
  }

  deleteSelectedItem(): void {
    const target = this.confirmDeleteItem();
    if (!target) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.vocabularyApi.remove(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.confirmDeleteItem.set(null);
        this.successMessage.set(`Deleted "${target.term}".`);
        this.loadVocabulary(this.meta().page);
      },
      error: (err: unknown) => {
        this.isDeleting.set(false);
        this.errorMessage.set(extractApiError(err, 'Failed to delete vocabulary item'));
      },
    });
  }
}
