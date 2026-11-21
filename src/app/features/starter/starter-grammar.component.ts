import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { AiApiService } from '../ai-tutor/ai-api.service';
import { AiTutorChatService } from '../ai-tutor/ai-tutor-chat.service';
import { AuthService } from '../auth/auth.service';
import { OqIconComponent } from '../../shared/components';
import { I18nService } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { SpeechService } from '../../shared/services/speech.service';
import type {
  StarterGrammarCategory,
  StarterGrammarLevel,
  StarterGrammarPoint,
  StarterGrammarQuestion,
} from '../../shared/types/ai.types';
import type { LearningLanguageCode } from '../../shared/types/learning-language.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import {
  STARTER_GRAMMAR_AI_PRESETS,
  type StarterGrammarAiPreset,
  buildStarterGrammarPoints,
  buildStarterGrammarQuiz,
} from './starter-grammar.data';
import { StarterTranslatePipe } from './starter-studio.i18n';

const GRAMMAR_DONE_STORAGE_KEY = 'argon_starter_grammar_done';
const CUSTOM_GRAMMAR_STORAGE_KEY = 'argon_starter_grammar_custom_v1';

interface CustomGrammarStore {
  en: { points: StarterGrammarPoint[]; exercises: StarterGrammarQuestion[] };
  ko: { points: StarterGrammarPoint[]; exercises: StarterGrammarQuestion[] };
}

type QuizFilterMode = 'all' | 'choice' | 'scramble' | 'ai';

const EMPTY_CUSTOM_STORE: CustomGrammarStore = {
  en: { points: [], exercises: [] },
  ko: { points: [], exercises: [] },
};

function scopedStorageKey(baseKey: string, userId?: number | null): string {
  return typeof userId === 'number' && userId > 0 ? `${baseKey}_u${userId}` : baseKey;
}

