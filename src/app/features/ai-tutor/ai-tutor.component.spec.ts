import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { LearningLanguageService } from '../../shared/services/learning-language.service';
import { AiApiService } from './ai-api.service';
import { AiTutorComponent } from './ai-tutor.component';

describe('AiApiService', () => {
  let service: AiApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('unwraps /ai/status and /ai/chat responses from ApiEnvelope', () => {
    let statusResult: unknown;
    service.getStatus().subscribe((res) => {
      statusResult = res;
    });

    const statusReq = httpMock.expectOne(`${environment.apiBaseUrl}/ai/status`);
    expect(statusReq.request.method).toBe('GET');
    statusReq.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-11-18T00:00:00.000Z',
      data: { enabled: true, model: 'llama-3.1-8b-instant' },
    });
    expect(statusResult).toEqual({ enabled: true, model: 'llama-3.1-8b-instant' });

    let chatResult: unknown;
    service.chat({ message: 'Explain pragmatic' }).subscribe((res) => {
      chatResult = res;
    });

    const chatReq = httpMock.expectOne(`${environment.apiBaseUrl}/ai/chat`);
    expect(chatReq.request.method).toBe('POST');
    expect(chatReq.request.body).toEqual({ message: 'Explain pragmatic' });
    chatReq.flush({
      statusCode: 201,
      message: 'Success',
      timestamp: '2026-11-18T00:00:00.000Z',
      data: {
        model: 'llama-3.1-8b-instant',
        content: 'Pragmatic means practical and realistic.',
        usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
      },
    });
    expect(chatResult).toEqual({
      model: 'llama-3.1-8b-instant',
      content: 'Pragmatic means practical and realistic.',
      usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
    });
  });
});

