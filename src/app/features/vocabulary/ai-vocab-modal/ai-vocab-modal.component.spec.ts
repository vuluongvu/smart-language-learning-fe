import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AiVocabModalComponent } from './ai-vocab-modal.component';

describe('AiVocabModalComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AiVocabModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('generates AI vocabulary drafts, leaves duplicates unchecked, and bulk-saves selected items with source=ai', () => {
    const fixture = TestBed.createComponent(AiVocabModalComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('topics', [
      {
        id: 2,
        name: 'Environment',
        description: null,
        languageId: 1,
        vocabularyCount: 0,
        createdAt: '2026-11-16T00:00:00.000Z',
        updatedAt: '2026-11-16T00:00:00.000Z',
      },
    ]);
    fixture.componentRef.setInput('defaultTopicId', 2);

    let savedCount = 0;
    fixture.componentInstance.saved.subscribe((res) => {
      savedCount = res.createdCount;
    });
    fixture.detectChanges();

    fixture.componentInstance['prompt'] = 'Renewable energy';
    fixture.componentInstance.generate();

    const genReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/ai/generate') && r.method === 'POST',
    );
    expect(genReq.request.body).toEqual({
      prompt: 'Renewable energy',
      mode: 'topic',
      level: 'B1',
      count: 5,
      topicId: 2,
    });
    genReq.flush({
      data: {
        model: 'qwen/qwen3.8-27b',
        items: [
          {
            term: 'sustainable',
            pronunciation: '/səˈsteɪnəbl/',
            partOfSpeech: 'adjective',
            definition: 'Bền vững',
            example: 'Sustainable energy protects nature.',
            notes: null,
            alreadyExists: false,
          },
          {
            term: 'emission',
            pronunciation: '/ɪˈmɪʃn/',
            partOfSpeech: 'noun',
            definition: 'Khí thải',
            example: 'Reduce carbon emissions.',
            notes: null,
            alreadyExists: true,
          },
        ],
      },
    });
    fixture.detectChanges();

    const drafts = fixture.componentInstance['drafts']();
    expect(drafts).toHaveLength(2);
    expect(drafts[0].selected).toBe(true);
    expect(drafts[1].selected).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Already in bank');

    fixture.componentInstance.saveSelected();

    const bulkReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/bulk') && r.method === 'POST',
    );
    expect(bulkReq.request.body).toEqual({
      topicIds: [2],
      items: [
        {
          term: 'sustainable',
          pronunciation: '/səˈsteɪnəbl/',
          partOfSpeech: 'adjective',
          definition: 'Bền vững',
          example: 'Sustainable energy protects nature.',
          notes: null,
          source: 'ai',
        },
      ],
    });
    bulkReq.flush({
      data: {
        createdCount: 1,
        createdTopic: null,
        items: [
          {
            id: 90,
            languageId: 1,
            term: 'sustainable',
            pronunciation: '/səˈsteɪnəbl/',
            partOfSpeech: 'adjective',
            definition: 'Bền vững',
            example: 'Sustainable energy protects nature.',
            notes: null,
            source: 'ai',
            topics: [{ id: 2, name: 'Environment' }],
            duplicateWarning: false,
            existingMatchCount: 0,
            createdAt: '2026-11-18T00:00:00.000Z',
            updatedAt: '2026-11-18T00:00:00.000Z',
          },
        ],
      },
    });

    expect(savedCount).toBe(1);
  });

  it('auto-assigns matching existing topic or pre-fills newTopicName from typed topic prompt', () => {
    const fixture = TestBed.createComponent(AiVocabModalComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('topics', [
      {
        id: 2,
        name: 'Environment',
        description: null,
        languageId: 1,
        vocabularyCount: 0,
        createdAt: '2026-11-16T00:00:00.000Z',
        updatedAt: '2026-11-16T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    // Case 1: typed topic doesn't exist yet -> auto-fills newTopicName and sends it on save
    fixture.componentInstance['prompt'] = 'Công nghệ';
    fixture.componentInstance.generate();

    const genReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/ai/generate') && r.method === 'POST',
    );
    genReq.flush({
      data: {
        model: 'qwen/qwen3.8-27b',
        items: [
          {
            term: 'algorithm',
            pronunciation: '/ˈælɡərɪðəm/',
            partOfSpeech: 'noun',
            definition: 'Thuật toán',
            example: 'The search algorithm sorts results quickly.',
            notes: null,
            alreadyExists: false,
          },
        ],
      },
    });
    fixture.detectChanges();

    expect(fixture.componentInstance['newTopicName']).toBe('Công nghệ');

    fixture.componentInstance.saveSelected();
    const bulkReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/bulk') && r.method === 'POST',
    );
    expect(bulkReq.request.body).toEqual({
      topicIds: [],
      newTopicName: 'Công nghệ',
      items: [
        {
          term: 'algorithm',
          pronunciation: '/ˈælɡərɪðəm/',
          partOfSpeech: 'noun',
          definition: 'Thuật toán',
          example: 'The search algorithm sorts results quickly.',
          notes: null,
          source: 'ai',
        },
      ],
    });
    bulkReq.flush({
      data: {
        createdCount: 1,
        createdTopic: { id: 9, name: 'Công nghệ' },
        items: [],
      },
    });
  });

  it('validates image selection, uploads FormData to /vocabulary/ai/extract-image, applies suggestedTopic, and saves drafts', async () => {
    const fixture = TestBed.createComponent(AiVocabModalComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('initialMode', 'image');
    fixture.componentRef.setInput('topics', [
      {
        id: 2,
        name: 'Environment',
        description: null,
        languageId: 1,
        vocabularyCount: 0,
        createdAt: '2026-11-16T00:00:00.000Z',
        updatedAt: '2026-11-16T00:00:00.000Z',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance['mode']).toBe('image');
    expect(fixture.componentInstance['count']).toBe(8);

    // Submitting without an image shows validation error and fires no request
    fixture.componentInstance.generate();
    expect(fixture.componentInstance['errorMessage']()).toContain('image');

    // Invalid file type is rejected
    const badFile = new File(['hello'], 'notes.pdf', { type: 'application/pdf' });
    await fixture.componentInstance['handleImageFile'](badFile);
    expect(fixture.componentInstance['errorMessage']()).toContain('Unsupported image format');
    expect(fixture.componentInstance['selectedImage']()).toBeNull();

    // Valid PNG file uploads as multipart FormData
    const pngFile = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'vocab-page.png', {
      type: 'image/png',
    });
    await fixture.componentInstance['handleImageFile'](pngFile);
    expect(fixture.componentInstance['selectedImage']()).toBe(pngFile);

    fixture.componentInstance['prompt'] = 'Academic verbs';
    fixture.componentInstance.generate();

    const extractReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/ai/extract-image') && r.method === 'POST',
    );
    expect(extractReq.request.body instanceof FormData).toBe(true);
    const body = extractReq.request.body as FormData;
    const uploadedImage = body.get('image');
    expect(uploadedImage).toBeInstanceOf(File);
    expect((uploadedImage as File).name).toBe('vocab-page.png');
    expect((uploadedImage as File).type).toBe('image/png');
    expect((uploadedImage as File).size).toBe(4);
    expect(body.get('prompt')).toBe('Academic verbs');
    expect(body.get('level')).toBe('B1');
    expect(body.get('count')).toBe('8');

    extractReq.flush({
      data: {
        model: 'qwen/qwen3.8-27b',
        suggestedTopic: 'IELTS Reading',
        items: [
          {
            term: 'mitigate',
            pronunciation: '/ˈmɪtɪɡeɪt/',
            partOfSpeech: 'verb',
            definition: 'Giảm nhẹ, làm dịu bớt',
            example: 'New policies aim to mitigate climate risks.',
            notes: null,
            alreadyExists: false,
          },
        ],
      },
    });
    fixture.detectChanges();

    expect(fixture.componentInstance['newTopicName']).toBe('IELTS Reading');
    expect(fixture.componentInstance['drafts']()).toHaveLength(1);

    fixture.componentInstance.saveSelected();
    const bulkReq = httpTesting.expectOne(
      (r) => r.url.endsWith('/vocabulary/bulk') && r.method === 'POST',
    );
    expect(bulkReq.request.body).toEqual({
      topicIds: [],
      newTopicName: 'IELTS Reading',
      items: [
        {
          term: 'mitigate',
          pronunciation: '/ˈmɪtɪɡeɪt/',
          partOfSpeech: 'verb',
          definition: 'Giảm nhẹ, làm dịu bớt',
          example: 'New policies aim to mitigate climate risks.',
          notes: null,
          source: 'ai',
        },
      ],
    });
    bulkReq.flush({
      data: {
        createdCount: 1,
        createdTopic: { id: 12, name: 'IELTS Reading' },
        items: [],
      },
    });
  });
});
