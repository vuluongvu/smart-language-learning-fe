import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { QuizResultComponent } from './quiz-result.component';

describe('QuizResultComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizResultComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ attemptId: '42' }),
            },
          },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders graded breakdown and saves vocabulary from quiz question into new topic', () => {
    const fixture = TestBed.createComponent(QuizResultComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const topicsReq = httpTesting.expectOne((r) => r.url.endsWith('/topics') && r.method === 'GET');
    topicsReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
      },
    });

    const attemptReq = httpTesting.expectOne((r) => r.url.endsWith('/attempts/42'));
    attemptReq.flush({
      data: {
        id: 42,
        quizId: 7,
        quizTitle: 'Phase 3 Quiz',
        status: 'completed',
        score: 100,
        correctCount: 1,
        totalQuestions: 1,
        startedAt: '2026-11-16T00:00:00.000Z',
        completedAt: '2026-11-16T00:05:00.000Z',
        questions: [],
        answers: [
          {
            id: 500,
            questionId: 9,
            questionText: 'Select the meaning of "mitigate"',
            questionType: 'word_meaning',
            selectedOptionId: 88,
            answerText: 'make less severe',
            correctAnswer: 'make less severe',
            explanation: 'Common formal verb',
            vocabularyId: null,
            vocabularyTerm: 'mitigate',
            isCorrect: true,
            answeredAt: '2026-11-16T00:05:00.000Z',
          },
        ],
      },
    });

    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('100%');

    component.openSaveVocab({
      id: 500,
      questionId: 9,
      questionText: 'Select the meaning of "mitigate"',
      questionType: 'word_meaning',
      selectedOptionId: 88,
      answerText: 'make less severe',
      correctAnswer: 'make less severe',
      explanation: 'Common formal verb',
      vocabularyId: null,
      vocabularyTerm: 'mitigate',
      isCorrect: true,
      answeredAt: '2026-11-16T00:05:00.000Z',
    });

    const dupReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/check-duplicate') && r.params.get('term') === 'mitigate',
    );
    dupReq.flush({ data: { exists: false, matches: [] } });
    fixture.detectChanges();

    component['newTopicName'] = 'Quiz Review';
    component.saveNewVocabItem(500);

    const saveReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/quizzes/save-vocabulary') && r.method === 'POST',
    );
    expect(saveReq.request.body).toMatchObject({
      term: 'mitigate',
      definition: 'make less severe',
      newTopicName: 'Quiz Review',
    });
    saveReq.flush({
      data: {
        createdNewItem: true,
        createdTopicId: 12,
        item: {
          id: 90,
          languageId: 1,
          term: 'mitigate',
          pronunciation: null,
          partOfSpeech: null,
          definition: 'make less severe',
          example: null,
          notes: null,
          source: 'quiz',
          topics: [{ id: 12, name: 'Quiz Review' }],
          createdAt: '2026-11-16T00:06:00.000Z',
          updatedAt: '2026-11-16T00:06:00.000Z',
        },
      },
    });

    const reloadTopicsReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/topics') && r.method === 'GET',
    );
    reloadTopicsReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 1 },
      },
    });

    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Saved "mitigate" to your Vocabulary Bank.',
    );
  });
});
