import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OqIconComponent, OqModalComponent } from '../../../shared/components';
import { I18nService, TranslatePipe, TxKey } from '../../../shared/i18n';
import {
  AiGenerateMode,
  BulkCreateVocabularyResult,
  CefrLevel,
  TopicSummary,
} from '../../../shared/types/learning.types';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { VocabularyApiService } from '../vocabulary-api.service';

export interface EditableAiVocabDraft {
  id: number;
  selected: boolean;
  term: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  notes: string;
  alreadyExists: boolean;
}

@Component({
  selector: 'app-ai-vocab-modal',
  imports: [FormsModule, OqModalComponent, OqIconComponent, TranslatePipe],
  templateUrl: './ai-vocab-modal.component.html',
  styleUrl: './ai-vocab-modal.component.scss',
})
export class AiVocabModalComponent {
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly i18n = inject(I18nService);
  private nextDraftId = 1;
  private wasOpen = false;

  readonly open = input<boolean>(false);
  readonly topics = input<TopicSummary[]>([]);
  readonly defaultTopicId = input<number | null>(null);

  readonly closed = output<void>();
  readonly saved = output<BulkCreateVocabularyResult>();

  protected readonly presetKeys: TxKey[] = [
    'vocabAi.preset1',
    'vocabAi.preset2',
    'vocabAi.preset3',
  ];
  protected readonly levels: CefrLevel[] = ['A2', 'B1', 'B2', 'C1'];
  protected readonly counts = [3, 5, 8, 10];

  protected mode: AiGenerateMode = 'topic';
  protected prompt = '';
  protected level: CefrLevel | '' = 'B1';
  protected count = 5;
  protected newTopicName = '';
  private newTopicManuallyEdited = false;

  protected readonly selectedTopicIds = signal<number[]>([]);
  protected readonly drafts = signal<EditableAiVocabDraft[]>([]);
  protected readonly generatedModel = signal<string | null>(null);
  protected readonly isGenerating = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly selectedCount = computed(
    () => this.drafts().filter((d) => d.selected && d.term.trim() && d.definition.trim()).length,
  );
  protected readonly allSelected = computed(
    () => this.drafts().length > 0 && this.drafts().every((d) => d.selected),
  );

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.wasOpen) {
        const defaultTopic = untracked(() => this.defaultTopicId());
        untracked(() => {
          this.errorMessage.set(null);
          this.newTopicName = '';
          this.newTopicManuallyEdited = false;
          this.selectedTopicIds.set(defaultTopic ? [defaultTopic] : []);
        });
      }
      this.wasOpen = isOpen;
    });
  }

  setMode(next: AiGenerateMode): void {
    this.mode = next;
    this.errorMessage.set(null);
  }

  applyPreset(key: TxKey): void {
    this.mode = 'topic';
    this.prompt = this.i18n.t(key);
  }

  onNewTopicInput(): void {
    this.newTopicManuallyEdited = true;
  }

  isTopicSelected(topicId: number): boolean {
    return this.selectedTopicIds().includes(topicId);
  }

  toggleTopic(topicId: number): void {
    this.selectedTopicIds.update((ids) =>
      ids.includes(topicId) ? ids.filter((id) => id !== topicId) : [...ids, topicId],
    );
    if (!this.newTopicManuallyEdited && this.selectedTopicIds().length > 0) {
      this.newTopicName = '';
    }
  }

  generate(): void {
    const trimmed = this.prompt.trim();
    if (trimmed.length < 2 || this.isGenerating()) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi'
          ? 'Vui lòng nhập chủ đề hoặc đoạn văn (ít nhất 2 ký tự).'
          : 'Please enter a topic or passage (at least 2 characters).',
      );
      return;
    }

    this.syncTopicFromPrompt(trimmed);
    this.isGenerating.set(true);
    this.errorMessage.set(null);
    const topicId = this.selectedTopicIds()[0] ?? null;

    this.vocabularyApi
      .generateWithAi({
        prompt: trimmed,
        mode: this.mode,
        level: this.level,
        count: this.count,
        topicId,
      })
      .subscribe({
        next: (res) => {
          this.generatedModel.set(res.model);
          this.drafts.set(
            res.items.map((item) => ({
              id: this.nextDraftId++,
              selected: !item.alreadyExists,
              term: item.term,
              pronunciation: item.pronunciation ?? '',
              partOfSpeech: item.partOfSpeech ?? '',
              definition: item.definition,
              example: item.example ?? '',
              notes: item.notes ?? '',
              alreadyExists: item.alreadyExists,
            })),
          );
          this.isGenerating.set(false);
        },
        error: (err: unknown) => {
          this.isGenerating.set(false);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể tạo gợi ý từ vựng bằng AI.'
                : 'Unable to generate vocabulary with AI.',
            ),
          );
        },
      });
  }

  toggleAll(): void {
    const next = !this.allSelected();
    this.drafts.update((list) => list.map((d) => ({ ...d, selected: next })));
  }

  saveSelected(): void {
    const chosen = this.drafts().filter((d) => d.selected && d.term.trim() && d.definition.trim());
    if (chosen.length === 0 || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const trimmedNewTopic = this.newTopicName.trim();

    this.vocabularyApi
      .createBulk({
        topicIds: this.selectedTopicIds(),
        ...(trimmedNewTopic ? { newTopicName: trimmedNewTopic } : {}),
        items: chosen.map((d) => ({
          term: d.term.trim(),
          pronunciation: d.pronunciation.trim() || null,
          partOfSpeech: d.partOfSpeech.trim() || null,
          definition: d.definition.trim(),
          example: d.example.trim() || null,
          notes: d.notes.trim() || null,
          source: 'ai',
        })),
      })
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.drafts.set([]);
          this.generatedModel.set(null);
          this.prompt = '';
          this.newTopicName = '';
          this.newTopicManuallyEdited = false;
          this.saved.emit(res);
        },
        error: (err: unknown) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể lưu các từ đã chọn.'
                : 'Failed to save selected words.',
            ),
          );
        },
      });
  }

  close(): void {
    if (this.isGenerating() || this.isSaving()) {
      return;
    }
    this.errorMessage.set(null);
    this.closed.emit();
  }

  private syncTopicFromPrompt(promptText: string): void {
    if (this.mode !== 'topic' || this.selectedTopicIds().length > 0) {
      return;
    }

    const normalized = promptText.toLowerCase();
    const matched = this.topics().find((t) => t.name.trim().toLowerCase() === normalized);
    if (matched) {
      this.selectedTopicIds.set([matched.id]);
      if (!this.newTopicManuallyEdited) {
        this.newTopicName = '';
      }
      return;
    }

    if (!this.newTopicManuallyEdited && !promptText.includes('\n') && promptText.length <= 45) {
      this.newTopicName = promptText;
    }
  }
}
