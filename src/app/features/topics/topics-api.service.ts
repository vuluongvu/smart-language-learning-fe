import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import { LearningLanguageCode } from '../../shared/types/learning-language.types';
import {
  CreateTopicPayload,
  PaginatedResponse,
  TopicDetail,
  TopicSummary,
  UpdateTopicPayload,
} from '../../shared/types/learning.types';

@Injectable({ providedIn: 'root' })
export class TopicsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/topics`;

  list(params?: {
    search?: string;
    languageCode?: LearningLanguageCode;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<TopicSummary>> {
    let httpParams = new HttpParams();
    if (params?.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params?.languageCode) {
      httpParams = httpParams.set('languageCode', params.languageCode);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }

    return this.http
      .get<ApiEnvelope<PaginatedResponse<TopicSummary>>>(this.baseUrl, {
        params: httpParams,
      })
      .pipe(map((res) => res.data));
  }

  getOne(id: number): Observable<TopicDetail> {
    return this.http
      .get<ApiEnvelope<TopicDetail>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateTopicPayload): Observable<TopicSummary> {
    return this.http
      .post<ApiEnvelope<TopicSummary>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: UpdateTopicPayload): Observable<TopicSummary> {
    return this.http
      .patch<ApiEnvelope<TopicSummary>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: number): Observable<{ message: string; id: number }> {
    return this.http
      .delete<ApiEnvelope<{ message: string; id: number }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  attachVocabulary(topicId: number, vocabularyId: number): Observable<{ message: string }> {
    return this.http
      .post<ApiEnvelope<{ message: string }>>(
        `${this.baseUrl}/${topicId}/vocabulary/${vocabularyId}`,
        {},
      )
      .pipe(map((res) => res.data));
  }

  detachVocabulary(topicId: number, vocabularyId: number): Observable<{ message: string }> {
    return this.http
      .delete<ApiEnvelope<{ message: string }>>(
        `${this.baseUrl}/${topicId}/vocabulary/${vocabularyId}`,
      )
      .pipe(map((res) => res.data));
  }
}
