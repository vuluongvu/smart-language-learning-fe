import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqModalComponent,
  OqStatCardComponent,
} from '../../shared/components';
import { I18nService, TranslatePipe } from '../../shared/i18n';
import { SpeechService } from '../../shared/services/speech.service';
import {
  BulkCreateVocabularyResult,
  DuplicateCheckResult,
  FlashcardDueSummary,
  PaginationMeta,
  TopicSummary,
  VocabularyItem,
  VocabularyReviewStatusFilter,
  VocabularySortKey,
} from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { formatProgressStatusLabel } from '../flashcards/flashcard-labels';
import { FlashcardsApiService } from '../flashcards/flashcards-api.service';
import { TopicsApiService } from '../topics/topics-api.service';
import { AiVocabModalComponent } from './ai-vocab-modal/ai-vocab-modal.component';
import { VocabularyApiService } from './vocabulary-api.service';

export type VocabPosTone = 'lavender' | 'accent' | 'cream' | 'green' | 'sky' | 'plum';
export type VocabStatusKey = 'new' | 'due' | 'learning' | 'mastered';

const POS_TONE_MAP: Record<string, VocabPosTone> = {
  noun: 'lavender',
  'danh từ': 'lavender',
  verb: 'accent',
  'động từ': 'accent',
  'phrasal verb': 'accent',
  adjective: 'cream',
  'tính từ': 'cream',
  adverb: 'green',
  'trạng từ': 'green',
  phrase: 'sky',
  idiom: 'sky',
  'cụm từ': 'sky',
  'thành ngữ': 'sky',
  preposition: 'plum',
  'giới từ': 'plum',
};

