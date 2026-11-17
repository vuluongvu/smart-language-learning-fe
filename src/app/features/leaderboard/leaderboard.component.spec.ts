import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProgressApiService } from '../progress/progress-api.service';
import { LeaderboardComponent } from './leaderboard.component';

describe('LeaderboardComponent', () => {
  it('renders public ranked entries and opted-out notice cleanly', async () => {
    const progressApiMock = {
      getStreakLeaderboard: vi.fn().mockReturnValue(
        of({
          items: [
            {
              rank: 1,
              userId: 2,
              displayName: 'Top Scholar',
              avatarUrl: null,
              currentStreak: 12,
              longestStreak: 15,
              isCurrentUser: false,
            },
          ],
          meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
          myPosition: {
            userId: 1,
            displayName: 'Hidden Me',
            avatarUrl: null,
            isLeaderboardVisible: false,
            rank: null,
            currentStreak: 4,
            longestStreak: 6,
            totalParticipants: 1,
          },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent],
      providers: [provideRouter([]), { provide: ProgressApiService, useValue: progressApiMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(LeaderboardComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Top Scholar');
    expect(el.textContent).toContain('#1');
    expect(el.textContent).toContain('Private Mode Enabled');
    expect(el.textContent).toContain('4d active');
  });
});
