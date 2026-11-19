import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AiApiService } from '../ai-tutor/ai-api.service';
import { SpeechService } from '../../shared/services/speech.service';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { StarterStudioComponent } from './starter-studio.component';
import { composeHangulSyllable } from './starter-curriculum.data';
import { STARTER_EN_TRANSLATIONS, STARTER_VI_TRANSLATIONS } from './starter-studio.i18n';

describe('StarterStudioComponent', () => {
  let speechMock: {
    isTtsSupported: boolean;
    speakingId: ReturnType<typeof signal<string | null>>;
    speak: ReturnType<typeof vi.fn>;
    stopSpeaking: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.removeItem('argon_learning_course');
    localStorage.removeItem('argon_starter_grammar_done');
    localStorage.removeItem('argon_starter_grammar_custom_v1');
    speechMock = {
      isTtsSupported: true,
      speakingId: signal<string | null>(null),
      speak: vi.fn(),
      stopSpeaking: vi.fn(),
    };

    const aiApiMock = {
      getStatus: vi.fn(() => of({ enabled: true, model: 'groq-test' })),
      chat: vi.fn(() =>
        of({
          content: 'Sample grammar tip reply',
          model: 'groq-test',
          usage: { totalTokens: 40 },
        }),
      ),
      generateStarterGrammar: vi.fn(() =>
        of({
          model: 'groq-test',
          grammarPoint: {
            id: 'ai-en-g-test1',
            category: 'verbs',
            titleVi: 'Thì Hiện tại tiếp diễn',
            titleEn: 'Present Continuous Tense',
            formula: 'S + am/is/are + V-ing',
            explanationVi: 'Diễn tả hành động đang xảy ra ngay lúc nói.',
            explanationEn: 'Used for actions happening right now.',
            rules: [{ labelVi: 'Hiện tại', labelEn: 'Now', sample: 'I am studying' }],
            examples: [
              {
                sentence: 'She is reading a book now.',
                meaningVi: 'Bây giờ cô ấy đang đọc sách.',
                meaningEn: 'She is reading a book now.',
              },
            ],
            mistake: 'She reading now.',
            correction: 'She is reading now.',
            mistakeNoteVi: 'Cần có "is" trước "reading".',
            mistakeNoteEn: 'Include "is" before "reading".',
            aiPromptVi: 'Cho thêm ví dụ Present Continuous.',
            aiPromptEn: 'Give more Present Continuous examples.',
            isAiGenerated: true,
            level: 'A1',
          },
          exercises: [
            {
              id: 'ai-en-q1',
              grammarId: 'ai-en-g-test1',
              kind: 'choice',
              promptVi: 'Điền dạng đúng:',
              promptEn: 'Fill in the blank:',
              stem: 'They ___ studying now.',
              correctOption: 'are',
              options: ['am', 'is', 'are', 'be'],
              completedSentence: 'They are studying now.',
              explanationVi: 'Chủ ngữ They đi với are.',
              explanationEn: 'Use "are" with "They".',
              isAiGenerated: true,
            },
            {
              id: 'ai-en-q2',
              grammarId: 'ai-en-g-test1',
              kind: 'scramble',
              promptVi: 'Sắp xếp câu:',
              promptEn: 'Order sentence:',
              stem: 'Tôi đang uống trà.',
              correctOption: 'I am drinking tea.',
              options: [],
              scrambleWords: ['drinking', 'I', 'tea.', 'am'],
              completedSentence: 'I am drinking tea.',
              explanationVi: 'S + am + V-ing + O.',
              explanationEn: 'Keep Subject + am + V-ing + Object.',
              isAiGenerated: true,
            },
          ],
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [StarterStudioComponent],
      providers: [
        provideRouter([]),
        { provide: SpeechService, useValue: speechMock },
        { provide: AiApiService, useValue: aiApiMock },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem('argon_learning_course');
    localStorage.removeItem('argon_starter_grammar_done');
    localStorage.removeItem('argon_starter_grammar_custom_v1');
  });

  it('maintains 100% EN/VI key parity for starter-studio i18n dictionary', () => {
    expect(Object.keys(STARTER_VI_TRANSLATIONS).sort()).toEqual(
      Object.keys(STARTER_EN_TRANSLATIONS).sort(),
    );
  });

  it('composes exact Unicode Hangul syllables with optional batchim', () => {
    expect(composeHangulSyllable(18, 0, 4)).toEqual({ char: '한', roman: 'han' });
    expect(composeHangulSyllable(0, 0, 0)).toEqual({ char: '가', roman: 'ga' });
    expect(composeHangulSyllable(11, 8, 0)).toEqual({ char: '오', roman: 'o' });
  });

  it('renders English A-Z alphabet, builds 3-block sentences, switches to Korean Hangul mixer, and runs listen drill', () => {
    const fixture = TestBed.createComponent(StarterStudioComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Apple');
    expect(el.textContent).toContain('Zero');

    const comp = fixture.componentInstance as unknown as {
      activeTab: ReturnType<typeof signal<'alphabet' | 'builder' | 'grammar' | 'drill'>>;
      selectedSubjIdx: ReturnType<typeof signal<number>>;
      selectedVerbIdx: ReturnType<typeof signal<number>>;
      selectedObjIdx: ReturnType<typeof signal<number>>;
      pickDrillOption: (opt: string) => void;
      drillCorrectCount: ReturnType<typeof signal<number>>;
      nextDrillQuestion: () => void;
    };

    // Tab 2: English sentence builder conjugates to-be & third-person singular cleanly
    comp.activeTab.set('builder');
    fixture.detectChanges();
    expect(el.textContent).toContain('I am happy today.');

    comp.selectedSubjIdx.set(3); // He
    comp.selectedVerbIdx.set(1); // like -> likes
    comp.selectedObjIdx.set(2); // coffee
    fixture.detectChanges();
    expect(el.textContent).toContain('He likes coffee.');

    // Tab 3: Listen & match drill tracks streak cleanly
    comp.activeTab.set('drill');
    fixture.detectChanges();
    comp.pickDrillOption('Apple');
    expect(comp.drillCorrectCount()).toBe(1);
    comp.nextDrillQuestion();
    expect(comp.drillCorrectCount()).toBe(1);

    // Switch to Korean course -> displays Hangul syllable mixer
    const langSvc = TestBed.inject(LearningLanguageService);
    langSvc.setLanguage('ko');
    comp.activeTab.set('builder');
    fixture.detectChanges();
    expect(el.textContent).toContain('가');
  });

  it('renders bilingual A0 grammar cards, category filter, mastery toggle, interactive grammar check, and floating AI tutor hook', () => {
    const fixture = TestBed.createComponent(StarterStudioComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      activeTab: ReturnType<typeof signal<'alphabet' | 'builder' | 'grammar' | 'drill'>>;
    };

    comp.activeTab.set('grammar');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Subject + Verb + Object');
    expect(el.textContent).toContain('She ___ my English teacher.');

    // Filters grammar cards cleanly via DOM pill click
    const particlesBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Particles / Articles'),
    );
    particlesBtn?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Articles a / an / the');
    expect(el.textContent).not.toContain('Subject + Verb + Object');

    // Persists mastered count via DOM click
    const doneBtn = el.querySelector<HTMLButtonElement>('.st-grammar-done-btn');
    doneBtn?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Mastered: 1 / 10 points');

    // Interactive grammar quiz scoring + feedback
    const isOpt = Array.from(el.querySelectorAll<HTMLButtonElement>('.st-grammar-option')).find(
      (b) => b.textContent?.trim() === 'is',
    );
    isOpt?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Score: 1 / 14');
    expect(el.textContent).toContain('She is my English teacher.');

    // Interactive word scramble filter & sentence assembly
    const scramblePill = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Word Order'),
    );
    scramblePill?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Tap word tiles below');

    for (const token of ['I', 'drink', 'tea', 'every', 'morning.']) {
      const btn = Array.from(el.querySelectorAll<HTMLButtonElement>('.stg-word-btn')).find(
        (b) => b.textContent?.trim() === token,
      );
      btn?.click();
    }
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.st-grammar-check-btn')?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Spot on!');

    // Open AI generator box, pick preset, generate custom grammar + exercises, then remove
    el.querySelector<HTMLButtonElement>('.st-grammar-gen-toggle')?.click();
    fixture.detectChanges();
    const presetBtn = Array.from(
      el.querySelectorAll<HTMLButtonElement>('.stg-gen-box .oq-pill'),
    ).find((b) => b.textContent?.includes('Present Continuous'));
    presetBtn?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.st-grammar-gen-submit')?.click();
    fixture.detectChanges();

    expect(el.textContent).toContain('Present Continuous Tense');
    expect(el.textContent).toContain('AI Generated (2)');

    el.querySelector<HTMLButtonElement>('.st-grammar-remove-btn')?.click();
    fixture.detectChanges();
    expect(el.textContent).not.toContain('AI Generated (2)');

    // Switch to Korean -> Korean A0 grammar & particles appear
    const langSvc = TestBed.inject(LearningLanguageService);
    langSvc.setLanguage('ko');
    fixture.detectChanges();
    const allFilterBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('All rules'),
    );
    allFilterBtn?.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('-이에요 / -예요');
    expect(el.textContent).toContain('저는 학생___.');

    // Ask AI Tutor button opens floating tutor and sends context question
    const askAiBtn = el.querySelector<HTMLButtonElement>('.st-grammar-ai-btn');
    expect(askAiBtn).not.toBeNull();
    askAiBtn?.click();
    const aiApiMock = TestBed.inject(AiApiService) as unknown as {
      chat: ReturnType<typeof vi.fn>;
    };
    expect(aiApiMock.chat).toHaveBeenCalledTimes(1);
  });
});
