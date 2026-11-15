import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProgressApiService } from './progress-api.service';
import { ProgressStreakComponent } from './progress-streak.component';

describe('ProgressStreakComponent', () => {
  it('renders streak calendar days, missed count, and active day logs', async () => {
    const progressApiMock = {
      getMyStreak: vi.fn().mockReturnValue(
        of({
          currentStreak: 3,
          longestStreak: 6,
          status: 'active_today',
          isActiveToday: true,
          isAtRiskToday: false,
          lastActivityDate: '2026-03-10',
          currentStreakStartedAt: '2026-03-08',
          todayDate: '2026-03-10',
          timezone: 'UTC',
        }),
      ),
      getStreakCalendar: vi.fn().mockReturnValue(
        of({
          month: '2026-03',
          year: 2026,
          monthNumber: 3,
          firstDayWeekday: 0,
          timezone: 'UTC',
          todayDate: '2026-03-10',
          registeredDate: '2026-03-05',
          totalActiveDays: 3,
          totalMissedDays: 2,
          days: [
            {
              date: '2026-03-01',
              dayOfMonth: 1,
              weekday: 0,
              status: 'before_registration',
              activityCount: 0,
              quizCompletions: 0,
              flashcardCompletions: 0,
            },
            {
              date: '2026-03-10',
              dayOfMonth: 10,
              weekday: 2,
              status: 'active',
              activityCount: 2,
              quizCompletions: 1,
              flashcardCompletions: 1,
            },
          ],
        }),
      ),
      getHistory: vi.fn().mockReturnValue(
        of({
          days: 14,
          timezone: 'UTC',
          todayDate: '2026-03-10',
          dailyActivities: [
            {
              date: '2026-03-10',
              activityCount: 2,
              quizCompletions: 1,
              flashcardCompletions: 1,
            },
          ],
          recentAttempts: [],
          weakVocabulary: [],
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ProgressStreakComponent],
      providers: [provideRouter([]), { provide: ProgressApiService, useValue: progressApiMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProgressStreakComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3 days');
    expect(el.textContent).toContain('6 days');
    expect(el.textContent).toContain('2026-03');
    expect(el.textContent).toContain('3 active days');
    expect(el.textContent).toContain('2 missed days');
  });
});
