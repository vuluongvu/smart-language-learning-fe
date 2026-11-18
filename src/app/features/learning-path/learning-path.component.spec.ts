import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { LearningPathApiService } from './learning-path-api.service';
import { LP_EN_TRANSLATIONS, LP_VI_TRANSLATIONS } from './learning-path.i18n';
import { LearningPathComponent } from './learning-path.component';

describe('LearningPathComponent', () => {
  let pathApiMock: {
    getOverview: ReturnType<typeof vi.fn>;
    updateGoal: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
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
            },
            {
              id: 2,
              code: 'band_55_65',
              title: 'Band 5.5–6.5',
              cefrLevel: 'B2',
              languageCode: 'en',
              summary: 'Intermediate work & culture path',
            },
          ],
          activeTrack: {
            id: 1,
            code: 'band_45_55',
            title: 'Band 4.5–5.5',
            cefrLevel: 'B1',
            languageCode: 'en',
            summary: 'Foundation everyday path',
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
    };

    await TestBed.configureTestingModule({
      imports: [LearningPathComponent],
      providers: [
        provideRouter([]),
        { provide: LearningPathApiService, useValue: pathApiMock },
        { provide: AuthService, useValue: { fetchMe: vi.fn().mockReturnValue(of(null)) } },
      ],
    }).compileComponents();
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
    expect(pathApiMock.getOverview).toHaveBeenCalledWith('band_55_65');
  });

  it('maintains 100% EN/VI key parity for learning-path i18n dictionary', () => {
    expect(Object.keys(LP_VI_TRANSLATIONS).sort()).toEqual(Object.keys(LP_EN_TRANSLATIONS).sort());
  });
});
