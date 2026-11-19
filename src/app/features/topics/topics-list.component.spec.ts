import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TopicsListComponent } from './topics-list.component';

describe('TopicsListComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicsListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads and renders topics from the backend API', () => {
    const fixture = TestBed.createComponent(TopicsListComponent);
    fixture.detectChanges();

    const req = httpTesting.expectOne(
      (r) =>
        r.url.endsWith('/topics') && r.params.get('page') === '1' && r.params.get('limit') === '12',
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      data: {
        items: [
          {
            id: 10,
            userId: 1,
            languageId: 1,
            name: 'Business English',
            description: 'Work and meetings',
            vocabularyCount: 4,
            createdAt: '2026-11-16T00:00:00.000Z',
            updatedAt: '2026-11-16T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
      },
    });

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Business English');
    expect(text).toContain('4 items');
  });

  it('creates a topic and reloads the topic list', () => {
    const fixture = TestBed.createComponent(TopicsListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const initialReq = httpTesting.expectOne((r) => r.url.endsWith('/topics'));
    initialReq.flush({
      data: {
        items: [],
        meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      },
    });
    fixture.detectChanges();

    component.openCreate();
    component['form'].setValue({
      name: 'Travel',
      description: 'Airport and hotel phrases',
    });
    component.saveTopic();

    const postReq = httpTesting.expectOne((r) => r.url.endsWith('/topics'));
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({
      name: 'Travel',
      description: 'Airport and hotel phrases',
      languageCode: 'en',
    });
    postReq.flush({
      data: {
        id: 11,
        userId: 1,
        languageId: 1,
        name: 'Travel',
        description: 'Airport and hotel phrases',
        vocabularyCount: 0,
        createdAt: '2026-11-16T00:00:00.000Z',
        updatedAt: '2026-11-16T00:00:00.000Z',
      },
    });

    const reloadReq = httpTesting.expectOne((r) => r.url.endsWith('/topics') && r.method === 'GET');
    reloadReq.flush({
      data: {
        items: [
          {
            id: 11,
            userId: 1,
            languageId: 1,
            name: 'Travel',
            description: 'Airport and hotel phrases',
            vocabularyCount: 0,
            createdAt: '2026-11-16T00:00:00.000Z',
            updatedAt: '2026-11-16T00:00:00.000Z',
          },
        ],
        meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
      },
    });

    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Topic created successfully.');
    expect(text).toContain('Travel');
  });
});
