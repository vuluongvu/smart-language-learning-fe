import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { QuizzesListComponent } from './quizzes-list.component';

describe('QuizzesListComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizzesListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads topics and renders quiz summaries with resume and take actions', () => {
    const fixture = TestBed.createComponent(QuizzesListComponent);
    fixture.detectChanges();

    const topicsReq = httpTesting.expectOne((r) => r.url.endsWith('/topics') && r.method === 'GET');
    topicsReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
      },
    });

    const quizzesReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/quizzes') && r.method === 'GET',
    );
    quizzesReq.flush({
      data: {
        items: [
          {
            id: 7,
            title: 'Travel Essentials',
            description: 'Airport and hotel phrases',
            topicId: 3,
            topicName: 'Travel',
            difficulty: 'easy',
            status: 'published',
            questionCount: 5,
            attemptCount: 2,
            inProgressAttemptId: 19,
            lastScore: 80,
            createdAt: '2026-11-16T00:00:00.000Z',
            updatedAt: '2026-11-16T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
      },
    });

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Travel Essentials');
    expect(text).toContain('5 questions');
    expect(text).toContain('Last score: 80%');
    expect(text).toContain('Resume Attempt');
  });
});
