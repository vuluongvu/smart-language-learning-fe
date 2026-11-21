import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  AiEnrichVocabularyResult,
  AiExtractImageVocabularyResult,
  AiGenerateMode,
  AiGenerateVocabularyResult,
  BulkCreateVocabularyPayload,
  BulkCreateVocabularyResult,
  CefrLevel,
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
    if (query?.languageCode) {
      params = params.set('languageCode', query.languageCode);
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

  checkDuplicate(term: string, languageCode?: 'en' | 'ko'): Observable<DuplicateCheckResult> {
    let params = new HttpParams().set('term', term.trim());
    if (languageCode) {
      params = params.set('languageCode', languageCode);
    }
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

  createBulk(payload: BulkCreateVocabularyPayload): Observable<BulkCreateVocabularyResult> {
    return this.http
      .post<ApiEnvelope<BulkCreateVocabularyResult>>(`${this.baseUrl}/bulk`, payload)
      .pipe(map((res) => res.data));
  }

  enrichWithAi(
    term: string,
    context?: string,
    languageCode?: 'en' | 'ko',
  ): Observable<AiEnrichVocabularyResult> {
    return this.http
      .post<ApiEnvelope<AiEnrichVocabularyResult>>(`${this.baseUrl}/ai/enrich`, {
        term: term.trim(),
        ...(context?.trim() ? { context: context.trim() } : {}),
        ...(languageCode ? { languageCode } : {}),
      })
      .pipe(map((res) => res.data));
  }

  generateWithAi(payload: {
    prompt: string;
    mode?: Exclude<AiGenerateMode, 'image'>;
    level?: CefrLevel | '';
    count?: number;
    topicId?: number | null;
    languageCode?: 'en' | 'ko';
  }): Observable<AiGenerateVocabularyResult> {
    return this.http
      .post<ApiEnvelope<AiGenerateVocabularyResult>>(`${this.baseUrl}/ai/generate`, {
        prompt: payload.prompt.trim(),
        mode: payload.mode ?? 'topic',
        ...(payload.level ? { level: payload.level } : {}),
        ...(payload.count ? { count: payload.count } : {}),
        ...(payload.topicId ? { topicId: payload.topicId } : {}),
        ...(payload.languageCode ? { languageCode: payload.languageCode } : {}),
      })
      .pipe(map((res) => res.data));
  }

  extractFromImage(payload: {
    image: File;
    prompt?: string;
    level?: CefrLevel | '';
    count?: number;
    topicId?: number | null;
    languageCode?: 'en' | 'ko';
  }): Observable<AiExtractImageVocabularyResult> {
    const formData = new FormData();
    formData.append('image', payload.image, payload.image.name || 'image.png');
    if (payload.prompt?.trim()) {
      formData.append('prompt', payload.prompt.trim());
    }
    if (payload.level) {
      formData.append('level', payload.level);
    }
    if (payload.count) {
      formData.append('count', String(payload.count));
    }
    if (payload.topicId) {
      formData.append('topicId', String(payload.topicId));
    }
    if (payload.languageCode) {
      formData.append('languageCode', payload.languageCode);
    }

    return this.http
      .post<ApiEnvelope<AiExtractImageVocabularyResult>>(
        `${this.baseUrl}/ai/extract-image`,
        formData,
      )
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
