import { Component, ElementRef, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OqIconComponent, OqPageHeaderComponent } from '../../shared/components';
import { TranslatePipe, TxKey } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { AiConversationComponent } from './ai-conversation.component';
import { AiTutorChatService, ChatTurn, MAX_AI_MESSAGE_LENGTH } from './ai-tutor-chat.service';

export type { ChatTurn };
export { MAX_AI_MESSAGE_LENGTH };

@Component({
  selector: 'app-ai-tutor',
  imports: [OqPageHeaderComponent, OqIconComponent, AiConversationComponent, TranslatePipe],
  templateUrl: './ai-tutor.component.html',
  styleUrl: './ai-tutor.component.scss',
})
export class AiTutorComponent implements OnInit {
  private readonly chatService = inject(AiTutorChatService);
  protected readonly learningLang = inject(LearningLanguageService);
  private readonly route = inject(ActivatedRoute, { optional: true });

  private readonly messageFeed = viewChild<ElementRef<HTMLElement>>('messageFeed');

  protected readonly maxMessageLength = MAX_AI_MESSAGE_LENGTH;
  protected readonly activeMode = signal<'chat' | 'conversation'>('chat');

  protected readonly starterPrompts = this.chatService.starterPrompts;
  protected readonly statusLoading = this.chatService.statusLoading;
  protected readonly statusError = this.chatService.statusError;
  protected readonly aiStatus = this.chatService.aiStatus;
  protected readonly messages = this.chatService.messages;
  protected readonly draftMessage = this.chatService.draftMessage;
  protected readonly sending = this.chatService.sending;
  protected readonly chatError = this.chatService.chatError;
  protected readonly lastFailedPrompt = this.chatService.lastFailedPrompt;
  protected readonly copiedMessageId = this.chatService.copiedMessageId;
  protected readonly isAiEnabled = this.chatService.isAiEnabled;
  protected readonly canSend = this.chatService.canSend;

  constructor() {
    effect(() => {
      this.messages();
      this.sending();
      queueMicrotask(() => {
        const feed = this.messageFeed()?.nativeElement;
        if (feed) {
          feed.scrollTop = feed.scrollHeight;
        }
      });
    });
  }

  ngOnInit(): void {
    this.chatService.closeFloating();
    if (this.route?.snapshot.queryParamMap.get('mode') === 'conversation') {
      this.activeMode.set('conversation');
    }
    this.loadStatus();
  }

  loadStatus(): void {
    this.chatService.loadStatus();
  }

  onDraftInput(event: Event): void {
    this.chatService.onDraftInput(event);
  }

  onComposerKeydown(event: KeyboardEvent): void {
    this.chatService.onComposerKeydown(event);
  }

  useStarterPrompt(promptKey: TxKey): void {
    this.chatService.useStarterPrompt(promptKey);
  }

  sendMessage(overridePrompt?: string): void {
    this.chatService.sendMessage(overridePrompt);
  }

  retryLastMessage(): void {
    this.chatService.retryLastMessage();
  }

  clearConversation(): void {
    this.chatService.clearConversation();
  }

  async copyReply(turn: ChatTurn): Promise<void> {
    await this.chatService.copyReply(turn);
  }
}
