import { HttpClient } from '@angular/common/http';
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

  listConversations(): Observable<AiConversationSessionSummary[]> {
    return this.http
      .get<ApiEnvelope<AiConversationSessionSummary[]>>(`${this.baseUrl}/conversations`)
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
}