describe('AiTutorComponent', () => {
  let aiApiMock: {
    getStatus: ReturnType<typeof vi.fn>;
    chat: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.clear();
    aiApiMock = {
      getStatus: vi.fn(),
      chat: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AiTutorComponent],
      providers: [provideRouter([]), { provide: AiApiService, useValue: aiApiMock }],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('displays disabled guidance banner and disables composer when AI is off', () => {
    aiApiMock.getStatus.mockReturnValue(of({ enabled: false, model: 'llama-3.1-8b-instant' }));

    const fixture = TestBed.createComponent(AiTutorComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Disabled · llama-3.1-8b-instant');
    expect(el.textContent).toContain('AI Tutor is currently disabled on the server');

    const textarea = el.querySelector<HTMLTextAreaElement>('#ai-composer-input');
    const submitBtn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(textarea?.disabled).toBe(true);
    expect(submitBtn?.disabled).toBe(true);
  });

  it('sends starter prompt, renders reply, passes bounded history, and clears chat', () => {
    aiApiMock.getStatus.mockReturnValue(of({ enabled: true, model: 'llama-3.1-8b-instant' }));
    aiApiMock.chat
      .mockReturnValueOnce(
        of({
          model: 'qwen/qwen3.8-27b',
          content:
            '### Quick Tip\n**Affect** is usually a verb, while **effect** is usually a noun.',
          usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 },
        }),
      )
      .mockReturnValueOnce(
        of({
          model: 'qwen/qwen3.8-27b',
          content: 'Example: The weather affected our plans.',
        }),
      );

    const fixture = TestBed.createComponent(AiTutorComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Active · llama-3.1-8b-instant');

    const firstStarter = el.querySelector<HTMLButtonElement>('.ai-starter');
    firstStarter?.click();
    fixture.detectChanges();

    expect(aiApiMock.chat).toHaveBeenCalledTimes(1);
    expect(aiApiMock.chat).toHaveBeenLastCalledWith({
      message: 'Explain the difference between "affect" and "effect" with simple examples.',
      history: [],
      languageCode: 'en',
    });
    expect(el.querySelector('.oq-markdown h3')?.textContent).toBe('Quick Tip');
    expect(el.querySelector('.oq-markdown strong')?.textContent).toBe('Affect');
    expect(el.textContent).toContain('Affect is usually a verb, while effect is usually a noun.');
    expect(el.textContent).toContain('35 tokens');

    const textarea = el.querySelector<HTMLTextAreaElement>('#ai-composer-input')!;
    textarea.value = 'Give me one example sentence';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitBtn = el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    expect(submitBtn.disabled).toBe(false);
    submitBtn.click();
    fixture.detectChanges();

    expect(aiApiMock.chat).toHaveBeenCalledTimes(2);
    expect(aiApiMock.chat).toHaveBeenLastCalledWith({
      message: 'Give me one example sentence',
      history: [
        {
          role: 'user',
          content: 'Explain the difference between "affect" and "effect" with simple examples.',
        },
        {
          role: 'assistant',
          content:
            '### Quick Tip\n**Affect** is usually a verb, while **effect** is usually a noun.',
        },
      ],
      languageCode: 'en',
    });
    expect(el.textContent).toContain('Example: The weather affected our plans.');

    const clearBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Clear chat'),
    );
    clearBtn?.click();
    fixture.detectChanges();

    expect(el.querySelectorAll('.ai-msg').length).toBe(0);
    expect(el.textContent).toContain('Start a conversation with your English tutor');
  });

  it('rolls back failed turn, restores draft, and retries cleanly on error', () => {
    aiApiMock.getStatus.mockReturnValue(of({ enabled: true, model: 'llama-3.1-8b-instant' }));
    aiApiMock.chat
      .mockReturnValueOnce(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 429,
              error: { message: 'Too Many Requests' },
            }),
        ),
      )
      .mockReturnValueOnce(
        of({
          model: 'llama-3.1-8b-instant',
          content: 'Recovered response!',
        }),
      );

    const fixture = TestBed.createComponent(AiTutorComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const textarea = el.querySelector<HTMLTextAreaElement>('#ai-composer-input')!;
    textarea.value = 'How do I use albeit?';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(el.querySelectorAll('.ai-msg').length).toBe(0);
    expect(textarea.value).toBe('How do I use albeit?');
    expect(el.textContent).toContain('Too Many Requests');

    const retryBtn = el.querySelector<HTMLButtonElement>('.oq-inline-retry');
    retryBtn?.click();
    fixture.detectChanges();

    expect(aiApiMock.chat).toHaveBeenCalledTimes(2);
    expect(aiApiMock.chat).toHaveBeenLastCalledWith({
      message: 'How do I use albeit?',
      history: [],
      languageCode: 'en',
    });
    expect(el.textContent).toContain('Recovered response!');
    expect(textarea.value).toBe('');
  });

  it('switches cleanly to the Guided Conversation mode tab', () => {
    aiApiMock.getStatus.mockReturnValue(of({ enabled: true, model: 'qwen/qwen3.8-27b' }));
    const fixture = TestBed.createComponent(AiTutorComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const guidedTab = Array.from(el.querySelectorAll<HTMLButtonElement>('.ai-mode-tab')).find((b) =>
      b.textContent?.includes('Conversation Practice'),
    );
    expect(guidedTab).toBeTruthy();
  });

  it('switches to Korean starter prompts and forwards languageCode ko when course toggles', () => {
    aiApiMock.getStatus.mockReturnValue(of({ enabled: true, model: 'qwen/qwen3.8-27b' }));
    aiApiMock.chat.mockReturnValue(
      of({
        model: 'qwen/qwen3.8-27b',
        content: '은/는 marks the topic while 이/가 marks the subject.',
      }),
    );

    const learningLang = TestBed.inject(LearningLanguageService);
    const fixture = TestBed.createComponent(AiTutorComponent);
    fixture.detectChanges();

    learningLang.setLanguage('ko');
    TestBed.flushEffects();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('AI Korean Tutor');
    expect(el.textContent).toContain('은/는 vs 이/가 particles');

    el.querySelector<HTMLButtonElement>('.ai-starter')?.click();
    fixture.detectChanges();

    expect(aiApiMock.chat).toHaveBeenCalledWith({
      message:
        'Explain the difference between topic particle 은/는 and subject particle 이/가 with simple Korean examples.',
      history: [],
      languageCode: 'ko',
    });
  });
});
