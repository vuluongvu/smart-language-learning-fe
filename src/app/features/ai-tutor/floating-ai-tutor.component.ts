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

const SIZE_KEY = 'ft-panel-size';
const DEFAULT_W = 400;
const DEFAULT_H = 560;
const MIN_W = 320;
const MIN_H = 320;

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
  protected readonly panelWidth = signal(DEFAULT_W);
  protected readonly panelHeight = signal(DEFAULT_H);
  protected readonly chat = inject(AiTutorChatService);
  protected readonly learningLang = inject(LearningLanguageService);
  protected readonly speech = inject(SpeechService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly feedEl = viewChild<ElementRef<HTMLElement>>('floatingFeed');
  private readonly currentUrl = signal(this.router.url);

  protected readonly hideOnTutorPage = computed(() => this.currentUrl().startsWith('/ai-tutor'));

  constructor() {
    this.loadSize();
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

  private clamp(w: number, h: number): [number, number] {
    const maxW = Math.max(MIN_W, window.innerWidth - 48);
    const maxH = Math.max(MIN_H, window.innerHeight - 100);
    return [Math.min(Math.max(w, MIN_W), maxW), Math.min(Math.max(h, MIN_H), maxH)];
  }

  private loadSize(): void {
    try {
      const raw = localStorage.getItem(SIZE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { w: number; h: number };
        const [w, h] = this.clamp(s.w, s.h);
        this.panelWidth.set(w);
        this.panelHeight.set(h);
      }
    } catch {
      /* ignore */
    }
  }

  protected resetSize(): void {
    const [w, h] = this.clamp(DEFAULT_W, DEFAULT_H);
    this.panelWidth.set(w);
    this.panelHeight.set(h);
    localStorage.removeItem(SIZE_KEY);
  }

  protected startResize(ev: PointerEvent, edge: 'l' | 't' | 'tl'): void {
    ev.preventDefault();
    const startX = ev.clientX;
    const startY = ev.clientY;
    const startW = this.panelWidth();
    const startH = this.panelHeight();
    const move = (e: PointerEvent): void => {
      const w = edge === 't' ? startW : startW + (startX - e.clientX);
      const h = edge === 'l' ? startH : startH + (startY - e.clientY);
      const [cw, ch] = this.clamp(w, h);
      this.panelWidth.set(cw);
      this.panelHeight.set(ch);
    };
    const up = (): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.userSelect = '';
      localStorage.setItem(
        SIZE_KEY,
        JSON.stringify({ w: this.panelWidth(), h: this.panelHeight() }),
      );
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
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
