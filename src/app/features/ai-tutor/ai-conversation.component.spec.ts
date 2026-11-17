import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SpeechService } from '../../shared/services/speech.service';
import { TopicsApiService } from '../topics/topics-api.service';
import { VocabularyApiService } from '../vocabulary/vocabulary-api.service';
import { AiApiService } from './ai-api.service';
import { AiConversationComponent } from './ai-conversation.component';

describe('AiConversationComponent', () => {
  let aiApiMock: {
    listConversations: ReturnType<typeof vi.fn>;
    getConversation: ReturnType<typeof vi.fn>;
    startConversation: ReturnType<typeof vi.fn>;
    replyConversation: ReturnType<typeof vi.fn>;
    transcribeAudio: ReturnType<typeof vi.fn>;
    endConversation: ReturnType<typeof vi.fn>;
  };
  let vocabApiMock: { create: ReturnType<typeof vi.fn> };
  let speechMock: {
    isTtsSupported: boolean;
    isMicSupported: boolean;
    speakingId: ReturnType<typeof signal<string | null>>;
    isRecording: ReturnType<typeof signal<boolean>>;
    recordingSeconds: ReturnType<typeof signal<number>>;
    speak: ReturnType<typeof vi.fn>;
    stopSpeaking: ReturnType<typeof vi.fn>;
    startRecording: ReturnType<typeof vi.fn>;
    stopRecording: ReturnType<typeof vi.fn>;
    cancelRecording: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    aiApiMock = {
      listConversations: vi.fn().mockReturnValue(of([])),
      getConversation: vi.fn(),
      startConversation: vi.fn(),
      replyConversation: vi.fn(),
      transcribeAudio: vi.fn(),
      endConversation: vi.fn(),
    };
    vocabApiMock = {
      create: vi.fn().mockReturnValue(of({ id: 99 })),
    };
    speechMock = {
      isTtsSupported: true,
      isMicSupported: true,
      speakingId: signal<string | null>(null),
      isRecording: signal(false),
      recordingSeconds: signal(0),
      speak: vi.fn(),
      stopSpeaking: vi.fn(),
      startRecording: vi.fn().mockImplementation(async () => {
        speechMock.isRecording.set(true);
      }),
      stopRecording: vi.fn().mockImplementation(async () => {
        speechMock.isRecording.set(false);
        return new Blob(['audio-data'], { type: 'audio/webm' });
      }),
      cancelRecording: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AiConversationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AiApiService, useValue: aiApiMock },
        { provide: VocabularyApiService, useValue: vocabApiMock },
        { provide: SpeechService, useValue: speechMock },
        {
          provide: TopicsApiService,
          useValue: { list: vi.fn().mockReturnValue(of({ items: [] })) },
        },
      ],
    }).compileComponents();
  });

  it('sets up topic/level/explanationLang, starts session, speaks AI prompt, records spoken English reply -> feedback + follow-up, and summarizes session', async () => {
    aiApiMock.startConversation.mockReturnValue(
      of({
        id: 12,
        topic: 'Weekend Activities',
        level: 'B2',
        explanationLang: 'en',
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
            aiPrompt: 'What do you usually do on weekends?',
            userAnswer: null,
            feedback: null,
            answeredAt: null,
            createdAt: '2026-11-18T00:00:00Z',
          },
        ],
      }),
    );

    aiApiMock.transcribeAudio.mockReturnValue(
      of({
        model: 'whisper-large-v3-turbo',
        text: 'On weekend I usually hang out with friends.',
      }),
    );

    aiApiMock.replyConversation.mockReturnValue(
      of({
        id: 12,
        topic: 'Weekend Activities',
        level: 'B2',
        explanationLang: 'en',
        status: 'active',
        turnCount: 1,
        summary: null,
        createdAt: '2026-11-18T00:00:00Z',
        updatedAt: '2026-11-18T00:01:00Z',
        endedAt: null,
        turns: [
          {
            id: 1,
            turnNumber: 1,
            aiPrompt: 'What do you usually do on weekends?',
            userAnswer: 'On weekend I usually hang out with friends.',
            feedback: {
              appropriateness: 'good',
              assessment: 'Understandable, just use plural "weekends".',
              notableErrors: [
                {
                  original: 'On weekend',
                  correction: 'On weekends',
                  category: 'grammar',
                  reason: 'Use plural form for repeated weekend habits.',
                },
              ],
              improvedVersion: 'On weekends, I usually hang out with my friends.',
              explanation:
                '1. **Plural form**: Use **weekends** for repeated habits. 2. **Tone**: Keep it warm and casual.',
              suggestedWords: [
                {
                  term: 'catch up',
                  partOfSpeech: 'phrase',
                  definition: 'talk with friends after not seeing them',
                  example: 'We meet at a cafe to catch up.',
                },
              ],
            },
            answeredAt: '2026-11-18T00:01:00Z',
            createdAt: '2026-11-18T00:00:00Z',
          },
          {
            id: 2,
            turnNumber: 2,
            aiPrompt: 'Nice! What do you and your friends like to do together?',
            userAnswer: null,
            feedback: null,
            answeredAt: null,
            createdAt: '2026-11-18T00:01:00Z',
          },
        ],
      }),
    );

    aiApiMock.endConversation.mockReturnValue(
      of({
        id: 12,
        topic: 'Weekend Activities',
        level: 'B2',
        explanationLang: 'en',
        status: 'completed',
        turnCount: 1,
        summary: {
          overallRemark: 'Great speaking practice session.',
          commonMistakes: [
            {
              pattern: 'Missing plural -s after "On weekend"',
              example: 'On weekend -> On weekends',
              suggestion: 'Use plural for regular habits.',
            },
          ],
          newVocabulary: [
            {
              term: 'catch up',
              partOfSpeech: 'phrase',
              definition: 'talk with friends after not seeing them',
              example: 'We meet at a cafe to catch up.',
            },
          ],
          improvementTips: ['Try describing one specific activity in 2-3 sentences.'],
        },
        createdAt: '2026-11-18T00:00:00Z',
        updatedAt: '2026-11-18T00:02:00Z',
        endedAt: '2026-11-18T00:02:00Z',
        turns: [],
      }),
    );

    const fixture = TestBed.createComponent(AiConversationComponent);
    fixture.componentRef.setInput('aiEnabled', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const topicInput = el.querySelector<HTMLInputElement>('#conv-topic-input')!;
    topicInput.value = 'Weekend Activities';
    topicInput.dispatchEvent(new Event('input'));

    const b2Btn = Array.from(el.querySelectorAll<HTMLButtonElement>('.conv-pill')).find(
      (b) => b.textContent?.trim() === 'B2',
    );
    b2Btn?.click();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.conv-start-btn')?.click();
    fixture.detectChanges();

    expect(speechMock.speak).toHaveBeenCalledWith(
      'What do you usually do on weekends?',
      'turn-1',
      0.95,
    );
    expect(el.textContent).toContain('What do you usually do on weekends?');

    // Start recording spoken English via Mic button
    const micBtn = el.querySelector<HTMLButtonElement>('.conv-mic-btn')!;
    micBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(speechMock.startRecording).toHaveBeenCalled();

    // Stop recording -> transcribes audio -> auto-sends voice answer -> AI feedback + connected follow-up
    micBtn.click();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();

    expect(aiApiMock.transcribeAudio).toHaveBeenCalled();
    expect(aiApiMock.replyConversation).toHaveBeenCalledWith(
      12,
      'On weekend I usually hang out with friends.',
      'voice',
    );
    expect(el.textContent).toContain('On weekends');
    expect(el.textContent).toContain('On weekends, I usually hang out with my friends.');
    expect(el.textContent).toContain('What do you and your friends like to do together?');

    const explainEl = el.querySelector('.conv-feedback__explain')!;
    expect(explainEl.querySelectorAll('ol li').length).toBe(2);
    expect(explainEl.querySelector('strong')?.textContent).toBe('Plural form');
    expect(explainEl.textContent).not.toContain('**');

    el.querySelector<HTMLButtonElement>('.conv-end-btn')?.click();
    fixture.detectChanges();

    expect(aiApiMock.endConversation).toHaveBeenCalledWith(12);
    expect(el.textContent).toContain('Session Summary & Insights');
    expect(el.textContent).toContain('catch up');

    const saveBtn = el.querySelector<HTMLButtonElement>('.conv-vocab-card button');
    saveBtn?.click();
    fixture.detectChanges();
    expect(vocabApiMock.create).toHaveBeenCalledWith({
      term: 'catch up',
      definition: 'talk with friends after not seeing them',
      partOfSpeech: 'phrase',
      example: 'We meet at a cafe to catch up.',
    });
  });
});
