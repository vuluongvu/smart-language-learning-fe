import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SpeechService } from '../../shared/services/speech.service';
import { AiApiService } from '../ai-tutor/ai-api.service';
import { FlashcardsApiService } from '../flashcards/flashcards-api.service';
import { LearningPathApiService } from './learning-path-api.service';
import { LearningUnitComponent } from './learning-unit.component';

describe('LearningUnitComponent', () => {
  let pathApiMock: {
    getUnitDetail: ReturnType<typeof vi.fn>;
    syncUnitVocab: ReturnType<typeof vi.fn>;
    submitUnitQuiz: ReturnType<typeof vi.fn>;
    evaluateUnitWriting: ReturnType<typeof vi.fn>;
    startUnitSpeaking: ReturnType<typeof vi.fn>;
    completeUnitSpeaking: ReturnType<typeof vi.fn>;
    saveUnitWords: ReturnType<typeof vi.fn>;
  };
  let flashcardsMock: { createSession: ReturnType<typeof vi.fn> };

  const baseProgress = {
    vocabCompleted: false,
    quizCompleted: false,
    quizScore: null,
    writingCompleted: false,
    writingSubmission: null,
    writingFeedback: null,
    speakingCompleted: false,
    speakingSessionId: null,
    topicId: null,
    skillsDone: 0,
    totalSkills: 4,
    percentDone: 0,
    completedAt: null,
  };

  beforeEach(async () => {
    pathApiMock = {
      getUnitDetail: vi.fn().mockReturnValue(
        of({
          id: 101,
          unitNumber: 1,
          slug: 'where-do-you-live',
          title: 'Where Do You Live?',
          topicName: 'Neighborhood & Home',
          icon: 'home',
          themeColor: 'green',
          grammarFocus: 'Present simple & prepositions',
          track: {
            id: 1,
            code: 'band_45_55',
            title: 'Band 4.5–5.5',
            cefrLevel: 'B1',
            languageCode: 'en',
            summary: 'Foundation path',
          },
          part: { id: 10, partNumber: 1, title: 'My Everyday World', subtitle: 'Home' },
          vocabulary: [
            {
              term: 'cozy',
              pronunciation: '/ˈkoʊzi/',
              partOfSpeech: 'adjective',
              definition: 'ấm cúng',
              example: 'My flat is cozy.',
              notes: 'Natural word.',
              inNotebook: false,
            },
          ],
          readingListening: {
            title: 'Linh apartment',
            audioScript: 'I live in a cozy apartment.',
            translation: 'Mình sống ở căn hộ ấm cúng.',
            questions: [
              {
                id: 'q1',
                prompt: 'How is her apartment?',
                options: ['Noisy', 'Cozy'],
                correctIndex: 1,
                explanation: 'Passage mentions cozy apartment.',
              },
            ],
          },
          writing: {
            prompt: 'Describe your home.',
            minSentences: 3,
            targetBand: 'Band 4.5–5.5',
            targetTerms: ['cozy', 'balcony'],
            sampleAnswer: 'I live in a cozy apartment.',
          },
          speakingTopicPrompt: 'Describe your home and neighborhood',
          progress: baseProgress,
        }),
      ),
      syncUnitVocab: vi.fn().mockReturnValue(
        of({
          topicId: 88,
          topicName: 'Neighborhood & Home',
          addedCount: 1,
          alreadyInNotebookCount: 0,
          totalUnitWords: 1,
          progress: {
            ...baseProgress,
            vocabCompleted: true,
            topicId: 88,
            skillsDone: 1,
            percentDone: 25,
          },
        }),
      ),
      submitUnitQuiz: vi.fn().mockReturnValue(
        of({
          score: 100,
          correctCount: 1,
          total: 1,
          results: [
            {
              questionId: 'q1',
              selectedIndex: 1,
              correctIndex: 1,
              isCorrect: true,
              explanation: 'Good!',
            },
          ],
          progress: {
            ...baseProgress,
            vocabCompleted: true,
            quizCompleted: true,
            quizScore: 100,
            topicId: 88,
            skillsDone: 2,
            percentDone: 50,
          },
        }),
      ),
      evaluateUnitWriting: vi.fn().mockReturnValue(
        of({
          feedback: {
            estimatedBand: 'Band 5.0',
            summary: 'Clear sentences.',
            usedTargetTerms: ['cozy'],
            missedTargetTerms: ['balcony'],
            notableErrors: [],
            upgradedVersion: 'I live in a cozy apartment with a small balcony.',
            explanation: 'Try adding **balcony** next time.',
            suggestedWords: [
              {
                term: 'spacious',
                partOfSpeech: 'adjective',
                definition: 'rộng rãi',
                example: 'Our room is spacious.',
              },
            ],
          },
          progress: {
            ...baseProgress,
            vocabCompleted: true,
            quizCompleted: true,
            writingCompleted: true,
            topicId: 88,
            skillsDone: 3,
            percentDone: 75,
            writingFeedback: {
              estimatedBand: 'Band 5.0',
              summary: 'Clear sentences.',
              usedTargetTerms: ['cozy'],
              missedTargetTerms: ['balcony'],
              notableErrors: [],
              upgradedVersion: 'I live in a cozy apartment with a small balcony.',
              explanation: 'Try adding **balcony** next time.',
              suggestedWords: [
                {
                  term: 'spacious',
                  partOfSpeech: 'adjective',
                  definition: 'rộng rãi',
                  example: 'Our room is spacious.',
                },
              ],
            },
          },
        }),
      ),
      startUnitSpeaking: vi.fn().mockReturnValue(
        of({
          session: {
            id: 300,
            topic: 'Where Do You Live?',
            level: 'B1',
            explanationLang: 'vi',
            status: 'active',
            turnCount: 0,
            summary: null,
            createdAt: '2026-11-18T00:00:00Z',
            updatedAt: '2026-11-18T00:00:00Z',
            endedAt: null,
            turns: [
              {
                id: 1,
                turnNumber: 1,
                aiPrompt: 'Tell me about your neighborhood!',
                userAnswer: null,
                feedback: null,
                answeredAt: null,
                createdAt: '2026-11-18T00:00:00Z',
              },
            ],
          },
          progress: { ...baseProgress, speakingSessionId: 300 },
        }),
      ),
      completeUnitSpeaking: vi.fn().mockReturnValue(
        of({
          progress: { ...baseProgress, speakingCompleted: true, skillsDone: 4, percentDone: 100 },
        }),
      ),
      saveUnitWords: vi
        .fn()
        .mockReturnValue(
          of({ topicId: 88, topicName: 'Neighborhood & Home', addedCount: 1, skippedCount: 0 }),
        ),
    };

    flashcardsMock = {
      createSession: vi.fn().mockReturnValue(of({ id: 55 })),
    };

    await TestBed.configureTestingModule({
      imports: [LearningUnitComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '101' })) } },
        { provide: LearningPathApiService, useValue: pathApiMock },
        { provide: FlashcardsApiService, useValue: flashcardsMock },
        {
          provide: AiApiService,
          useValue: {
            getStatus: vi.fn().mockReturnValue(of({ enabled: true, model: 'qwen/qwen3.8-27b' })),
            listConversations: vi.fn().mockReturnValue(of([])),
          },
        },
        {
          provide: SpeechService,
          useValue: {
            isTtsSupported: true,
            isMicSupported: true,
            speakingId: signal<string | null>(null),
            isRecording: signal(false),
            recordingSeconds: signal(0),
            speak: vi.fn(),
            stopSpeaking: vi.fn(),
            startRecording: vi.fn(),
            stopRecording: vi.fn(),
            cancelRecording: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('walks through all 4 unit skills: Vocab -> Quiz -> AI Writing -> AI Speaking', () => {
    const fixture = TestBed.createComponent(LearningUnitComponent);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Where Do You Live?');
    expect(el.textContent).toContain('cozy');

    // Step 1: Save all to Notebook
    const syncBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Save all to Notebook'),
    )!;
    syncBtn.click();
    fixture.detectChanges();
    expect(pathApiMock.syncUnitVocab).toHaveBeenCalledWith(101);
    expect(el.textContent).toContain('In Notebook');

    // Step 2: Switch to Listen & Read Quiz
    const stepBtns = Array.from(el.querySelectorAll<HTMLButtonElement>('.lpu-step-btn'));
    stepBtns[1].click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.lpu-option-btn')[1].click();
    fixture.detectChanges();
    const checkBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Check answers'),
    )!;
    checkBtn.click();
    fixture.detectChanges();
    expect(pathApiMock.submitUnitQuiz).toHaveBeenCalledWith(101, [
      { questionId: 'q1', selectedIndex: 1 },
    ]);
    expect(el.textContent).toContain('100%');

    // Step 3: Switch to AI Writing
    stepBtns[2].click();
    fixture.detectChanges();
    const textarea = el.querySelector<HTMLTextAreaElement>('#lpu-writing-input')!;
    textarea.value = 'I live in a cozy apartment near the park.';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const evalBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Evaluate for target Band'),
    )!;
    evalBtn.click();
    fixture.detectChanges();
    expect(pathApiMock.evaluateUnitWriting).toHaveBeenCalledWith(
      101,
      'I live in a cozy apartment near the park.',
      'en',
    );
    expect(el.textContent).toContain('Band 5.0');

    // Step 4: Switch to AI Speaking
    stepBtns[3].click();
    fixture.detectChanges();
    const startSpeakBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Start AI voice practice'),
    )!;
    startSpeakBtn.click();
    fixture.detectChanges();
    expect(pathApiMock.startUnitSpeaking).toHaveBeenCalledWith(101, 'en');
    expect(el.textContent).toContain('Tell me about your neighborhood!');
  });
});
