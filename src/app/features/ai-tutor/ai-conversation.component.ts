import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { catchError, of } from 'rxjs';
import { OqEmptyStateComponent, OqIconComponent } from '../../shared/components';
import { I18nService, TranslatePipe, TxKey } from '../../shared/i18n';
import { OqMarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { SpeechService } from '../../shared/services/speech.service';
import { LearningLanguageCode } from '../../shared/types/learning-language.types';
import {
  AiConversationSessionDetail,
  AiConversationSessionSummary,
  AppropriatenessRating,
  ConversationInputMode,
  ConversationLevel,
  ConversationSuggestedWord,
  ErrorCategory,
  ExplanationLanguage,
} from '../../shared/types/ai.types';
import { TopicSummary } from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { TopicsApiService } from '../topics/topics-api.service';
import { VocabularyApiService } from '../vocabulary/vocabulary-api.service';
import { AiApiService } from './ai-api.service';

export const MAX_CONV_REPLY_LENGTH = 2000;

@Component({
  selector: 'app-ai-conversation',
  imports: [DatePipe, OqIconComponent, OqEmptyStateComponent, TranslatePipe, OqMarkdownPipe],
  templateUrl: './ai-conversation.component.html',
  styleUrl: './ai-conversation.component.scss',
})
export class AiConversationComponent implements OnInit {
  private readonly aiApi = inject(AiApiService);
  private readonly topicsApi = inject(TopicsApiService);
  private readonly vocabApi = inject(VocabularyApiService);
  protected readonly speech = inject(SpeechService);
  protected readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private lastLoadedLang: LearningLanguageCode | null = null;

  readonly aiEnabled = input<boolean>(false);
  readonly initialSession = input<AiConversationSessionDetail | null>(null);
  readonly embedded = input<boolean>(false);
  readonly sessionUpdated = output<AiConversationSessionDetail>();

  private readonly threadEnd = viewChild<ElementRef<HTMLElement>>('threadEnd');
  private copyTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly maxReplyLength = MAX_CONV_REPLY_LENGTH;
  protected readonly levels: ConversationLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  protected readonly activeCourseLang = computed<LearningLanguageCode>(
    () => this.activeSession()?.languageCode ?? this.learningLang.activeLang(),
  );
  protected readonly presetTopicKeys = computed<TxKey[]>(() =>
    this.activeCourseLang() === 'ko'
      ? [
          'conv.koPreset1',
          'conv.koPreset2',
          'conv.koPreset3',
          'conv.koPreset4',
          'conv.koPreset5',
          'conv.koPreset6',
        ]
      : [
          'conv.preset1',
          'conv.preset2',
          'conv.preset3',
          'conv.preset4',
          'conv.preset5',
          'conv.preset6',
        ],
  );

  protected readonly sessions = signal<AiConversationSessionSummary[]>([]);
  protected readonly loadingSessions = signal(true);
  protected readonly userTopics = signal<TopicSummary[]>([]);

  protected readonly topicInput = signal('');
  protected readonly selectedLevel = signal<ConversationLevel>('B1');
  protected readonly selectedExplainLang = signal<ExplanationLanguage>(this.i18n.lang());

  protected readonly autoSpeakAi = signal(true);
  protected readonly autoSendVoice = signal(true);
  protected readonly transcribing = signal(false);

  protected readonly activeSession = signal<AiConversationSessionDetail | null>(null);
  protected readonly starting = signal(false);
  protected readonly loadingDetail = signal(false);
  protected readonly replyDraft = signal('');
  protected readonly replying = signal(false);
  protected readonly ending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly savedTerms = signal<Set<string>>(new Set());
  protected readonly savingTerm = signal<string | null>(null);
  protected readonly copiedVersionId = signal<number | null>(null);

  protected readonly canStart = computed(
    () => this.aiEnabled() && !this.starting() && this.topicInput().trim().length >= 2,
  );

  protected readonly isBusyTurn = computed(
    () => this.replying() || this.ending() || this.transcribing(),
  );

  protected readonly canReply = computed(
    () =>
      this.aiEnabled() &&
      !this.isBusyTurn() &&
      !this.speech.isRecording() &&
      this.activeSession()?.status === 'active' &&
      this.replyDraft().trim().length > 0 &&
      this.replyDraft().length <= MAX_CONV_REPLY_LENGTH,
  );

  constructor() {
    effect(() => {
      const provided = this.initialSession();
      if (!provided) {
        return;
      }
      const current = this.activeSession();
      if (!current || current.id !== provided.id) {
        this.activeSession.set(provided);
        this.replyDraft.set('');
        this.errorMessage.set(null);
        this.autoSpeakPendingPrompt(provided);
      }
    });

    effect(() => {
      const lang = this.learningLang.activeLang();
      if (!this.embedded() && this.lastLoadedLang && this.lastLoadedLang !== lang) {
        this.activeSession.set(null);
        this.topicInput.set('');
        this.loadHistoryAndTopics();
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.copyTimer) {
        clearTimeout(this.copyTimer);
      }
      this.speech.stopSpeaking();
      this.speech.cancelRecording();
    });
  }

  ngOnInit(): void {
    if (!this.embedded()) {
      this.loadHistoryAndTopics();
    } else {
      this.loadingSessions.set(false);
    }
  }

  loadHistoryAndTopics(): void {
    this.loadingSessions.set(true);
    const activeLang = this.learningLang.activeLang();
    this.lastLoadedLang = activeLang;

    this.aiApi.listConversations(activeLang).subscribe({
      next: (list) => {
        this.sessions.set(list);
        this.loadingSessions.set(false);
      },
      error: () => {
        this.loadingSessions.set(false);
      },
    });

    this.topicsApi
      .list({ limit: 12, languageCode: activeLang })
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res?.items) {
          this.userTopics.set(res.items);
        }
      });
  }

  selectPreset(topicKey: TxKey): void {
    this.topicInput.set(this.i18n.t(topicKey));
  }

  selectSavedTopic(name: string): void {
    this.topicInput.set(name);
  }

  onTopicChange(event: Event): void {
    this.topicInput.set((event.target as HTMLInputElement).value);
  }

  onReplyInput(event: Event): void {
    this.replyDraft.set((event.target as HTMLTextAreaElement).value);
  }

  onReplyKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.submitReply('text');
    }
  }

  startConversation(): void {
    if (!this.canStart()) {
      return;
    }

    this.starting.set(true);
    this.errorMessage.set(null);

    this.aiApi
      .startConversation({
        topic: this.topicInput().trim(),
        level: this.selectedLevel(),
        explanationLang: this.selectedExplainLang(),
        languageCode: this.activeCourseLang(),
      })
      .subscribe({
        next: (detail) => {
          this.activeSession.set(detail);
          this.replyDraft.set('');
          this.starting.set(false);
          this.upsertSessionSummary(detail);
          this.autoSpeakPendingPrompt(detail);
        },
        error: (err: unknown) => {
          this.starting.set(false);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể khởi tạo cuộc hội thoại mới.'
                : 'Unable to start conversation session.',
            ),
          );
        },
      });
  }

  openSession(sessionId: number): void {
    this.loadingDetail.set(true);
    this.errorMessage.set(null);
    this.speech.stopSpeaking();
    this.aiApi.getConversation(sessionId).subscribe({
      next: (detail) => {
        this.activeSession.set(detail);
        this.replyDraft.set('');
        this.loadingDetail.set(false);
      },
      error: (err: unknown) => {
        this.loadingDetail.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tải phiên hội thoại.'
              : 'Unable to load conversation session.',
          ),
        );
      },
    });
  }

  backToSetup(): void {
    this.speech.stopSpeaking();
    this.speech.cancelRecording();
    this.activeSession.set(null);
    this.replyDraft.set('');
    this.errorMessage.set(null);
  }

  submitReply(inputMode: ConversationInputMode = 'text'): void {
    const current = this.activeSession();
    if (!current || !this.canReply()) {
      return;
    }

    const answer = this.replyDraft().trim();
    this.replying.set(true);
    this.errorMessage.set(null);

    this.aiApi.replyConversation(current.id, answer, inputMode).subscribe({
      next: (updated) => {
        this.activeSession.set(updated);
        this.replyDraft.set('');
        this.replying.set(false);
        this.upsertSessionSummary(updated);
        this.sessionUpdated.emit(updated);
        this.scrollToLatest();
        this.autoSpeakPendingPrompt(updated);
      },
      error: (err: unknown) => {
        this.replying.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể phân tích câu trả lời lúc này.'
              : 'Unable to analyze your reply right now.',
          ),
        );
      },
    });
  }

  async toggleRecording(): Promise<void> {
    if (!this.aiEnabled() || this.isBusyTurn()) {
      return;
    }

    if (this.speech.isRecording()) {
      await this.finishRecordingAndTranscribe();
      return;
    }

    this.errorMessage.set(null);
    try {
      await this.speech.startRecording();
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : '';
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'MIC_UNSUPPORTED') {
        this.errorMessage.set(this.i18n.t('conv.micUnsupported'));
      } else if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        this.errorMessage.set(this.i18n.t('conv.micPermissionDenied'));
      } else {
        this.errorMessage.set(extractApiError(err, this.i18n.t('conv.micUnsupported')));
      }
    }
  }

  cancelMic(): void {
    this.speech.cancelRecording();
  }

  toggleSpeak(text: string, id: string): void {
    this.speech.speak(text, id, this.speechRateForLevel(), this.activeCourseLang());
  }

  endSession(): void {
    const current = this.activeSession();
    if (!current || current.status !== 'active' || this.isBusyTurn()) {
      return;
    }

    this.speech.stopSpeaking();
    this.speech.cancelRecording();
    this.ending.set(true);
    this.errorMessage.set(null);

    this.aiApi.endConversation(current.id).subscribe({
      next: (completed) => {
        this.activeSession.set(completed);
        this.ending.set(false);
        this.upsertSessionSummary(completed);
        this.sessionUpdated.emit(completed);
      },
      error: (err: unknown) => {
        this.ending.set(false);
        this.errorMessage.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể tạo tổng kết phiên.'
              : 'Unable to summarize session right now.',
          ),
        );
      },
    });
  }

  isWordSaved(term: string): boolean {
    return this.savedTerms().has(term.trim().toLowerCase());
  }

  saveSuggestedWord(word: ConversationSuggestedWord): void {
    const key = word.term.trim().toLowerCase();
    if (!key || this.isWordSaved(word.term) || this.savingTerm() === key) {
      return;
    }

    this.savingTerm.set(key);
    this.vocabApi
      .create({
        term: word.term.trim(),
        definition: word.definition.trim(),
        partOfSpeech: word.partOfSpeech ?? null,
        example: word.example ?? null,
        languageCode: this.activeCourseLang(),
      })
      .subscribe({
        next: () => {
          this.savedTerms.update((set) => new Set([...set, key]));
          this.savingTerm.set(null);
        },
        error: (err: unknown) => {
          this.savingTerm.set(null);
          this.errorMessage.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể lưu từ vào Kho từ vựng.'
                : 'Unable to save vocabulary item.',
            ),
          );
        },
      });
  }

  async copyImproved(turnId: number, text: string): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      this.copiedVersionId.set(turnId);
      if (this.copyTimer) {
        clearTimeout(this.copyTimer);
      }
      this.copyTimer = setTimeout(() => this.copiedVersionId.set(null), 1800);
    } catch {
      // Clipboard write might be blocked in restricted environments.
    }
  }

  fitBadgeKey(rating: AppropriatenessRating): TxKey {
    if (rating === 'great') return 'conv.fitGreat';
    if (rating === 'needs_work') return 'conv.fitNeedsWork';
    return 'conv.fitGood';
  }

  categoryKey(category: ErrorCategory): TxKey {
    switch (category) {
      case 'grammar':
        return 'conv.catGrammar';
      case 'vocabulary':
        return 'conv.catVocabulary';
      case 'tone':
        return 'conv.catTone';
      default:
        return 'conv.catPhrasing';
    }
  }

  private async finishRecordingAndTranscribe(): Promise<void> {
    const emptyErrKey: TxKey =
      this.activeCourseLang() === 'ko' ? 'conv.koMicEmptyError' : 'conv.micEmptyError';
    const blob = await this.speech.stopRecording();
    if (!blob || blob.size === 0) {
      this.errorMessage.set(this.i18n.t(emptyErrKey));
      return;
    }

    const session = this.activeSession();
    const pendingTurn = session?.turns.find((t) => t.userAnswer === null);

    this.transcribing.set(true);
    this.errorMessage.set(null);

    this.aiApi
      .transcribeAudio(blob, {
        language: session?.languageCode ?? this.activeCourseLang(),
        prompt: pendingTurn?.aiPrompt,
      })
      .subscribe({
        next: ({ text }) => {
          this.transcribing.set(false);
          const clean = text.trim();
          if (!clean) {
            this.errorMessage.set(this.i18n.t(emptyErrKey));
            return;
          }
          const prefix = this.replyDraft().trim();
          this.replyDraft.set(prefix && !this.autoSendVoice() ? `${prefix} ${clean}` : clean);
          if (this.autoSendVoice()) {
            this.submitReply('voice');
          }
        },
        error: (err: unknown) => {
          this.transcribing.set(false);
          this.errorMessage.set(extractApiError(err, this.i18n.t(emptyErrKey)));
        },
      });
  }

  private autoSpeakPendingPrompt(detail: AiConversationSessionDetail): void {
    if (!this.autoSpeakAi() || detail.status !== 'active') {
      return;
    }
    const pendingTurn = [...detail.turns].reverse().find((t) => t.userAnswer === null);
    if (pendingTurn?.aiPrompt) {
      this.speech.speak(
        pendingTurn.aiPrompt,
        `turn-${pendingTurn.id}`,
        this.speechRateForLevel(),
        detail.languageCode ?? this.activeCourseLang(),
      );
    }
  }

  private speechRateForLevel(): number {
    const lvl = this.activeSession()?.level ?? 'B1';
    if (lvl === 'A1' || lvl === 'A2') return 0.88;
    if (lvl === 'C1' || lvl === 'C2') return 1.0;
    return 0.95;
  }

  private upsertSessionSummary(detail: AiConversationSessionDetail): void {
    const summary: AiConversationSessionSummary = {
      id: detail.id,
      topic: detail.topic,
      level: detail.level,
      explanationLang: detail.explanationLang,
      languageCode: detail.languageCode,
      status: detail.status,
      turnCount: detail.turnCount,
      summary: detail.summary,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      endedAt: detail.endedAt,
    };
    this.sessions.update((list) => [summary, ...list.filter((s) => s.id !== summary.id)]);
  }

  private scrollToLatest(): void {
    queueMicrotask(() => {
      const target = this.threadEnd()?.nativeElement;
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }
}
