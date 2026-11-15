import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  ProgressHistory,
  ProgressOverview,
  StreakCalendarResponse,
  StreakLeaderboardResponse,
  StreakSummary,
} from '../../shared/types/learning.types';

@Injectable({ providedIn: 'root' })
export class ProgressApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getOverview(): Observable<ProgressOverview> {
    return this.http
      .get<ApiEnvelope<ProgressOverview>>(`${this.baseUrl}/progress/overview`)
      .pipe(map((res) => res.data));
  }

  getHistory(days = 14): Observable<ProgressHistory> {
    const params = new HttpParams().set('days', days);
    return this.http
      .get<ApiEnvelope<ProgressHistory>>(`${this.baseUrl}/progress/history`, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  getMyStreak(): Observable<StreakSummary> {
    return this.http
      .get<ApiEnvelope<StreakSummary>>(`${this.baseUrl}/streaks/me`)
      .pipe(map((res) => res.data));
  }

  getStreakCalendar(month?: string): Observable<StreakCalendarResponse> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http
      .get<ApiEnvelope<StreakCalendarResponse>>(`${this.baseUrl}/streaks/calendar`, { params })
      .pipe(map((res) => res.data));
  }

  getStreakLeaderboard(page = 1, limit = 20): Observable<StreakLeaderboardResponse> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ApiEnvelope<StreakLeaderboardResponse>>(`${this.baseUrl}/leaderboard/streaks`, {
        params,
      })
      .pipe(map((res) => res.data));
  }
}
