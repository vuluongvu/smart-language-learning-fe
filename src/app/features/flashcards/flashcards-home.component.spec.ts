import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FlashcardsHomeComponent } from './flashcards-home.component';

describe('FlashcardsHomeComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardsHomeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads due queue summary, preview cards, and recent sessions', () => {
    const fixture = TestBed.createComponent(FlashcardsHomeComponent);
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url.endsWith('/topics') && r.method === 'GET')
      .flush({
        data: {
          items: [
            {
              id: 3,
              name: 'Travel',
              description: null,
              languageId: 1,
              vocabularyCount: 2,
              createdAt: '2026-11-15T00:00:00Z',
              updatedAt: '2026-11-15T00:00:00Z',
            },
          ],
          meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
        },
      });

    httpTesting
      .expectOne((r) => r.url.endsWith('/flashcards/due') && r.method === 'GET')
      .flush({
        data: {
          summary: {
            totalCount: 6,
            dueCount: 2,
            newCount: 3,
            learningCount: 2,
            masteredCount: 1,
            hardCount: 1,
          },
          items: [
            {
              id: 101,
              term: 'itinerary',
              pronunciation: '/aɪˈtɪnəreri/',
              partOfSpeech: 'noun',
              definition: 'a planned route or journey',
              example: 'Check our travel itinerary.',
              notes: null,
              topics: [{ id: 3, name: 'Travel' }],
              progress: {
                status: 'learning',
                repetitions: 1,
                intervalDays: 1,
                easeFactor: 2.5,
                lastRating: 'hard',
                lastReviewedAt: '2026-11-14T10:00:00Z',
                nextReviewAt: '2026-11-15T10:00:00Z',
                isDue: true,
              },
              sessionLastRating: null,
              sessionReviewCount: 0,
            },
          ],
          meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
        },
      });

    httpTesting
      .expectOne((r) => r.url.endsWith('/flashcard-sessions') && r.method === 'GET')
      .flush({
        data: {
          items: [
            {
              id: 8,
              topicId: 3,
              topicName: 'Travel',
              mode: 'due_and_new',
              targetCount: 5,
              reviewedCount: 5,
              streakMinThreshold: 5,
              isStreakEligible: true,
              status: 'completed',
              startedAt: '2026-11-15T09:00:00Z',
              completedAt: '2026-11-15T09:05:00Z',
            },
          ],
          meta: { page: 1, limit: 8, total: 1, totalPages: 1 },
        },
      });

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('itinerary');
    expect(text).toContain('Practice Hard Cards (1)');
    expect(text).toContain('Streak eligible');
  });
});
