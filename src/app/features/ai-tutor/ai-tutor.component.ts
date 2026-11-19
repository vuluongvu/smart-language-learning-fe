import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OqIconComponent, OqPageHeaderComponent } from '../../shared/components';
import { I18nService, TranslatePipe, TxKey } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { LearningLanguageCode } from '../../shared/types/learning-language.types';
import { AiHistoryMessage, AiStatus, AiTokenUsage } from '../../shared/types/ai.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { renderMarkdownToHtml } from '../../shared/utils/markdown.util';
import { AiApiService } from './ai-api.service';
import { AiConversationComponent } from './ai-conversation.component';

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  renderedHtml?: string;
  model?: string;
  usage?: AiTokenUsage;
  createdAt: Date;
}

interface StarterPrompt {
  id: string;
  titleKey: TxKey;
  promptKey: TxKey;
}

const MAX_HISTORY_TURNS = 10;
const MAX_HISTORY_TURN_CHARS = 800;
export const MAX_AI_MESSAGE_LENGTH = 4000;

@Component({
  selector: 'app-ai-tutor',
  imports: [OqPageHeaderComponent, OqIconComponent, AiConversationComponent, TranslatePipe],
  templateUrl: './ai-tutor.component.html',
  styleUrl: './ai-tutor.component.scss',
})
export class AiTutorComponent implements OnInit {
  private readonly aiApi = inject(AiApiService);
  protected readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  private readonly messageFeed = viewChild<ElementRef<HTMLElement>>('messageFeed');
  private copyTimer: ReturnType<typeof setTimeout> | null = null;
  private nextTurnSeq = 1;
  private lastLoadedLang: LearningLanguageCode | null = null;

  protected readonly maxMessageLength = MAX_AI_MESSAGE_LENGTH;
  protected readonly starterPrompts = computed<StarterPrompt[]>(() =>
    this.learningLang.isKorean()
      ? [
          { id: 'particles', titleKey: 'ai.koStarter1Title', promptKey: 'ai.koStarter1Prompt' },
          { id: 'grammar', titleKey: 'ai.koStarter2Title', promptKey: 'ai.koStarter2Prompt' },
          { id: 'honorifics', titleKey: 'ai.koStarter3Title', promptKey: 'ai.koStarter3Prompt' },
          { id: 'roleplay', titleKey: 'ai.koStarter4Title', promptKey: 'ai.koStarter4Prompt' },
        ]
      : [
          { id: 'compare', titleKey: 'ai.starter1Title', promptKey: 'ai.starter1Prompt' },
          { id: 'grammar', titleKey: 'ai.starter2Title', promptKey: 'ai.starter2Prompt' },
          { id: 'business', titleKey: 'ai.starter3Title', promptKey: 'ai.starter3Prompt' },
          { id: 'roleplay', titleKey: 'ai.starter4Title', promptKey: 'ai.starter4Prompt' },
        ],
  );

  protected readonly statusLoading = signal(true);
  protected readonly statusError = signal<string | null>(null);
  protected readonly aiStatus = signal<AiStatus | null>(null);
  protected readonly activeMode = signal<'chat' | 'conversation'>('chat');

  protected readonly messages = signal<ChatTurn[]>([]);
  protected readonly draftMessage = signal('');
  protected readonly sending = signal(false);
  protected readonly chatError = signal<string | null>(null);
  protected readonly lastFailedPrompt = signal<string | null>(null);
  protected readonly copiedMessageId = signal<string | null>(null);

  protected readonly isAiEnabled = computed(() => this.aiStatus()?.enabled === true);
  protected readonly canSend = computed(
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

  ngOnInit(): void {
    if (this.route?.snapshot.queryParamMap.get('mode') === 'conversation') {
      this.activeMode.set('conversation');
    }
    this.loadStatus();
  }

  loadStatus(): void {
    this.statusLoading.set(true);
    this.statusError.set(null);

    this.aiApi.getStatus().subscribe({
      next: (status) => {
        this.aiStatus.set(status);
        this.statusLoading.set(false);
      },
      error: (err: unknown) => {
        this.statusLoading.set(false);
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
    if (!this.isAiEnabled() || this.sending()) {
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
    this.scrollFeedToBottom();

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
          this.scrollFeedToBottom();
        },
        error: (err: unknown) => {
          // Roll back the failed optimistic user turn so retry never duplicates history.
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

  private scrollFeedToBottom(): void {
    queueMicrotask(() => {
      const feed = this.messageFeed()?.nativeElement;
      if (feed) {
        feed.scrollTop = feed.scrollHeight;
      }
    });
  }
}