function loadMasteredGrammarIds(userId?: number | null): string[] {
  try {
    const raw = localStorage.getItem(scopedStorageKey(GRAMMAR_DONE_STORAGE_KEY, userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function saveMasteredGrammarIds(ids: string[], userId?: number | null): void {
  try {
    localStorage.setItem(scopedStorageKey(GRAMMAR_DONE_STORAGE_KEY, userId), JSON.stringify(ids));
  } catch {
    // Ignore storage quota or private-mode errors cleanly.
  }
}

function loadCustomGrammarStore(userId?: number | null): CustomGrammarStore {
  try {
    const raw = localStorage.getItem(scopedStorageKey(CUSTOM_GRAMMAR_STORAGE_KEY, userId));
    if (!raw) return structuredClone(EMPTY_CUSTOM_STORE);
    const parsed = JSON.parse(raw) as Partial<CustomGrammarStore>;
    return {
      en: {
        points: Array.isArray(parsed?.en?.points) ? parsed.en.points : [],
        exercises: Array.isArray(parsed?.en?.exercises) ? parsed.en.exercises : [],
      },
      ko: {
        points: Array.isArray(parsed?.ko?.points) ? parsed.ko.points : [],
        exercises: Array.isArray(parsed?.ko?.exercises) ? parsed.ko.exercises : [],
      },
    };
  } catch {
    return structuredClone(EMPTY_CUSTOM_STORE);
  }
}

function saveCustomGrammarStore(store: CustomGrammarStore, userId?: number | null): void {
  try {
    localStorage.setItem(
      scopedStorageKey(CUSTOM_GRAMMAR_STORAGE_KEY, userId),
      JSON.stringify(store),
    );
  } catch {
    // Ignore storage quota or private-mode errors cleanly.
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
  private readonly auth = inject(AuthService, { optional: true });
  private readonly aiApi = inject(AiApiService, { optional: true });
  private readonly aiChat = inject(AiTutorChatService, { optional: true });
  private readonly userId = computed(() => this.auth?.user()?.id ?? null);

  // Grammar catalog & mastery tracking
  protected readonly grammarCategory = signal<'all' | StarterGrammarCategory>('all');
  protected readonly selectedGrammarId = signal<string | null>(null);
  protected readonly customStore = signal<CustomGrammarStore>(
    loadCustomGrammarStore(this.auth?.user()?.id ?? null),
  );
  protected readonly masteredGrammarIds = signal<string[]>(
    loadMasteredGrammarIds(this.auth?.user()?.id ?? null),
  );

  protected readonly customGrammarPoints = computed(
    () => this.customStore()[this.learningLang.activeLang()].points,
  );
  protected readonly customGrammarExercises = computed(
    () => this.customStore()[this.learningLang.activeLang()].exercises,
  );
  protected readonly allGrammarPoints = computed(() => [
    ...this.customGrammarPoints(),
    ...buildStarterGrammarPoints(this.learningLang.activeLang()),
  ]);
  protected readonly filteredGrammarPoints = computed(() => {
    const cat = this.grammarCategory();
    const list = this.allGrammarPoints();
    return cat === 'all' ? list : list.filter((g) => g.category === cat);
  });
  protected readonly activeGrammarIndex = computed(() => {
    const list = this.filteredGrammarPoints();
    if (list.length === 0) return 0;
    const id = this.selectedGrammarId();
    const idx = id ? list.findIndex((g) => g.id === id) : 0;
    return idx >= 0 ? idx : 0;
  });
  protected readonly activeGrammarPoint = computed(() => {
    const list = this.filteredGrammarPoints();
    return list[this.activeGrammarIndex()] ?? null;
  });
  protected readonly grammarDoneCount = computed(
    () => this.allGrammarPoints().filter((g) => this.masteredGrammarIds().includes(g.id)).length,
  );

  // AI Grammar & Exercise Generator state
  protected readonly generatorOpen = signal(false);
  protected readonly generatorTopic = signal('');
  protected readonly generatorLevel = signal<StarterGrammarLevel>('A0');
  protected readonly generating = signal(false);
  protected readonly generateError = signal<string | null>(null);
  protected readonly lastGeneratedSummary = signal<{ title: string; count: number } | null>(null);
  protected readonly generatorPresets = computed(
    () => STARTER_GRAMMAR_AI_PRESETS[this.learningLang.activeLang()],
  );

  // Interactive Practice (Choice + Scramble) state
  protected readonly quizFilter = signal<QuizFilterMode>('all');
  protected readonly allQuizQuestions = computed(() => [
    ...buildStarterGrammarQuiz(this.learningLang.activeLang()),
    ...this.customGrammarExercises(),
  ]);
  protected readonly grammarQuizPool = computed(() => {
    const mode = this.quizFilter();
    const all = this.allQuizQuestions();
    if (mode === 'all') return all;
    if (mode === 'ai') return all.filter((q) => q.isAiGenerated === true);
    return all.filter((q) => q.kind === mode);
  });
  protected readonly grammarQuizIndex = signal(0);
  protected readonly grammarQuizSelected = signal<string | null>(null);
  protected readonly grammarQuizCorrectCount = signal(0);
  protected readonly scramblePickedIndices = signal<number[]>([]);

  protected readonly currentGrammarQuestion = computed(() => {
    const pool = this.grammarQuizPool();
    if (pool.length === 0) return null;
    return pool[this.grammarQuizIndex() % pool.length];
  });
  protected readonly scrambleBuiltText = computed(() => {
    const q = this.currentGrammarQuestion();
    if (!q || q.kind !== 'scramble' || !q.scrambleWords) return '';
    return this.scramblePickedIndices()
      .map((idx) => q.scrambleWords?.[idx] ?? '')
      .filter(Boolean)
      .join(' ');
  });
  protected readonly grammarQuizIsCorrect = computed(() => {
    const picked = this.grammarQuizSelected();
    const q = this.currentGrammarQuestion();
    return picked !== null && q !== null && picked === q.correctOption;
  });

  private lastLang: LearningLanguageCode | null = null;
  private lastUserId: number | null | undefined = undefined;

  constructor() {
    effect(() => {
      const uid = this.userId();
      if (this.lastUserId !== undefined && this.lastUserId !== uid) {
        this.masteredGrammarIds.set(loadMasteredGrammarIds(uid));
        this.customStore.set(loadCustomGrammarStore(uid));
      }
      this.lastUserId = uid;
    });

    effect(() => {
      const lang = this.learningLang.activeLang();
      if (this.lastLang !== null && this.lastLang !== lang) {
        this.selectedGrammarId.set(null);
        this.resetQuizProgress();
        this.quizFilter.set('all');
        this.generateError.set(null);
        this.lastGeneratedSummary.set(null);
      }
      this.lastLang = lang;
    });
  }

  selectGrammarCategory(category: 'all' | StarterGrammarCategory): void {
    this.grammarCategory.set(category);
    this.selectedGrammarId.set(null);
  }

  selectGrammarPoint(id: string): void {
    this.selectedGrammarId.set(id);
  }

  stepGrammarPoint(delta: -1 | 1): void {
    const list = this.filteredGrammarPoints();
    if (list.length === 0) return;
    const nextIdx = (this.activeGrammarIndex() + delta + list.length) % list.length;
    this.selectedGrammarId.set(list[nextIdx].id);
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
    saveMasteredGrammarIds(next, this.userId());
  }

  askGrammarTutor(point: StarterGrammarPoint): void {
    const prompt = this.i18n.lang() === 'vi' ? point.aiPromptVi : point.aiPromptEn;
    this.aiChat?.askInFloating(prompt);
  }

  pickGeneratorPreset(preset: StarterGrammarAiPreset): void {
    this.generatorTopic.set(this.i18n.lang() === 'vi' ? preset.topicVi : preset.topicEn);
    this.generatorLevel.set(preset.level);
    this.generateError.set(null);
  }

  onGeneratorTopicInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.generatorTopic.set(target.value);
    if (this.generateError()) {
      this.generateError.set(null);
    }
  }

  generateCustomGrammar(): void {
    const topic = this.generatorTopic().trim();
    if (!this.aiApi || !topic || this.generating()) {
      return;
    }

    const lang = this.learningLang.activeLang();
    const explainLang = this.i18n.lang();
    this.generating.set(true);
    this.generateError.set(null);
    this.lastGeneratedSummary.set(null);

    this.aiApi
      .generateStarterGrammar({
        topic,
        level: this.generatorLevel(),
        languageCode: lang,
        explanationLanguage: explainLang,
        exerciseCount: 4,
      })
      .subscribe({
        next: (res) => {
          const nextStore = structuredClone(this.customStore());
          nextStore[lang].points = [res.grammarPoint, ...nextStore[lang].points];
          nextStore[lang].exercises = [...nextStore[lang].exercises, ...res.exercises];
          this.customStore.set(nextStore);
          saveCustomGrammarStore(nextStore, this.userId());

          this.grammarCategory.set('all');
          this.selectedGrammarId.set(res.grammarPoint.id);
          this.generatorTopic.set('');
          this.generating.set(false);
          this.lastGeneratedSummary.set({
            title: explainLang === 'vi' ? res.grammarPoint.titleVi : res.grammarPoint.titleEn,
            count: res.exercises.length,
          });
        },
        error: (err: unknown) => {
          this.generating.set(false);
          this.generateError.set(
            extractApiError(
              err,
              explainLang === 'vi'
                ? 'Không thể tạo bài ngữ pháp lúc này. Hãy thử lại sau vài giây.'
                : 'Could not generate grammar right now. Please try again shortly.',
            ),
          );
        },
      });
  }

  removeCustomGrammar(grammarId: string): void {
    const lang = this.learningLang.activeLang();
    const nextStore = structuredClone(this.customStore());
    nextStore[lang].points = nextStore[lang].points.filter((p) => p.id !== grammarId);
    nextStore[lang].exercises = nextStore[lang].exercises.filter((q) => q.grammarId !== grammarId);
    this.customStore.set(nextStore);
    saveCustomGrammarStore(nextStore, this.userId());

    if (this.selectedGrammarId() === grammarId) {
      this.selectedGrammarId.set(null);
    }
    if (this.quizFilter() === 'ai' && nextStore[lang].exercises.length === 0) {
      this.quizFilter.set('all');
    }
    this.resetQuizProgress();
  }

  jumpToQuiz(mode: QuizFilterMode = 'all'): void {
    this.setQuizFilter(mode);
    const el = document.getElementById('starter-grammar-quiz');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setQuizFilter(mode: QuizFilterMode): void {
    this.quizFilter.set(mode);
    this.resetQuizProgress();
  }

  pickGrammarAnswer(option: string): void {
    const q = this.currentGrammarQuestion();
    if (!q) return;
    const alreadyCorrect = this.grammarQuizIsCorrect();
    this.grammarQuizSelected.set(option);
    if (!alreadyCorrect && option === q.correctOption) {
      this.grammarQuizCorrectCount.update((n) => n + 1);
    }
  }

  toggleScrambleWord(wordIndex: number): void {
    const current = this.scramblePickedIndices();
    if (current.includes(wordIndex)) {
      this.scramblePickedIndices.set(current.filter((idx) => idx !== wordIndex));
    } else {
      this.scramblePickedIndices.set([...current, wordIndex]);
    }
    this.grammarQuizSelected.set(null);
  }

  undoScrambleWord(): void {
    const current = this.scramblePickedIndices();
    if (current.length > 0) {
      this.scramblePickedIndices.set(current.slice(0, -1));
      this.grammarQuizSelected.set(null);
    }
  }

  clearScrambleWords(): void {
    this.scramblePickedIndices.set([]);
    this.grammarQuizSelected.set(null);
  }

  submitScrambleAnswer(): void {
    const built = this.scrambleBuiltText().trim();
    if (built) {
      this.pickGrammarAnswer(built);
    }
  }

  nextGrammarQuestion(): void {
    const pool = this.grammarQuizPool();
    if (pool.length === 0) return;
    if (this.grammarQuizIndex() + 1 >= pool.length) {
      this.grammarQuizIndex.set(0);
      this.grammarQuizCorrectCount.set(0);
    } else {
      this.grammarQuizIndex.update((n) => n + 1);
    }
    this.grammarQuizSelected.set(null);
    this.scramblePickedIndices.set([]);
  }

  private resetQuizProgress(): void {
    this.grammarQuizIndex.set(0);
    this.grammarQuizSelected.set(null);
    this.grammarQuizCorrectCount.set(0);
    this.scramblePickedIndices.set([]);
  }
}
