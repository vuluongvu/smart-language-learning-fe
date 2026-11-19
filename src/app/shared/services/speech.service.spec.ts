import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SpeechService } from './speech.service';

describe('SpeechService', () => {
  const originalSpeechSynthesis = window.speechSynthesis;
  const originalUtterance = (globalThis as Record<string, unknown>)['SpeechSynthesisUtterance'];

  class MockUtterance {
    text: string;
    lang = '';
    rate = 1;
    voice: SpeechSynthesisVoice | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(text: string) {
      this.text = text;
    }
  }

  let spokenUtterances: MockUtterance[] = [];

  beforeEach(() => {
    spokenUtterances = [];
    (globalThis as Record<string, unknown>)['SpeechSynthesisUtterance'] = MockUtterance;
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: vi.fn(() => [
          { lang: 'en-US', name: 'English US' },
          { lang: 'ko-KR', name: 'Korean' },
        ]),
        speak: vi.fn((u: MockUtterance) => {
          spokenUtterances.push(u);
        }),
        cancel: vi.fn(),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: originalSpeechSynthesis,
    });
    (globalThis as Record<string, unknown>)['SpeechSynthesisUtterance'] = originalUtterance;
    TestBed.resetTestingModule();
  });

  it('selects ko-KR voice when langCode is ko or text contains Hangul', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(SpeechService);

    service.speak('안녕하세요', 'ko-auto');
    expect(spokenUtterances.length).toBe(1);
    expect(spokenUtterances[0].lang).toBe('ko-KR');
    expect(spokenUtterances[0].voice?.lang).toBe('ko-KR');

    service.speak('Hello there', 'ko-explicit', 0.95, 'ko');
    expect(spokenUtterances[1].lang).toBe('ko-KR');

    service.speak('Good morning', 'en-default');
    expect(spokenUtterances[2].lang).toBe('en-US');
    expect(spokenUtterances[2].voice?.lang).toBe('en-US');
  });
});
