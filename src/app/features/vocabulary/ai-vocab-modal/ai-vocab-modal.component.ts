import {
  Component,
  OnDestroy,
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
  AiVocabularyDraft,
  BulkCreateVocabularyResult,
  CefrLevel,
  TopicSummary,
} from '../../../shared/types/learning.types';
import { extractApiError } from '../../../shared/utils/api-error.util';
import { VocabularyApiService } from '../vocabulary-api.service';

const ACCEPTED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const ACCEPTED_IMAGE_EXT_PATTERN = /\.(png|jpe?g|webp|gif)$/i;
const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const CLIENT_COMPRESS_THRESHOLD_BYTES = 4 * 1024 * 1024;
const MAX_RAW_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_DIMENSION_PX = 1800;

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
export class AiVocabModalComponent implements OnDestroy {
  private readonly vocabularyApi = inject(VocabularyApiService);
  private readonly i18n = inject(I18nService);
  private nextDraftId = 1;
  private wasOpen = false;
  private lastObjectUrl: string | null = null;

  readonly open = input<boolean>(false);
  readonly topics = input<TopicSummary[]>([]);
  readonly defaultTopicId = input<number | null>(null);
  readonly initialMode = input<AiGenerateMode>('topic');

  readonly closed = output<void>();
  readonly saved = output<BulkCreateVocabularyResult>();

  protected readonly presetKeys: TxKey[] = [
    'vocabAi.preset1',
    'vocabAi.preset2',
    'vocabAi.preset3',
  ];
  protected readonly levels: CefrLevel[] = ['A2', 'B1', 'B2', 'C1'];
  protected readonly counts = [3, 5, 8, 10, 12, 15];

  protected mode: AiGenerateMode = 'topic';
  protected prompt = '';
  protected level: CefrLevel | '' = 'B1';
  protected count = 5;
  protected newTopicName = '';
  private newTopicManuallyEdited = false;

