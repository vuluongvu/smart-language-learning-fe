import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VocabularyListComponent } from './vocabulary-list.component';

describe('VocabularyListComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialLoad() {
    const topicsReq = httpTesting.expectOne((r) => r.url.endsWith('/topics') && r.method === 'GET');
    topicsReq.flush({
      data: {
        items: [
          {
            id: 1,
            userId: 1,
            languageId: 1,
            name: 'Daily',
            description: null,
            vocabularyCount: 1,
            createdAt: '2026-11-16T00:00:00.000Z',
            updatedAt: '2026-11-16T00:00:00.000Z',
          },
          {
            id: 2,
            userId: 1,
            languageId: 1,
            name: 'Academic',
            description: null,
            vocabularyCount: 0,
            createdAt: '2026-11-16T00:00:00.000Z',
            updatedAt: '2026-11-16T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
      },
    });

    const dueReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/flashcards/due') && r.method === 'GET',
    );
    dueReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 1, total: 1, totalPages: 1 },
        summary: {
          totalCount: 1,
          dueCount: 0,
          newCount: 1,
          learningCount: 0,
          masteredCount: 0,
          hardCount: 0,
        },
      },
    });

    const vocabReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary') && r.method === 'GET',
    );
    vocabReq.flush({
      data: {
        items: [
          {
            id: 50,
            userId: 1,
            languageId: 1,
            term: 'resilient',
            normalizedTerm: 'resilient',
            pronunciation: '/rɪˈzɪliənt/',
            partOfSpeech: 'adjective',
            definition: 'able to recover quickly from difficulties',
            example: 'She stayed resilient throughout the project.',
            notes: null,
            reviewCount: 0,
            correctCount: 0,
            masteryScore: 0,
            lastReviewedAt: null,
            topics: [{ id: 1, name: 'Daily' }],
            createdAt: '2026-11-16T00:00:00.000Z',
            updatedAt: '2026-11-16T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
      },
    });
  }

  it('renders vocabulary items with colorful status, part-of-speech, and topic tags plus KPI cards', () => {
    const fixture = TestBed.createComponent(VocabularyListComponent);
    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent ?? '';
    expect(text).toContain('resilient');
    expect(text).toContain('able to recover quickly from difficulties');
    expect(text).toContain('Daily');
    expect(text).toContain('Total Vocabulary');
    expect(text).toContain('Due Today');
    expect(el.querySelectorAll('oq-stat-card').length).toBe(4);
    expect(el.querySelector('.pos-badge.oq-badge--cream')?.textContent?.trim()).toBe('adjective');
    expect(el.querySelector('.vocab-table .oq-badge--lavender')?.textContent?.trim()).toBe('New');
    expect(el.querySelector('.topic-filter-badge.oq-badge--lavender')?.textContent?.trim()).toBe(
      'Daily',
    );
  });

  it('filters vocabulary via quick status pills and resets active filters', () => {
    const fixture = TestBed.createComponent(VocabularyListComponent);
    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const duePill = Array.from(el.querySelectorAll<HTMLButtonElement>('.status-pill')).find((btn) =>
      btn.textContent?.includes('Due'),
    );
    expect(duePill).toBeTruthy();
    duePill?.click();

    const filteredReq = httpTesting.expectOne(
      (r) =>
        r.url.endsWith('/vocabulary') &&
        r.method === 'GET' &&
        r.params.get('reviewStatus') === 'due',
    );
    filteredReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      },
    });
    fixture.detectChanges();

    expect(duePill?.classList.contains('oq-pill--cream')).toBe(true);
    expect(duePill?.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows non-blocking duplicate warning on blur and submits multi-topic creation', () => {
    const fixture = TestBed.createComponent(VocabularyListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    component.openCreate();
    component['form'].patchValue({
      term: 'resilient',
      definition: 'tough and adaptable',
    });
    component.onTermBlur();

    const dupReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/check-duplicate') && r.params.get('term') === 'resilient',
    );
    expect(dupReq.request.method).toBe('GET');
    dupReq.flush({
      data: {
        exists: true,
        count: 1,
        matches: [
          {
            id: 50,
            term: 'resilient',
            partOfSpeech: 'adjective',
            definition: 'able to recover quickly from difficulties',
          },
        ],
      },
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('already exists');

    component.toggleTopicSelection(1);
    component.toggleTopicSelection(2);
    component.saveVocabulary();

    const createReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary') && r.method === 'POST',
    );
    expect(createReq.request.body).toMatchObject({
      term: 'resilient',
      definition: 'tough and adaptable',
      topicIds: [1, 2],
    });
    createReq.flush({
      data: {
        id: 51,
        userId: 1,
        languageId: 1,
        term: 'resilient',
        normalizedTerm: 'resilient',
        pronunciation: null,
        partOfSpeech: null,
        definition: 'tough and adaptable',
        example: null,
        notes: null,
        reviewCount: 0,
        correctCount: 0,
        masteryScore: 0,
        lastReviewedAt: null,
        topics: [
          { id: 1, name: 'Daily' },
          { id: 2, name: 'Academic' },
        ],
        duplicateWarning: true,
        existingMatchCount: 1,
        createdAt: '2026-11-16T00:00:00.000Z',
        updatedAt: '2026-11-16T00:00:00.000Z',
      },
    });

    const reloadDueReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/flashcards/due') && r.method === 'GET',
    );
    reloadDueReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 1, total: 2, totalPages: 1 },
        summary: {
          totalCount: 2,
          dueCount: 0,
          newCount: 2,
          learningCount: 0,
          masteredCount: 0,
          hardCount: 0,
        },
      },
    });

    const reloadReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary') && r.method === 'GET',
    );
    reloadReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      },
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Added "resilient" (note: 1 existing item(s) share this term).',
    );
  });

  it('auto-fills vocabulary form via AI and submits with source=ai', () => {
    const fixture = TestBed.createComponent(VocabularyListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    flushInitialLoad();
    fixture.detectChanges();

    component.openCreate();
    component['form'].patchValue({ term: 'mitigate' });
    component.enrichWithAi();

    const enrichReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/ai/enrich') && r.method === 'POST',
    );
    expect(enrichReq.request.body).toEqual({ term: 'mitigate' });
    enrichReq.flush({
      data: {
        model: 'qwen/qwen3.8-27b',
        item: {
          term: 'mitigate',
          pronunciation: '/ˈmɪtɪɡeɪt/',
          partOfSpeech: 'verb',
          definition: 'Giảm nhẹ, làm dịu bớt',
          example: 'Planting trees helps mitigate climate change.',
          notes: 'Thường đi với risk, impact.',
          alreadyExists: false,
          existingMatchCount: 0,
        },
      },
    });
    fixture.detectChanges();

    expect(component['form'].controls.definition.value).toBe('Giảm nhẹ, làm dịu bớt');
    expect(component['form'].controls.pronunciation.value).toBe('/ˈmɪtɪɡeɪt/');

    component.saveVocabulary();
    const createReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary') && r.method === 'POST',
    );
    expect(createReq.request.body).toMatchObject({
      term: 'mitigate',
      pronunciation: '/ˈmɪtɪɡeɪt/',
      partOfSpeech: 'verb',
      definition: 'Giảm nhẹ, làm dịu bớt',
      source: 'ai',
    });
    createReq.flush({
      data: {
        id: 52,
        languageId: 1,
        term: 'mitigate',
        pronunciation: '/ˈmɪtɪɡeɪt/',
        partOfSpeech: 'verb',
        definition: 'Giảm nhẹ, làm dịu bớt',
        example: 'Planting trees helps mitigate climate change.',
        notes: 'Thường đi với risk, impact.',
        source: 'ai',
        topics: [],
        duplicateWarning: false,
        existingMatchCount: 0,
        createdAt: '2026-11-18T00:00:00.000Z',
        updatedAt: '2026-11-18T00:00:00.000Z',
      },
    });

    const reloadDueReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/flashcards/due') && r.method === 'GET',
    );
    reloadDueReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 1, total: 2, totalPages: 1 },
        summary: {
          totalCount: 2,
          dueCount: 0,
          newCount: 2,
          learningCount: 0,
          masteredCount: 0,
          hardCount: 0,
        },
      },
    });

    const reloadReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary') && r.method === 'GET',
    );
    reloadReq.flush({
      data: { items: [], meta: { page: 1, limit: 12, total: 0, totalPages: 1 } },
    });
  });
});
