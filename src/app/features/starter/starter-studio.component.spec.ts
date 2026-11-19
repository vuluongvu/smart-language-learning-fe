import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
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
    speechMock = {
      isTtsSupported: true,
      speakingId: signal<string | null>(null),
      speak: vi.fn(),
      stopSpeaking: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [StarterStudioComponent],
      providers: [provideRouter([]), { provide: SpeechService, useValue: speechMock }],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem('argon_learning_course');
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
      activeTab: ReturnType<typeof signal<'alphabet' | 'builder' | 'drill'>>;
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
});
