import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { I18nService, TxKey } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { LearningLanguageCode } from '../../shared/types/learning-language.types';
import { AiHistoryMessage, AiStatus, AiTokenUsage } from '../../shared/types/ai.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { renderMarkdownToHtml } from '../../shared/utils/markdown.util';
import { AiApiService } from './ai-api.service';

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  renderedHtml?: string;
  model?: string;
  usage?: AiTokenUsage;
  createdAt: Date;
}

export interface StarterPrompt {
  id: string;
  titleKey: TxKey;
  promptKey: TxKey;
}

const MAX_HISTORY_TURNS = 10;
const MAX_HISTORY_TURN_CHARS = 800;
export const MAX_AI_MESSAGE_LENGTH = 4000;

@Injectable({ providedIn: 'root' })
export class AiTutorChatService {
  private readonly aiApi = inject(AiApiService, { optional: true });
  private readonly i18n = inject(I18nService);
  private readonly learningLang = inject(LearningLanguageService);
  private readonly destroyRef = inject(DestroyRef);

  private copyTimer: ReturnType<typeof setTimeout> | null = null;
  private nextTurnSeq = 1;
  private lastLoadedLang: LearningLanguageCode | null = null;
  private statusRequested = false;
  private pendingFloatingPrompt: string | null = null;

  readonly maxMessageLength = MAX_AI_MESSAGE_LENGTH;
  readonly starterPrompts = computed<StarterPrompt[]>(() =>
    this.learningLang.isKorean()
      ? [
          { id: 'zero', titleKey: 'ai.koStarter0Title', promptKey: 'ai.koStarter0Prompt' },
          { id: 'zero-mix', titleKey: 'ai.koStarter0BTitle', promptKey: 'ai.koStarter0BPrompt' },
          { id: 'particles', titleKey: 'ai.koStarter1Title', promptKey: 'ai.koStarter1Prompt' },
          { id: 'grammar', titleKey: 'ai.koStarter2Title', promptKey: 'ai.koStarter2Prompt' },
          { id: 'honorifics', titleKey: 'ai.koStarter3Title', promptKey: 'ai.koStarter3Prompt' },
          { id: 'roleplay', titleKey: 'ai.koStarter4Title', promptKey: 'ai.koStarter4Prompt' },
        ]
      : [
          { id: 'zero', titleKey: 'ai.starter0Title', promptKey: 'ai.starter0Prompt' },
          { id: 'zero-build', titleKey: 'ai.starter0BTitle', promptKey: 'ai.starter0BPrompt' },
          { id: 'compare', titleKey: 'ai.starter1Title', promptKey: 'ai.starter1Prompt' },
          { id: 'grammar', titleKey: 'ai.starter2Title', promptKey: 'ai.starter2Prompt' },
          { id: 'business', titleKey: 'ai.starter3Title', promptKey: 'ai.starter3Prompt' },
          { id: 'roleplay', titleKey: 'ai.starter4Title', promptKey: 'ai.starter4Prompt' },
        ],
  );

  readonly floatingOpen = signal(false);
  readonly statusLoading = signal(false);
  readonly statusError = signal<string | null>(null);
  readonly aiStatus = signal<AiStatus | null>(null);

  readonly messages = signal<ChatTurn[]>([]);
  readonly draftMessage = signal('');
  readonly sending = signal(false);
  readonly chatError = signal<string | null>(null);
  readonly lastFailedPrompt = signal<string | null>(null);
  readonly copiedMessageId = signal<string | null>(null);

  readonly isAiEnabled = computed(() => this.aiStatus()?.enabled === true);
  readonly canSend = computed(
    () =>
      this.isAiEnabled() &&
      !this.sending() &&
      this.draftMessage().trim().length > 0 &&
      this.draftMessage().length <= MAX_AI_MESSAGE_LENGTH,
  );

  constructor() {
    effect(() => {
      const lang = this.learningLang.activeLang();
      if (this.lastLoadedLang && this.lastLoadedLang !== lang) {
        this.lastLoadedLang = lang;
        this.pendingFloatingPrompt = null;
        this.clearConversation();
      } else if (!this.lastLoadedLang) {
        this.lastLoadedLang = lang;
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.copyTimer) {
        clearTimeout(this.copyTimer);
      }
    });
  }

  toggleFloating(): void {
    const next = !this.floatingOpen();
    this.floatingOpen.set(next);
    if (next) {
      this.ensureStatusLoaded();
    }
  }

  openFloating(): void {
    this.floatingOpen.set(true);
    this.ensureStatusLoaded();
  }

  /** Opens the floating AI tutor drawer and dispatches or pre-fills a starter/grammar prompt. */
  askInFloating(prompt: string): void {
    const clean = prompt.trim();
    if (!clean) {
      return;
    }
    this.floatingOpen.set(true);
    if (this.isAiEnabled() && !this.sending()) {
      this.sendMessage(clean);
      return;
    }
    if (!this.statusRequested || this.statusError()) {
      this.pendingFloatingPrompt = clean;
      this.loadStatus();
      return;
    }
    this.draftMessage.set(clean);
  }

