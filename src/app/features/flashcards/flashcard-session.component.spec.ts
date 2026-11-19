import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FlashcardSessionComponent } from './flashcard-session.component';

describe('FlashcardSessionComponent', () => {
  let httpTesting: HttpTestingController;

  const sessionPayload = {
    id: 42,
    topicId: 3,
    topicName: 'Travel',
    mode: 'due_and_new',
    targetCount: 2,
    reviewedCount: 0,
    streakMinThreshold: 2,
    isStreakEligible: false,
    status: 'in_progress',
    startedAt: '2026-11-16T00:00:00Z',
    completedAt: null,
    breakdown: { again: 0, hard: 0, good: 0, easy: 0 },
    forgottenVocabularyIds: [],
    cards: [
      {
        id: 101,
        term: 'itinerary',
        pronunciation: '/aɪˈtɪnəreri/',
        partOfSpeech: 'noun',
        definition: 'a planned route or journey',
        example: 'Our itinerary includes Kyoto.',
        notes: 'Common travel noun',
        topics: [{ id: 3, name: 'Travel' }],
        progress: {
          status: 'new',
          repetitions: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          lastRating: null,
          lastReviewedAt: null,
          nextReviewAt: null,
          isDue: false,
        },
        sessionLastRating: null,
        sessionReviewCount: 0,
      },
      {
        id: 102,
        term: 'layover',
        pronunciation: null,
        partOfSpeech: 'noun',
        definition: 'short stop between connecting flights',
        example: null,
        notes: null,
        topics: [{ id: 3, name: 'Travel' }],
        progress: {
          status: 'new',
          repetitions: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          lastRating: null,
          lastReviewedAt: null,
          nextReviewAt: null,
          isDue: false,
        },
        sessionLastRating: null,
        sessionReviewCount: 0,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardSessionComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '42' })),
          },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads session, flips card to reveal definition and ratings, records rating, and completes session', () => {
    const fixture = TestBed.createComponent(FlashcardSessionComponent);
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url.endsWith('/flashcard-sessions/42') && r.method === 'GET')
      .flush({ data: sessionPayload });

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('itinerary');
    expect(el.textContent).not.toContain('a planned route or journey');

    const cardButton = el.querySelector('.flashcard-stage') as HTMLButtonElement | null;
    expect(cardButton).not.toBeNull();
    expect(el.querySelector('.flashcard-flipper--flipped')).toBeNull();
    expect(cardButton?.getAttribute('aria-pressed')).toBe('false');
    cardButton?.click();
    fixture.detectChanges();

    expect(el.querySelector('.flashcard-flipper--flipped')).not.toBeNull();
    expect(cardButton?.getAttribute('aria-pressed')).toBe('true');
    expect(el.textContent).toContain('a planned route or journey');
    expect(el.textContent).toContain('Good');

    // Flipping back to front removes flipped state smoothly
    cardButton?.click();
    fixture.detectChanges();
    expect(el.querySelector('.flashcard-flipper--flipped')).toBeNull();
    expect(cardButton?.getAttribute('aria-pressed')).toBe('false');

    // Flip back to reveal ratings and record rating
    cardButton?.click();
    fixture.detectChanges();
    expect(el.querySelector('.flashcard-flipper--flipped')).not.toBeNull();

    const rateButtons = Array.from(el.querySelectorAll('.rate-btn')) as HTMLButtonElement[];
    const againBtn = rateButtons.find((b) => b.textContent?.includes('Again'));
    againBtn?.click();

    const reviewReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/flashcard-sessions/42/reviews') && r.method === 'POST',
    );
    expect(reviewReq.request.body).toEqual({
      vocabularyId: 101,
      rating: 'again',
    });

    reviewReq.flush({
      data: {
        updatedProgress: {
          status: 'learning',
          repetitions: 0,
          intervalDays: 0,
          easeFactor: 2.3,
          lastRating: 'again',
          lastReviewedAt: '2026-11-16T00:01:00Z',
          nextReviewAt: '2026-11-16T00:11:00Z',
          isDue: true,
        },
        session: {
          ...sessionPayload,
          reviewedCount: 1,
          breakdown: { again: 1, hard: 0, good: 0, easy: 0 },
          forgottenVocabularyIds: [101],
          cards: [
            {
              ...sessionPayload.cards[0],
              sessionLastRating: 'again',
              sessionReviewCount: 1,
            },
            sessionPayload.cards[1],
          ],
        },
      },
    });

    fixture.detectChanges();
    expect(el.textContent).toContain('layover');
    expect(el.textContent).toContain('Saved "itinerary" as Again');

    const finishBtn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Finish Session'),
    );
    finishBtn?.click();

    httpTesting
      .expectOne((r) => r.url.endsWith('/flashcard-sessions/42/complete') && r.method === 'POST')
      .flush({
        data: {
          ...sessionPayload,
          status: 'completed',
          reviewedCount: 1,
          isStreakEligible: false,
          completedAt: '2026-11-16T00:02:00Z',
          breakdown: { again: 1, hard: 0, good: 0, easy: 0 },
          forgottenVocabularyIds: [101],
        },
      });

    fixture.detectChanges();
    expect(el.textContent).toContain('Session Complete');
    expect(el.textContent).toContain('Practice Forgotten Cards Again');
  });

  it('allows toggling the inline Hangul handwriting drawer for Korean cards', () => {
    const fixture = TestBed.createComponent(FlashcardSessionComponent);
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url.endsWith('/flashcard-sessions/42') && r.method === 'GET')
      .flush({
        data: {
          ...sessionPayload,
          languageCode: 'ko',
          cards: [
            {
              ...sessionPayload.cards[0],
              term: '한국어',
              definition: 'tiếng Hàn',
            },
          ],
        },
      });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const toggleBtn = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Write on Screen'),
    );
    expect(toggleBtn).toBeTruthy();

    toggleBtn!.click();
    fixture.detectChanges();

    expect(el.querySelector('oq-hangul-pad')).toBeTruthy();
    expect(el.textContent).toContain('Hide Writing Pad');
  });
});
