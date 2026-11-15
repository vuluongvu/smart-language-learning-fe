import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  AttemptAnswerSubmission,
  AttemptDetail,
  AttemptSummary,
  CreateQuizPayload,
  DraftFromVocabularyPayload,
  PaginatedResponse,
  QuizAttemptStatus,
  QuizDetail,
  QuizQueryParams,
  QuizQuestionInput,
  QuizSummary,
  SaveVocabularyFromQuizPayload,
  SaveVocabularyFromQuizResult,
  UpdateQuizPayload,
} from '../../shared/types/learning.types';

@Injectable({ providedIn: 'root' })
export class QuizzesApiService {
  private readonly http = inject(HttpClient);
  private readonly quizzesUrl = `${environment.apiBaseUrl}/quizzes`;
  private readonly attemptsUrl = `${environment.apiBaseUrl}/attempts`;

  list(query?: QuizQueryParams): Observable<PaginatedResponse<QuizSummary>> {
    let params = new HttpParams();
    if (query?.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query?.topicId) {
      params = params.set('topicId', query.topicId);
    }
    if (query?.status) {
      params = params.set('status', query.status);
    }
    if (query?.difficulty) {
      params = params.set('difficulty', query.difficulty);
    }
    if (query?.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query?.page) {
      params = params.set('page', query.page);
    }
    if (query?.limit) {
      params = params.set('limit', query.limit);
    }

    return this.http
      .get<ApiEnvelope<PaginatedResponse<QuizSummary>>>(this.quizzesUrl, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  getOne(id: number): Observable<QuizDetail> {
    return this.http
      .get<ApiEnvelope<QuizDetail>>(`${this.quizzesUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateQuizPayload): Observable<QuizDetail> {
    return this.http
      .post<ApiEnvelope<QuizDetail>>(this.quizzesUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: UpdateQuizPayload): Observable<QuizDetail> {
    return this.http
      .patch<ApiEnvelope<QuizDetail>>(`${this.quizzesUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: number): Observable<{ message: string; id: number }> {
    return this.http
      .delete<ApiEnvelope<{ message: string; id: number }>>(`${this.quizzesUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  draftFromVocabulary(
    payload: DraftFromVocabularyPayload,
  ): Observable<{ questions: QuizQuestionInput[] }> {
    return this.http
      .post<ApiEnvelope<{ questions: QuizQuestionInput[] }>>(
        `${this.quizzesUrl}/draft-from-vocabulary`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  saveVocabularyFromQuiz(
    payload: SaveVocabularyFromQuizPayload,
  ): Observable<SaveVocabularyFromQuizResult> {
    return this.http
      .post<ApiEnvelope<SaveVocabularyFromQuizResult>>(
        `${this.quizzesUrl}/save-vocabulary`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  startAttempt(quizId: number, forceNew = false): Observable<AttemptDetail> {
    return this.http
      .post<ApiEnvelope<AttemptDetail>>(`${this.quizzesUrl}/${quizId}/attempts`, { forceNew })
      .pipe(map((res) => res.data));
  }

  listQuizAttempts(
    quizId: number,
    page = 1,
    limit = 20,
  ): Observable<PaginatedResponse<AttemptSummary>> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http
      .get<ApiEnvelope<PaginatedResponse<AttemptSummary>>>(
        `${this.quizzesUrl}/${quizId}/attempts`,
        { params },
      )
      .pipe(map((res) => res.data));
  }

  listAllAttempts(query?: {
    quizId?: number | null;
    status?: QuizAttemptStatus | '';
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<AttemptSummary>> {
    let params = new HttpParams();
    if (query?.quizId) {
      params = params.set('quizId', query.quizId);
    }
    if (query?.status) {
      params = params.set('status', query.status);
    }
    if (query?.page) {
      params = params.set('page', query.page);
    }
    if (query?.limit) {
      params = params.set('limit', query.limit);
    }

    return this.http
      .get<ApiEnvelope<PaginatedResponse<AttemptSummary>>>(this.attemptsUrl, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  getAttempt(attemptId: number): Observable<AttemptDetail> {
    return this.http
      .get<ApiEnvelope<AttemptDetail>>(`${this.attemptsUrl}/${attemptId}`)
      .pipe(map((res) => res.data));
  }

  saveAttemptProgress(
    attemptId: number,
    answers: AttemptAnswerSubmission[],
  ): Observable<AttemptDetail> {
    return this.http
      .patch<ApiEnvelope<AttemptDetail>>(`${this.attemptsUrl}/${attemptId}/progress`, { answers })
      .pipe(map((res) => res.data));
  }

  submitAttempt(attemptId: number, answers: AttemptAnswerSubmission[]): Observable<AttemptDetail> {
    return this.http
      .post<ApiEnvelope<AttemptDetail>>(`${this.attemptsUrl}/${attemptId}/submit`, { answers })
      .pipe(map((res) => res.data));
  }
}