  protected readonly selectedImage = signal<File | null>(null);
  protected readonly imagePreviewUrl = signal<string | null>(null);
  protected readonly isDragOver = signal(false);
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
        const startMode = untracked(() => this.initialMode());
        untracked(() => {
          this.mode = startMode;
          this.count = startMode === 'image' ? 8 : 5;
          this.errorMessage.set(null);
          this.newTopicName = '';
          this.newTopicManuallyEdited = false;
          this.selectedTopicIds.set(defaultTopic ? [defaultTopic] : []);
        });
      }
      this.wasOpen = isOpen;
    });
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  setMode(next: AiGenerateMode): void {
    this.mode = next;
    this.errorMessage.set(null);
  }

  applyPreset(key: TxKey): void {
    this.mode = 'topic';
    this.prompt = this.i18n.t(key);
  }

  onImageFilePicked(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    const file = inputEl?.files?.[0] ?? null;
    if (inputEl) {
      inputEl.value = '';
    }
    if (file) {
      void this.handleImageFile(file);
    }
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) {
      void this.handleImageFile(file);
    }
  }

  onModalPaste(event: ClipboardEvent): void {
    if (this.mode !== 'image') {
      return;
    }
    const items = event.clipboardData?.items;
    if (!items) {
      return;
    }
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void this.handleImageFile(file);
          return;
        }
      }
    }
  }

  clearSelectedImage(): void {
    this.revokeObjectUrl();
    this.selectedImage.set(null);
    this.imagePreviewUrl.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    if (this.isGenerating()) {
      return;
    }

    if (this.mode === 'image') {
      this.extractFromSelectedImage();
      return;
    }

    const trimmed = this.prompt.trim();
    if (trimmed.length < 2) {
      this.errorMessage.set(
        this.i18n.lang() === 'vi'
          ? 'Vui lòng nhập chủ đề hoặc đoạn văn (ít nhất 2 ký tự).'
          : 'Please enter a topic or passage (at least 2 characters).',
      );
      return;
    }

    if (this.mode === 'topic') {
      this.applySuggestedTopicName(trimmed);
    }
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
        next: (res) => this.applyGeneratedDrafts(res.model, res.items),
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

  private extractFromSelectedImage(): void {
    const image = this.selectedImage();
    if (!image) {
      this.errorMessage.set(this.i18n.t('vocabAi.imageRequiredError'));
      return;
    }

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    const topicId = this.selectedTopicIds()[0] ?? null;

    this.vocabularyApi
      .extractFromImage({
        image,
        prompt: this.prompt.trim() || undefined,
        level: this.level,
        count: this.count,
        topicId,
      })
      .subscribe({
        next: (res) => {
          this.applyGeneratedDrafts(res.model, res.items);
          if (res.suggestedTopic) {
            this.applySuggestedTopicName(res.suggestedTopic);
          }
        },
        error: (err: unknown) => {
          this.isGenerating.set(false);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể trích xuất từ vựng từ hình ảnh này.'
                : 'Unable to extract vocabulary from this image.',
            ),
          );
        },
      });
  }

  private applyGeneratedDrafts(model: string, items: AiVocabularyDraft[]): void {
    this.generatedModel.set(model);
    this.drafts.set(
      items.map((item) => ({
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
          this.clearSelectedImage();
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

  private async handleImageFile(file: File): Promise<void> {
    const mime = file.type.toLowerCase();
    const isAllowedMime =
      ACCEPTED_IMAGE_MIME_TYPES.has(mime) || (!mime && ACCEPTED_IMAGE_EXT_PATTERN.test(file.name));
    if (!isAllowedMime) {
      this.errorMessage.set(this.i18n.t('vocabAi.imageInvalidTypeError'));
      return;
    }

    if (file.size > MAX_RAW_IMAGE_BYTES) {
      this.errorMessage.set(this.i18n.t('vocabAi.imageTooLargeError'));
      return;
    }

    const readyFile = await this.compressLargeImageIfSupported(file);
    if (readyFile.size > MAX_IMAGE_UPLOAD_BYTES) {
      this.errorMessage.set(this.i18n.t('vocabAi.imageTooLargeError'));
      return;
    }

    this.errorMessage.set(null);
    this.revokeObjectUrl();
    this.selectedImage.set(readyFile);
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const objectUrl = URL.createObjectURL(readyFile);
      this.lastObjectUrl = objectUrl;
      this.imagePreviewUrl.set(objectUrl);
    }
  }

  private async compressLargeImageIfSupported(file: File): Promise<File> {
    if (
      file.size <= CLIENT_COMPRESS_THRESHOLD_BYTES ||
      typeof createImageBitmap !== 'function' ||
      typeof document === 'undefined'
    ) {
      return file;
    }

    let bitmap: ImageBitmap | null = null;
    try {
      bitmap = await createImageBitmap(file);
      const longestSide = Math.max(bitmap.width, bitmap.height);
      const scale = longestSide > MAX_IMAGE_DIMENSION_PX ? MAX_IMAGE_DIMENSION_PX / longestSide : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return file;
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.85, 0.72]) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', quality),
        );
        if (blob && blob.size <= MAX_IMAGE_UPLOAD_BYTES) {
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'upload';
          return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
        }
      }
      return file;
    } catch {
      return file;
    } finally {
      bitmap?.close();
    }
  }

  private revokeObjectUrl(): void {
    if (
      this.lastObjectUrl &&
      typeof URL !== 'undefined' &&
      typeof URL.revokeObjectURL === 'function'
    ) {
      URL.revokeObjectURL(this.lastObjectUrl);
      this.lastObjectUrl = null;
    }
  }

  private applySuggestedTopicName(candidateText: string): void {
    if (this.selectedTopicIds().length > 0) {
      return;
    }

    const trimmed = candidateText.trim();
    if (!trimmed) {
      return;
    }

    const normalized = trimmed.toLowerCase();
    const matched = this.topics().find((t) => t.name.trim().toLowerCase() === normalized);
    if (matched) {
      this.selectedTopicIds.set([matched.id]);
      if (!this.newTopicManuallyEdited) {
        this.newTopicName = '';
      }
      return;
    }

    if (!this.newTopicManuallyEdited && !trimmed.includes('\n') && trimmed.length <= 45) {
      this.newTopicName = trimmed;
    }
  }
}
