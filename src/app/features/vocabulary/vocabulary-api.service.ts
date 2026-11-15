import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  CreateVocabularyPayload,
  CreateVocabularyResult,
  DuplicateCheckResult,
  PaginatedResponse,
  UpdateVocabularyPayload,
  VocabularyItem,
  VocabularyQueryParams,
} from '../../shared/types/learning.types';

@Injectable({ providedIn: 'root' })
export class VocabularyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/vocabulary`;

  list(query?: VocabularyQueryParams): Observable<PaginatedResponse<VocabularyItem>> {
    let params = new HttpParams();
    if (query?.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query?.topicId) {
      params = params.set('topicId', query.topicId);
    }
    if (query?.partOfSpeech?.trim()) {
      params = params.set('partOfSpeech', query.partOfSpeech.trim());
    }
    if (query?.reviewStatus && query.reviewStatus !== 'all') {
      params = params.set('reviewStatus', query.reviewStatus);
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
      .get<ApiEnvelope<PaginatedResponse<VocabularyItem>>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  checkDuplicate(term: string): Observable<DuplicateCheckResult> {
    const params = new HttpParams().set('term', term.trim());
    return this.http
      .get<ApiEnvelope<DuplicateCheckResult>>(`${this.baseUrl}/check-duplicate`, {
        params,
      })
      .pipe(map((res) => res.data));
  }

  getOne(id: number): Observable<VocabularyItem> {
    return this.http
      .get<ApiEnvelope<VocabularyItem>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateVocabularyPayload): Observable<CreateVocabularyResult> {
    return this.http
      .post<ApiEnvelope<CreateVocabularyResult>>(this.baseUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: UpdateVocabularyPayload): Observable<VocabularyItem> {
    return this.http
      .patch<ApiEnvelope<VocabularyItem>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  remove(id: number): Observable<{ message: string; id: number }> {
    return this.http
      .delete<ApiEnvelope<{ message: string; id: number }>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }
}
