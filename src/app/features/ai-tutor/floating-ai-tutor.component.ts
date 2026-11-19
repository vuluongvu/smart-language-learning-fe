import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { OqIconComponent } from '../../shared/components';
import { TranslatePipe } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { SpeechService } from '../../shared/services/speech.service';
import { AiTutorChatService } from './ai-tutor-chat.service';

@Component({
  selector: 'app-floating-ai-tutor',
  imports: [RouterLink, OqIconComponent, TranslatePipe],
  templateUrl: './floating-ai-tutor.component.html',
  styleUrl: './floating-ai-tutor.component.scss',
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class FloatingAiTutorComponent {
  protected readonly chat = inject(AiTutorChatService);
  protected readonly learningLang = inject(LearningLanguageService);
  protected readonly speech = inject(SpeechService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly feedEl = viewChild<ElementRef<HTMLElement>>('floatingFeed');
  private readonly currentUrl = signal(this.router.url);

  protected readonly hideOnTutorPage = computed(() => this.currentUrl().startsWith('/ai-tutor'));

  constructor() {
    const sub = this.router.events
      .pipe(filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd))
      .subscribe((ev) => {
        this.currentUrl.set(ev.urlAfterRedirects);
        if (ev.urlAfterRedirects.startsWith('/ai-tutor')) {
          this.chat.closeFloating();
        }
      });

    effect(() => {
      this.chat.messages();
      this.chat.sending();
      if (!this.chat.floatingOpen()) {
        return;
      }
      queueMicrotask(() => {
        const feed = this.feedEl()?.nativeElement;
        if (feed) {
          feed.scrollTop = feed.scrollHeight;
        }
      });
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      this.speech.stopSpeaking();
    });
  }

  protected onEscapeKey(): void {
    if (this.chat.floatingOpen()) {
      this.chat.closeFloating();
    }
  }

  protected openFullTutor(): void {
    this.chat.closeFloating();
  }

  protected speakTurn(id: string, text: string): void {
    this.speech.speak(text, `ft-${id}`, 0.92, this.learningLang.activeLang());
  }
}