@Component({
  selector: 'app-vocabulary-list',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    OqModalComponent,
    OqEmptyStateComponent,
    OqIconComponent,
    OqStatCardComponent,
    AiVocabModalComponent,
    TranslatePipe,
  ],
  templateUrl: './vocabulary-list.component.html',
  styleUrl: './vocabulary-list.component.scss',
})
export class VocabularyListComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly flashcardsApi = inject(FlashcardsApiService);
  protected readonly speech = inject(SpeechService);
  protected readonly i18n = inject(I18nService);

  protected readonly items = signal<VocabularyItem[]>([]);
  protected readonly topics = signal<TopicSummary[]>([]);
  protected readonly summary = signal<FlashcardDueSummary | null>(null);
  protected readonly meta = signal<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly totalWordsCount = computed(
    () => this.summary()?.totalCount ?? this.meta().total,
  );
  protected readonly dueWordsCount = computed(() => this.summary()?.dueCount ?? 0);
  protected readonly newWordsCount = computed(() => this.summary()?.newCount ?? 0);
  protected readonly learningWordsCount = computed(() => this.summary()?.learningCount ?? 0);
  protected readonly masteredWordsCount = computed(() => this.summary()?.masteredCount ?? 0);
  protected readonly newAndLearningCount = computed(
    () => this.newWordsCount() + this.learningWordsCount(),
  );
  protected readonly masteryPercent = computed(() => {
    const total = this.totalWordsCount();
    return total > 0 ? Math.round((this.masteredWordsCount() / total) * 100) : 0;
  });

  protected search = '';
  protected selectedTopicId: number | null = null;
  protected partOfSpeechFilter = '';
  protected reviewStatusFilter: VocabularyReviewStatusFilter = 'all';
  protected sortBy: VocabularySortKey = 'newest';

  protected readonly showForm = signal(false);
  protected readonly showAiModal = signal(false);
  protected readonly showMoreFilters = signal(false);
  protected readonly editingItem = signal<VocabularyItem | null>(null);
  protected readonly selectedTopicIds = signal<number[]>([]);
  protected readonly duplicateCheck = signal<DuplicateCheckResult | null>(null);
  protected readonly isEnriching = signal(false);
  protected readonly usedAiEnrich = signal(false);
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
    newTopicName: ['', [Validators.maxLength(120)]],
  });

  ngOnInit(): void {
    const qpTopicId = Number(this.route.snapshot.queryParamMap.get('topicId'));
    if (qpTopicId > 0) {
      this.selectedTopicId = qpTopicId;
    }
    this.loadTopics();
    this.loadSummary();
    this.loadVocabulary(1);
  }

  ngOnDestroy(): void {
    this.speech.stopSpeaking();
  }

  loadTopics(): void {
    this.topicsApi.list({ limit: 100 }).subscribe({
      next: (res) => this.topics.set(res.items),
      error: () => undefined,
    });
  }

  loadSummary(): void {
    this.flashcardsApi.getDueQueue({ topicId: this.selectedTopicId, limit: 1 }).subscribe({
      next: (res) => this.summary.set(res.summary),
      error: () => undefined,
    });
  }

  onTopicChange(): void {
    this.loadSummary();
    this.loadVocabulary(1);
  }

  setStatusFilter(status: VocabularyReviewStatusFilter): void {
    if (this.reviewStatusFilter === status) {
      return;
    }
    this.reviewStatusFilter = status;
    this.loadVocabulary(1);
  }

  filterByTopic(topicId: number): void {
    this.selectedTopicId = this.selectedTopicId === topicId ? null : topicId;
    this.onTopicChange();
  }

  hasActiveFilters(): boolean {
    return Boolean(
      this.search.trim() ||
      this.selectedTopicId !== null ||
      this.partOfSpeechFilter ||
      this.reviewStatusFilter !== 'all' ||
      this.sortBy !== 'newest',
    );
  }

  resetFilters(): void {
    const topicChanged = this.selectedTopicId !== null;
    this.search = '';
    this.selectedTopicId = null;
    this.partOfSpeechFilter = '';
    this.reviewStatusFilter = 'all';
    this.sortBy = 'newest';
    if (topicChanged) {
      this.loadSummary();
    }
    this.loadVocabulary(1);
  }

  speakTerm(item: VocabularyItem): void {
    this.speech.speak(item.term, `vocab-${item.id}`);
  }

  statusKey(item: VocabularyItem): VocabStatusKey {
    if (item.progress?.isDue) {
      return 'due';
    }
    return item.progress?.status ?? 'new';
  }

  posBadgeTone(pos: string | null | undefined): VocabPosTone {
    const normalized = pos?.trim().toLowerCase() ?? '';
    return POS_TONE_MAP[normalized] ?? 'plum';
  }

  topicToneIndex(topicId: number): number {
    return Math.abs(topicId) % 4;
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
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể tải danh sách từ vựng'
                : 'Failed to load vocabulary',
            ),
          );
          this.isLoading.set(false);
        },
      });
  }

  openCreate(): void {
    this.editingItem.set(null);
    this.duplicateCheck.set(null);
    this.usedAiEnrich.set(false);
    this.formError.set(null);
    this.form.reset({
      term: '',
      pronunciation: '',
      partOfSpeech: '',
      definition: '',
      example: '',
      notes: '',
      newTopicName: '',
    });
    this.selectedTopicIds.set(this.selectedTopicId ? [this.selectedTopicId] : []);
    this.showForm.set(true);
  }

  openAiModal(): void {
    this.showAiModal.set(true);
  }

  onAiSaved(result: BulkCreateVocabularyResult): void {
    this.showAiModal.set(false);
    this.successMessage.set(this.i18n.t('vocabAi.savedMsg', { count: result.createdCount }));
    this.loadTopics();
    this.loadSummary();
    this.loadVocabulary(1);
  }

  openEdit(item: VocabularyItem): void {
    this.editingItem.set(item);
    this.duplicateCheck.set(null);
    this.usedAiEnrich.set(false);
    this.formError.set(null);
    this.form.reset({
      term: item.term,
      pronunciation: item.pronunciation ?? '',
      partOfSpeech: item.partOfSpeech ?? '',
      definition: item.definition,
      example: item.example ?? '',
      notes: item.notes ?? '',
      newTopicName: '',
    });
    this.selectedTopicIds.set(item.topics.map((t) => t.id));
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.duplicateCheck.set(null);
    this.usedAiEnrich.set(false);
    this.isEnriching.set(false);
    this.formError.set(null);
  }

  enrichWithAi(): void {
    const term = this.form.controls.term.value.trim();
    if (!term || this.isEnriching()) {
      this.form.controls.term.markAsTouched();
      return;
    }

    this.isEnriching.set(true);
    this.formError.set(null);

    this.vocabularyApi.enrichWithAi(term).subscribe({
      next: (res) => {
        this.isEnriching.set(false);
        this.usedAiEnrich.set(true);
        this.form.patchValue({
          term: res.item.term,
          pronunciation: res.item.pronunciation ?? '',
          partOfSpeech: res.item.partOfSpeech ?? '',
          definition: res.item.definition,
          example: res.item.example ?? '',
          notes: res.item.notes ?? '',
        });
        if (!this.editingItem() && res.item.alreadyExists) {
          this.duplicateCheck.set({
            exists: true,
            matches: Array.from({ length: Math.max(1, res.item.existingMatchCount) }, () => ({
              id: 0,
              term: res.item.term,
              definition: res.item.definition,
            })),
          });
        }
      },
      error: (err: unknown) => {
        this.isEnriching.set(false);
        this.formError.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tự điền từ vựng bằng AI.'
              : 'Unable to auto-fill vocabulary with AI.',
          ),
        );
      },
    });
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
      this.formError.set(
        this.i18n.lang() === 'vi'
          ? 'Từ vựng và định nghĩa không được để trống.'
          : 'Term and definition cannot be empty.',
      );
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
          this.successMessage.set(
            this.i18n.lang() === 'vi' ? 'Đã cập nhật từ vựng.' : 'Vocabulary item updated.',
          );
          this.loadVocabulary(this.meta().page);
        },
        error: (err: unknown) => {
          this.isSaving.set(false);
          this.formError.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể cập nhật từ vựng'
                : 'Failed to update vocabulary item',
            ),
          );
        },
      });
    } else {
      const trimmedNewTopic = raw.newTopicName.trim();
      this.vocabularyApi
        .create({
          ...payload,
          ...(trimmedNewTopic ? { newTopicName: trimmedNewTopic } : {}),
          ...(this.usedAiEnrich() ? { source: 'ai' as const } : {}),
        })
        .subscribe({
          next: (created) => {
            this.isSaving.set(false);
            this.showForm.set(false);
            this.duplicateCheck.set(null);
            this.successMessage.set(
              created.duplicateWarning
                ? this.i18n.lang() === 'vi'
                  ? `Đã thêm "${created.term}" (lưu ý: đã có ${created.existingMatchCount} mục trùng từ này).`
                  : `Added "${created.term}" (note: ${created.existingMatchCount} existing item(s) share this term).`
                : this.i18n.lang() === 'vi'
                  ? `Đã thêm "${created.term}" vào Kho từ vựng.`
                  : `Added "${created.term}" to your Vocabulary Bank.`,
            );
            if (trimmedNewTopic) {
              this.loadTopics();
            }
            this.loadSummary();
            this.loadVocabulary(1);
          },
          error: (err: unknown) => {
            this.isSaving.set(false);
            this.formError.set(
              extractApiError(
                err,
                this.i18n.lang() === 'vi'
                  ? 'Không thể tạo từ vựng'
                  : 'Failed to create vocabulary item',
              ),
            );
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
        this.successMessage.set(
          this.i18n.lang() === 'vi' ? `Đã xóa "${target.term}".` : `Deleted "${target.term}".`,
        );
        this.loadSummary();
        this.loadVocabulary(this.meta().page);
      },
      error: (err: unknown) => {
        this.isDeleting.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể xóa từ vựng'
              : 'Failed to delete vocabulary item',
          ),
        );
      },
    });
  }
}
