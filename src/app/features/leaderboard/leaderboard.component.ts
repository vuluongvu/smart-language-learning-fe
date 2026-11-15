import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  OqEmptyStateComponent,
  OqIconComponent,
  OqPageHeaderComponent,
} from '../../shared/components';
import { StreakLeaderboardResponse } from '../../shared/types/learning.types';
import { extractApiError } from '../../shared/utils/api-error.util';
import { ProgressApiService } from '../progress/progress-api.service';

@Component({
  selector: 'app-leaderboard',
  imports: [RouterLink, OqPageHeaderComponent, OqEmptyStateComponent, OqIconComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnInit {
  private readonly progressApi = inject(ProgressApiService);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly data = signal<StreakLeaderboardResponse | null>(null);

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(pageNum: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.page.set(pageNum);

    this.progressApi.getStreakLeaderboard(pageNum, 20).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          extractApiError(err, 'Unable to load the streak leaderboard right now.'),
        );
        this.loading.set(false);
      },
    });
  }

  initialOf(name: string): string {
    return name.trim().charAt(0).toUpperCase() || '?';
  }
}
