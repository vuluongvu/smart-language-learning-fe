import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  OqHangulModalComponent,
  OqIconComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import { I18nService } from '../../shared/i18n';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { SpeechService } from '../../shared/services/speech.service';
import type { LearningLanguageCode } from '../../shared/types/learning-language.types';
import {
  ENGLISH_ALPHABET,
  ENGLISH_PHONICS_TIPS,
  EN_SENTENCE_OBJECTS,
  EN_SENTENCE_SUBJECTS,
  EN_SENTENCE_VERBS,
  KOREAN_BATCHIM_OPTIONS,
  KOREAN_CONSONANTS,
  KOREAN_VOWELS,
  buildStarterQuizPool,
  composeHangulSyllable,
  resolveVerbForm,
} from './starter-curriculum.data';
import { StarterGrammarComponent } from './starter-grammar.component';
import { StarterTranslatePipe } from './starter-studio.i18n';

export type StarterTab = 'alphabet' | 'builder' | 'grammar' | 'drill';

@Component({
  selector: 'app-starter-studio',
  imports: [
    RouterLink,
    OqPageHeaderComponent,
    OqHangulModalComponent,
    OqIconComponent,
    StarterGrammarComponent,
    StarterTranslatePipe,
  ],
  templateUrl: './starter-studio.component.html',
  styleUrl: './starter-studio.component.scss',
})
export class StarterStudioComponent {
  protected readonly speech = inject(SpeechService);
  protected readonly i18n = inject(I18nService);
  protected readonly learningLang = inject(LearningLanguageService);
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly activeTab = signal<StarterTab>('alphabet');
  protected readonly slowAudio = signal(true);
  protected readonly audioRate = computed(() => (this.slowAudio() ? 0.78 : 0.95));

  // English Alphabet, Phonics & 3-block Sentence Builder
  protected readonly englishLetters = ENGLISH_ALPHABET;
  protected readonly enLetterFilter = signal<'all' | 'vowels' | 'consonants'>('all');
  protected readonly filteredEnglishLetters = computed(() => {
    const mode = this.enLetterFilter();
    if (mode === 'vowels') return this.englishLetters.filter((l) => l.isVowel);
    if (mode === 'consonants') return this.englishLetters.filter((l) => !l.isVowel);
    return this.englishLetters;
  });
  protected readonly englishPhonics = ENGLISH_PHONICS_TIPS;
  protected readonly sentenceSubjects = EN_SENTENCE_SUBJECTS;
  protected readonly sentenceVerbs = EN_SENTENCE_VERBS;
  protected readonly sentenceObjects = EN_SENTENCE_OBJECTS;

  protected readonly selectedSubjIdx = signal(0);
  protected readonly selectedVerbIdx = signal(0);
  protected readonly selectedObjIdx = signal(0);

  protected readonly builtSentence = computed(() => {
    const subj = this.sentenceSubjects[this.selectedSubjIdx()] ?? this.sentenceSubjects[0];
    const verb = this.sentenceVerbs[this.selectedVerbIdx()] ?? this.sentenceVerbs[0];
    const obj = this.sentenceObjects[this.selectedObjIdx()] ?? this.sentenceObjects[0];
    const conjugated = resolveVerbForm(subj.text, verb);
    return {
      subject: subj.text,
      verb: conjugated,
      ending: obj.text,
      english: `${subj.text} ${conjugated} ${obj.text}.`,
      meaningVi: `${subj.meaningVi} ${verb.meaningVi} ${obj.meaningVi}.`,
      meaningEn: `${subj.meaningEn} ${verb.meaningEn} ${obj.meaningEn}.`,
    };
  });

  // Korean Hangul Jamo & Interactive Combiner
  protected readonly koreanConsonants = KOREAN_CONSONANTS;
  protected readonly koreanVowels = KOREAN_VOWELS;
  protected readonly koJamoFilter = signal<'all' | 'consonants' | 'vowels'>('all');
  protected readonly batchimOptions = KOREAN_BATCHIM_OPTIONS;

  protected readonly selectedConsonantIdx = signal(0); // ㄱ
  protected readonly selectedVowelIdx = signal(0); // ㅏ
  protected readonly selectedBatchimIdx = signal(0); // none
  protected readonly handwritingTarget = signal<string | null>(null);

  protected readonly combinedHangul = computed(() => {
    const c = this.koreanConsonants[this.selectedConsonantIdx()] ?? this.koreanConsonants[0];
    const v = this.koreanVowels[this.selectedVowelIdx()] ?? this.koreanVowels[0];
    const b = this.batchimOptions[this.selectedBatchimIdx()] ?? this.batchimOptions[0];
    return composeHangulSyllable(c.jamoIndex, v.jamoIndex, b.finalIndex);
  });

  // Listen & Match Drill state
  protected readonly drillPool = computed(() =>
    buildStarterQuizPool(this.learningLang.activeLang()),
  );
  protected readonly drillIndex = signal(0);
  protected readonly drillSelected = signal<string | null>(null);
  protected readonly drillCorrectCount = signal(0);
  protected readonly currentDrill = computed(() => {
    const pool = this.drillPool();
    return pool[this.drillIndex() % pool.length];
  });
  protected readonly drillIsCorrect = computed(() => {
    const picked = this.drillSelected();
    return picked !== null && picked === this.currentDrill().correctOption;
  });

  protected readonly a0PathLinkQuery = computed(() => ({
    band: this.learningLang.isKorean() ? 'ko_starter_a0' : 'starter_a0',
  }));

  private lastLang: LearningLanguageCode | null = null;

  constructor() {
    effect(() => {
      const lang = this.learningLang.activeLang();
      if (this.lastLang !== null && this.lastLang !== lang) {
        this.drillIndex.set(0);
        this.drillSelected.set(null);
        this.drillCorrectCount.set(0);
        this.speech.stopSpeaking();
      }
      this.lastLang = lang;
    });

    this.route?.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tab = params.get('tab');
      if (tab === 'alphabet' || tab === 'builder' || tab === 'grammar' || tab === 'drill') {
        this.activeTab.set(tab);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.speech.stopSpeaking();
    });
  }

  speakText(text: string, id: string, overrideRate?: number): void {
    this.speech.speak(text, id, overrideRate ?? this.audioRate(), this.learningLang.activeLang());
  }

  speakConsonantSyllable(jamoIndex: number, id: string): void {
    const syllable = composeHangulSyllable(jamoIndex, 0, 0).char;
    this.speakText(syllable, id);
  }

  speakVowelSyllable(jamoIndex: number, id: string): void {
    const syllable = composeHangulSyllable(11, jamoIndex, 0).char;
    this.speakText(syllable, id);
  }

  openHandwriting(text: string): void {
    this.handwritingTarget.set(text);
  }

  pickDrillOption(option: string): void {
    const alreadyCorrect = this.drillIsCorrect();
    this.drillSelected.set(option);
    if (!alreadyCorrect && option === this.currentDrill().correctOption) {
      this.drillCorrectCount.update((n) => n + 1);
    }
  }

  nextDrillQuestion(): void {
    const pool = this.drillPool();
    if (this.drillIndex() + 1 >= pool.length) {
      this.drillIndex.set(0);
      this.drillCorrectCount.set(0);
    } else {
      this.drillIndex.update((n) => n + 1);
    }
    this.drillSelected.set(null);
  }
}
