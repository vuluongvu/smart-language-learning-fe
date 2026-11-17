import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { QuizPlayerComponent } from './quiz-player.component';

describe('QuizPlayerComponent', () => {
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPlayerComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '7' }),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('starts attempt, captures MCQ + Fill Blank answers, and submits to result route', () => {
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(QuizPlayerComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const startReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/quizzes/7/attempts') && r.method === 'POST',
    );
    startReq.flush({
      data: {
        id: 88,
        quizId: 7,
        quizTitle: 'Mixed Quiz',
        status: 'in_progress',
        score: 0,
        correctCount: 0,
        totalQuestions: 2,
        startedAt: '2026-11-16T00:00:00.000Z',
        completedAt: null,
        questions: [
          {
            id: 1,
            questionText: 'Pick the correct word',
            questionType: 'multiple_choice',
            orderIndex: 0,
            options: [
              { id: 10, optionText: 'pragmatic', orderIndex: 0 },
              { id: 11, optionText: 'vague', orderIndex: 1 },
            ],
            savedSelectedOptionId: null,
            savedAnswerText: null,
          },
          {
            id: 2,
            questionText: 'Type missing word: _____ effort.',
            questionType: 'fill_blank',
            orderIndex: 1,
            options: [],
            savedSelectedOptionId: null,
            savedAnswerText: null,
          },
        ],
        answers: [],
      },
    });

    fixture.detectChanges();
    component.selectOption(1, 10);
    component.goToQuestion(1);

    const progressReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/attempts/88/progress') && r.method === 'PATCH',
    );
    progressReq.flush({
      data: {
        id: 88,
        quizId: 7,
        quizTitle: 'Mixed Quiz',
        status: 'in_progress',
        score: 0,
        correctCount: 0,
        totalQuestions: 2,
        startedAt: '2026-11-16T00:00:00.000Z',
        completedAt: null,
        questions: [],
        answers: [],
      },
    });

    fixture.detectChanges();
    component.updateBlankText(2, 'concerted');
    component.requestSubmit();

    const submitReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/attempts/88/submit') && r.method === 'POST',
    );
    expect(submitReq.request.body).toEqual({
      answers: [
        { questionId: 1, selectedOptionId: 10 },
        { questionId: 2, answerText: 'concerted' },
      ],
    });
    submitReq.flush({
      data: {
        id: 88,
        quizId: 7,
        quizTitle: 'Mixed Quiz',
        status: 'completed',
        score: 100,
        correctCount: 2,
        totalQuestions: 2,
        startedAt: '2026-11-16T00:00:00.000Z',
        completedAt: '2026-11-16T00:02:00.000Z',
        questions: [],
        answers: [],
      },
    });

    expect(navSpy).toHaveBeenCalledWith(['/attempts', 88]);
  });
});
