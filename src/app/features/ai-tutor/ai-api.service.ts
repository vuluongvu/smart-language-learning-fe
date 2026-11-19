import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  AiChatRequest,
  AiChatResponse,
  AiConversationSessionDetail,
  AiConversationSessionSummary,
  AiStatus,
  AiTranscribeResponse,
  ConversationInputMode,
  ExplanationLanguage,
  HandwritingRecognitionMode,
  RecognizeHandwritingResult,
  StartConversationRequest,
} from '../../shared/types/ai.types';

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/ai`;

  getStatus(): Observable<AiStatus> {
    return this.http
      .get<ApiEnvelope<AiStatus>>(`${this.baseUrl}/status`)
      .pipe(map((res) => res.data));
  }

  chat(payload: AiChatRequest): Observable<AiChatResponse> {
    return this.http
      .post<ApiEnvelope<AiChatResponse>>(`${this.baseUrl}/chat`, payload)
      .pipe(map((res) => res.data));
  }

  listConversations(languageCode?: 'en' | 'ko'): Observable<AiConversationSessionSummary[]> {
    let params = new HttpParams();
    if (languageCode) {
      params = params.set('languageCode', languageCode);
    }
    return this.http
      .get<ApiEnvelope<AiConversationSessionSummary[]>>(`${this.baseUrl}/conversations`, { params })
      .pipe(map((res) => res.data));
  }

  getConversation(id: number): Observable<AiConversationSessionDetail> {
    return this.http
      .get<ApiEnvelope<AiConversationSessionDetail>>(`${this.baseUrl}/conversations/${id}`)
      .pipe(map((res) => res.data));
  }

  startConversation(payload: StartConversationRequest): Observable<AiConversationSessionDetail> {
    return this.http
      .post<ApiEnvelope<AiConversationSessionDetail>>(`${this.baseUrl}/conversations`, payload)
      .pipe(map((res) => res.data));
  }

  replyConversation(
    id: number,
    answer: string,
    inputMode: ConversationInputMode = 'text',
  ): Observable<AiConversationSessionDetail> {
    return this.http
      .post<ApiEnvelope<AiConversationSessionDetail>>(`${this.baseUrl}/conversations/${id}/reply`, {
        answer,
        inputMode,
      })
      .pipe(map((res) => res.data));
  }

  transcribeAudio(
    audioBlob: Blob,
    options?: { language?: string; prompt?: string },
  ): Observable<AiTranscribeResponse> {
    const formData = new FormData();
    const ext = audioBlob.type.includes('ogg')
      ? 'ogg'
      : audioBlob.type.includes('mp4')
        ? 'm4a'
        : 'webm';
    formData.append('file', audioBlob, `speech.${ext}`);
    formData.append('language', options?.language ?? 'en');
    if (options?.prompt?.trim()) {
      formData.append('prompt', options.prompt.trim());
    }
    return this.http
      .post<ApiEnvelope<AiTranscribeResponse>>(`${this.baseUrl}/transcribe`, formData)
      .pipe(map((res) => res.data));
  }

  endConversation(id: number): Observable<AiConversationSessionDetail> {
    return this.http
      .post<ApiEnvelope<AiConversationSessionDetail>>(`${this.baseUrl}/conversations/${id}/end`, {})
      .pipe(map((res) => res.data));
  }

  recognizeHandwriting(
    imageBlob: Blob,
    options?: {
      expectedText?: string;
      explanationLang?: ExplanationLanguage;
      mode?: HandwritingRecognitionMode;
    },
  ): Observable<RecognizeHandwritingResult> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'handwriting.png');
    if (options?.expectedText?.trim()) {
      formData.append('expectedText', options.expectedText.trim());
    }
    if (options?.explanationLang) {
      formData.append('explanationLang', options.explanationLang);
    }
    if (options?.mode) {
      formData.append('mode', options.mode);
    }
    return this.http
      .post<ApiEnvelope<RecognizeHandwritingResult>>(
        `${this.baseUrl}/handwriting/recognize`,
        formData,
      )
      .pipe(map((res) => res.data));
  }
}
