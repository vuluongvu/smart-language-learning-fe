import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  CreateFlashcardSessionPayload,
  FlashcardDueQueueResponse,
  FlashcardSessionDetail,
  FlashcardSessionMode,
  FlashcardSessionStatus,
  FlashcardSessionSummary,
  PaginatedResponse,
  RecordFlashcardReviewResponse,
  ReviewRating,
} from '../../shared/types/learning.types';

@Injectable({ providedIn: 'root' })
export class FlashcardsApiService {
  private readonly http = inject(HttpClient);
  private readonly flashcardsUrl = `${environment.apiBaseUrl}/flashcards`;
  private readonly sessionsUrl = `${environment.apiBaseUrl}/flashcard-sessions`;

  getDueQueue(query?: {
    topicId?: number | null;
    mode?: FlashcardSessionMode;
    languageCode?: 'en' | 'ko';
    page?: number;
    limit?: number;
  }): Observable<FlashcardDueQueueResponse> {
    let params = new HttpParams();
    if (query?.topicId) {
      params = params.set('topicId', query.topicId);
    }
    if (query?.mode) {
      params = params.set('mode', query.mode);
    }
    if (query?.languageCode) {
      params = params.set('languageCode', query.languageCode);
    }
    if (query?.page) {
      params = params.set('page', query.page);
    }
    if (query?.limit) {
      params = params.set('limit', query.limit);
    }
    return this.http
      .get<ApiEnvelope<FlashcardDueQueueResponse>>(`${this.flashcardsUrl}/due`, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  listSessions(query?: {
    status?: FlashcardSessionStatus | null;
    topicId?: number | null;
    languageCode?: 'en' | 'ko';
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<FlashcardSessionSummary>> {
    let params = new HttpParams();
    if (query?.status) {
      params = params.set('status', query.status);
    }
    if (query?.topicId) {
      params = params.set('topicId', query.topicId);
    }
    if (query?.languageCode) {
      params = params.set('languageCode', query.languageCode);
    }
    if (query?.page) {
      params = params.set('page', query.page);
    }
    if (query?.limit) {
      params = params.set('limit', query.limit);
    }
    return this.http
      .get<ApiEnvelope<PaginatedResponse<FlashcardSessionSummary>>>(this.sessionsUrl, { params })
      .pipe(map((res) => res.data));
  }

  createSession(payload: CreateFlashcardSessionPayload): Observable<FlashcardSessionDetail> {
    return this.http
      .post<ApiEnvelope<FlashcardSessionDetail>>(this.sessionsUrl, payload)
      .pipe(map((res) => res.data));
  }

  getSession(sessionId: number): Observable<FlashcardSessionDetail> {
    return this.http
      .get<ApiEnvelope<FlashcardSessionDetail>>(`${this.sessionsUrl}/${sessionId}`)
      .pipe(map((res) => res.data));
  }

  recordReview(
    sessionId: number,
    vocabularyId: number,
    rating: ReviewRating,
  ): Observable<RecordFlashcardReviewResponse> {
    return this.http
      .post<ApiEnvelope<RecordFlashcardReviewResponse>>(
        `${this.sessionsUrl}/${sessionId}/reviews`,
        { vocabularyId, rating },
      )
      .pipe(map((res) => res.data));
  }

  completeSession(sessionId: number): Observable<FlashcardSessionDetail> {
    return this.http
      .post<ApiEnvelope<FlashcardSessionDetail>>(`${this.sessionsUrl}/${sessionId}/complete`, {})
      .pipe(map((res) => res.data));
  }
}
