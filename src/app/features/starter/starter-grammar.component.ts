import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { AiTutorChatService } from '../ai-tutor/ai-tutor-chat.service';
import { OqIconComponent } from '../../shared/components';
import { I18nService } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { SpeechService } from '../../shared/services/speech.service';
import type { LearningLanguageCode } from '../../shared/types/learning-language.types';
import {
  StarterGrammarCategory,
  StarterGrammarPoint,
  buildStarterGrammarPoints,
  buildStarterGrammarQuiz,
} from './starter-grammar.data';
import { StarterTranslatePipe } from './starter-studio.i18n';

const GRAMMAR_DONE_STORAGE_KEY = 'argon_starter_grammar_done';

function loadMasteredGrammarIds(): string[] {
  try {
    const raw = localStorage.getItem(GRAMMAR_DONE_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function saveMasteredGrammarIds(ids: string[]): void {
  try {
    localStorage.setItem(GRAMMAR_DONE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore private-mode storage errors cleanly.
  }
}

@Component({
  selector: 'app-starter-grammar',
  imports: [OqIconComponent, StarterTranslatePipe],
  templateUrl: './starter-grammar.component.html',
  styleUrl: './starter-grammar.component.scss',
})
export class StarterGrammarComponent {
  readonly audioRate = input<number>(0.78);

  protected readonly speech = inject(SpeechService);
  protected readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);
  private readonly aiChat = inject(AiTutorChatService, { optional: true });

  protected readonly grammarCategory = signal<'all' | StarterGrammarCategory>('all');
  protected readonly allGrammarPoints = computed(() =>
    buildStarterGrammarPoints(this.learningLang.activeLang()),
  );
  protected readonly filteredGrammarPoints = computed(() => {
    const cat = this.grammarCategory();
    const list = this.allGrammarPoints();
    return cat === 'all' ? list : list.filter((g) => g.category === cat);
  });
  protected readonly masteredGrammarIds = signal<string[]>(loadMasteredGrammarIds());
  protected readonly grammarDoneCount = computed(
    () => this.allGrammarPoints().filter((g) => this.masteredGrammarIds().includes(g.id)).length,
  );

  protected readonly grammarQuizPool = computed(() =>
    buildStarterGrammarQuiz(this.learningLang.activeLang()),
  );
  protected readonly grammarQuizIndex = signal(0);
  protected readonly grammarQuizSelected = signal<string | null>(null);
  protected readonly grammarQuizCorrectCount = signal(0);
  protected readonly currentGrammarQuestion = computed(() => {
    const pool = this.grammarQuizPool();
    return pool[this.grammarQuizIndex() % pool.length];
  });
  protected readonly grammarQuizIsCorrect = computed(() => {
    const picked = this.grammarQuizSelected();
    return picked !== null && picked === this.currentGrammarQuestion().correctOption;
  });

  private lastLang: LearningLanguageCode | null = null;

  constructor() {
    effect(() => {
      const lang = this.learningLang.activeLang();
      if (this.lastLang !== null && this.lastLang !== lang) {
        this.grammarQuizIndex.set(0);
        this.grammarQuizSelected.set(null);
        this.grammarQuizCorrectCount.set(0);
      }
      this.lastLang = lang;
    });
  }

  speakText(text: string, id: string): void {
    this.speech.speak(text, id, this.audioRate(), this.learningLang.activeLang());
  }

  isGrammarDone(id: string): boolean {
    return this.masteredGrammarIds().includes(id);
  }

  toggleGrammarDone(id: string): void {
    const current = this.masteredGrammarIds();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    this.masteredGrammarIds.set(next);
    saveMasteredGrammarIds(next);
  }

  askGrammarTutor(point: StarterGrammarPoint): void {
    const prompt = this.i18n.lang() === 'vi' ? point.aiPromptVi : point.aiPromptEn;
    this.aiChat?.askInFloating(prompt);
  }

  pickGrammarAnswer(option: string): void {
    const alreadyCorrect = this.grammarQuizIsCorrect();
    this.grammarQuizSelected.set(option);
    if (!alreadyCorrect && option === this.currentGrammarQuestion().correctOption) {
      this.grammarQuizCorrectCount.update((n) => n + 1);
    }
  }

  nextGrammarQuestion(): void {
    const pool = this.grammarQuizPool();
    if (this.grammarQuizIndex() + 1 >= pool.length) {
      this.grammarQuizIndex.set(0);
      this.grammarQuizCorrectCount.set(0);
    } else {
      this.grammarQuizIndex.update((n) => n + 1);
    }
    this.grammarQuizSelected.set(null);
  }
}