  closeFloating(): void {
    this.floatingOpen.set(false);
  }

  ensureStatusLoaded(): void {
    if (!this.statusRequested || this.statusError()) {
      this.loadStatus();
    }
  }

  loadStatus(): void {
    if (!this.aiApi) {
      this.aiStatus.set({ enabled: false, model: '' });
      this.statusLoading.set(false);
      if (this.pendingFloatingPrompt && !this.draftMessage().trim()) {
        this.draftMessage.set(this.pendingFloatingPrompt);
      }
      this.pendingFloatingPrompt = null;
      return;
    }

    this.statusRequested = true;
    this.statusLoading.set(true);
    this.statusError.set(null);

    this.aiApi.getStatus().subscribe({
      next: (status) => {
        this.aiStatus.set(status);
        this.statusLoading.set(false);
        const queued = this.pendingFloatingPrompt;
        this.pendingFloatingPrompt = null;
        if (queued) {
          if (status.enabled && !this.sending()) {
            this.sendMessage(queued);
          } else {
            this.draftMessage.set(queued);
          }
        }
      },
      error: (err: unknown) => {
        this.statusLoading.set(false);
        const queued = this.pendingFloatingPrompt;
        this.pendingFloatingPrompt = null;
        if (queued && !this.draftMessage().trim()) {
          this.draftMessage.set(queued);
        }
        this.statusError.set(
          extractApiError(
            err,
            this.i18n.lang() === 'vi'
              ? 'Không thể kiểm tra trạng thái gia sư AI.'
              : 'Unable to check AI tutor status.',
          ),
        );
      },
    });
  }

  onDraftInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.draftMessage.set(target.value);
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  useStarterPrompt(promptKey: TxKey): void {
    const prompt = this.i18n.t(promptKey);
    if (this.isAiEnabled() && !this.sending()) {
      this.sendMessage(prompt);
    } else {
      this.draftMessage.set(prompt);
    }
  }

  sendMessage(overridePrompt?: string): void {
    if (!this.aiApi || !this.isAiEnabled() || this.sending()) {
      return;
    }

    const usingDraft = overridePrompt === undefined;
    const rawPrompt = (overridePrompt ?? this.draftMessage()).trim();
    if (!rawPrompt || rawPrompt.length > MAX_AI_MESSAGE_LENGTH) {
      return;
    }

    const priorMessages = this.messages();
    const history: AiHistoryMessage[] = priorMessages.slice(-MAX_HISTORY_TURNS).map((turn) => ({
      role: turn.role,
      content: turn.content.slice(0, MAX_HISTORY_TURN_CHARS),
    }));

    const userTurn: ChatTurn = {
      id: `turn-${this.nextTurnSeq++}`,
      role: 'user',
      content: rawPrompt,
      createdAt: new Date(),
    };

    this.messages.set([...priorMessages, userTurn]);
    if (usingDraft) {
      this.draftMessage.set('');
    }
    this.sending.set(true);
    this.chatError.set(null);
    this.lastFailedPrompt.set(null);

    this.aiApi
      .chat({ message: rawPrompt, history, languageCode: this.learningLang.activeLang() })
      .subscribe({
        next: (reply) => {
          const assistantTurn: ChatTurn = {
            id: `turn-${this.nextTurnSeq++}`,
            role: 'assistant',
            content: reply.content,
            renderedHtml: renderMarkdownToHtml(reply.content),
            model: reply.model,
            usage: reply.usage,
            createdAt: new Date(),
          };
          this.messages.update((current) => [...current, assistantTurn]);
          this.sending.set(false);
        },
        error: (err: unknown) => {
          this.messages.update((current) => current.filter((turn) => turn.id !== userTurn.id));
          if (usingDraft && !this.draftMessage().trim()) {
            this.draftMessage.set(rawPrompt);
          }
          this.sending.set(false);
          this.lastFailedPrompt.set(rawPrompt);
          this.chatError.set(
            extractApiError(
              err,
              this.i18n.lang() === 'vi'
                ? 'Không thể nhận phản hồi từ gia sư AI.'
                : 'Unable to get a response from the AI tutor.',
            ),
          );
        },
      });
  }

  retryLastMessage(): void {
    const prompt = this.lastFailedPrompt();
    if (!prompt) {
      return;
    }
    if (this.draftMessage().trim() === prompt) {
      this.draftMessage.set('');
    }
    this.sendMessage(prompt);
  }

  clearConversation(): void {
    this.messages.set([]);
    this.chatError.set(null);
    this.lastFailedPrompt.set(null);
    this.copiedMessageId.set(null);
  }

  async copyReply(turn: ChatTurn): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(turn.content);
      }
      this.copiedMessageId.set(turn.id);
      if (this.copyTimer) {
        clearTimeout(this.copyTimer);
      }
      this.copyTimer = setTimeout(() => {
        this.copiedMessageId.set(null);
      }, 1800);
    } catch {
      // Clipboard access can be denied in restricted browser contexts.
    }
  }
}
