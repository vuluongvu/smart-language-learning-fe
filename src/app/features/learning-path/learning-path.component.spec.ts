import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AiApiService } from '../ai-tutor/ai-api.service';
import { AuthService } from '../auth/auth.service';
import { LearningPathApiService } from './learning-path-api.service';
import { LP_EN_TRANSLATIONS, LP_VI_TRANSLATIONS } from './learning-path.i18n';
import { LearningPathComponent } from './learning-path.component';

describe('LearningPathComponent', () => {
  let pathApiMock: {
    getOverview: ReturnType<typeof vi.fn>;
    updateGoal: ReturnType<typeof vi.fn>;
    generateAiPath: ReturnType<typeof vi.fn>;
    deleteAiTrack: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    localStorage.removeItem('argon_learning_course');
    pathApiMock = {
      getOverview: vi.fn().mockReturnValue(
        of({
          goal: {
            learningGoalBand: 'band_45_55',
            currentLevel: 'B1',
            dailyGoalMinutes: 15,
          },
          tracks: [
            {
              id: 1,
              code: 'band_45_55',
              title: 'Band 4.5–5.5',
              cefrLevel: 'B1',
              languageCode: 'en',
              summary: 'Foundation everyday path',
              isAiGenerated: false,
            },
            {
              id: 2,
              code: 'band_55_65',
              title: 'Band 5.5–6.5',
              cefrLevel: 'B2',
              languageCode: 'en',
              summary: 'Intermediate work & culture path',
              isAiGenerated: false,
            },
          ],
          activeTrack: {
            id: 1,
            code: 'band_45_55',
            title: 'Band 4.5–5.5',
            cefrLevel: 'B1',
            languageCode: 'en',
            summary: 'Foundation everyday path',
            isAiGenerated: false,
          },
          parts: [
            {
              id: 10,
              partNumber: 1,
              title: 'My Everyday World',
              subtitle: 'Home and daily routines',
              units: [
                {
                  id: 101,
                  unitNumber: 1,
                  slug: 'where-do-you-live',
                  title: 'Where Do You Live?',
                  topicName: 'Neighborhood & Home',
                  icon: 'home',
                  themeColor: 'green',
                  grammarFocus: 'Present simple',
                  wordCount: 6,
                  unlocked: true,
                  status: 'active',
                  progress: {
                    vocabCompleted: true,
                    quizCompleted: false,
                    quizScore: null,
                    writingCompleted: false,
                    writingSubmission: null,
                    writingFeedback: null,
                    speakingCompleted: false,
                    speakingSessionId: null,
                    topicId: 88,
                    skillsDone: 1,
                    totalSkills: 4,
                    percentDone: 25,
                    completedAt: null,
                  },
                },
              ],
            },
          ],
          stats: {
            completedUnits: 0,
            totalUnits: 1,
            recommendedUnitId: 101,
          },
        }),
      ),
      updateGoal: vi.fn(),
      generateAiPath: vi.fn(),
      deleteAiTrack: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LearningPathComponent],
      providers: [
        provideRouter([]),
        { provide: LearningPathApiService, useValue: pathApiMock },
        { provide: AuthService, useValue: { fetchMe: vi.fn().mockReturnValue(of(null)) } },
        {
          provide: AiApiService,
          useValue: { getStatus: vi.fn().mockReturnValue(of({ enabled: true, model: 'qwen' })) },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem('argon_learning_course');
  });

  it('renders Part 1 skill tree, Vocab Notebook node, Band switcher, and opens goal modal', () => {
    const fixture = TestBed.createComponent(LearningPathComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('My Everyday World');
    expect(el.textContent).toContain('Where Do You Live?');
    expect(el.textContent).toContain('Vocab Notebook');
    expect(el.textContent).toContain('1/4 skills done');

    const select = el.querySelector<HTMLSelectElement>('.lp-band-select')!;
    select.value = 'band_55_65';
    select.dispatchEvent(new Event('change'));
    expect(pathApiMock.getOverview).toHaveBeenCalledWith('band_55_65', 'en');
  });

  it('opens AI generator modal and generates a custom AI path & materials', () => {
    pathApiMock.generateAiPath.mockReturnValue(
      of({
        goal: { learningGoalBand: 'band_45_55', currentLevel: 'B1', dailyGoalMinutes: 15 },
        tracks: [
          {
            id: 9,
            code: 'ai-7-test',
            title: 'IT Job Interviews',
            cefrLevel: 'B2',
            languageCode: 'en',
            summary: 'Custom AI track',
            isAiGenerated: true,
          },
        ],
        activeTrack: {
          id: 9,
          code: 'ai-7-test',
          title: 'IT Job Interviews',
          cefrLevel: 'B2',
          languageCode: 'en',
          summary: 'Custom AI track',
          isAiGenerated: true,
        },
        parts: [],
        stats: { completedUnits: 0, totalUnits: 0, recommendedUnitId: null },
      }),
    );

    const fixture = TestBed.createComponent(LearningPathComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      openAiGenModal: () => void;
      applyAiPreset: (t: string) => void;
      submitAiGenerate: () => void;
    };
    comp.openAiGenModal();
    comp.applyAiPreset('English for IT Software Engineering Interviews');
    comp.submitAiGenerate();

    expect(pathApiMock.generateAiPath).toHaveBeenCalledWith(
      expect.objectContaining({
        goalTopic: 'English for IT Software Engineering Interviews',
        unitCount: 3,
      }),
    );
  });

  it('maintains 100% EN/VI key parity for learning-path i18n dictionary', () => {
    expect(Object.keys(LP_VI_TRANSLATIONS).sort()).toEqual(Object.keys(LP_EN_TRANSLATIONS).sort());
  });

  it('switches between English and Korean learning paths via in-page tabs', () => {
    const fixture = TestBed.createComponent(LearningPathComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const koTab = Array.from(el.querySelectorAll<HTMLButtonElement>('.oq-course-tab')).find((btn) =>
      btn.textContent?.includes('Korean'),
    );
    expect(koTab).toBeTruthy();

    koTab?.click();
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(pathApiMock.getOverview).toHaveBeenLastCalledWith(undefined, 'ko');
    expect(koTab?.getAttribute('aria-pressed')).toBe('true');
  });

  it('displays API errors inside the AI generator modal and clears them when reopened', () => {
    pathApiMock.generateAiPath.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 429,
            error: { message: 'AI rate limit reached. Please wait about 12s and try again.' },
          }),
      ),
    );

    const fixture = TestBed.createComponent(LearningPathComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as {
      openAiGenModal: () => void;
      applyAiPreset: (t: string) => void;
      submitAiGenerate: () => void;
    };
    comp.openAiGenModal();
    comp.applyAiPreset('Travel English for Business');
    comp.submitAiGenerate();
    fixture.detectChanges();

    const modalAlert = (fixture.nativeElement as HTMLElement).querySelector(
      '.lp-goal-form .oq-alert--error',
    );
    expect(modalAlert?.textContent).toContain('AI rate limit reached');

    comp.openAiGenModal();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.lp-goal-form .oq-alert--error'),
    ).toBeNull();
  });
});
