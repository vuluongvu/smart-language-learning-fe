import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import { ExplanationLanguage } from '../../shared/types/ai.types';
import {
  EvaluateUnitWritingResult,
  GenerateAiPathRequest,
  GenerateStudyGuideResult,
  LearningGoalBand,
  LearningPathOverview,
  LearningPathUnitDetail,
  SaveUnitWordsResult,
  StartUnitSpeakingResult,
  SyncUnitVocabResult,
  UnitQuizSubmissionResult,
  UnitProgressView,
} from '../../shared/types/learning-path.types';

@Injectable({ providedIn: 'root' })
export class LearningPathApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/learning-path`;

  getOverview(band?: string): Observable<LearningPathOverview> {
    let params = new HttpParams();
    if (band) {
      params = params.set('band', band);
    }
    return this.http
      .get<ApiEnvelope<LearningPathOverview>>(this.baseUrl, { params })
      .pipe(map((res) => res.data));
  }

  updateGoal(payload: {
    learningGoalBand: LearningGoalBand | string;
    currentLevel?: string;
    dailyGoalMinutes?: number;
  }): Observable<LearningPathOverview> {
    return this.http
      .patch<ApiEnvelope<LearningPathOverview>>(`${this.baseUrl}/goal`, payload)
      .pipe(map((res) => res.data));
  }

  getUnitDetail(unitId: number): Observable<LearningPathUnitDetail> {
    return this.http
      .get<ApiEnvelope<LearningPathUnitDetail>>(`${this.baseUrl}/units/${unitId}`)
      .pipe(map((res) => res.data));
  }

  syncUnitVocab(unitId: number): Observable<SyncUnitVocabResult> {
    return this.http
      .post<ApiEnvelope<SyncUnitVocabResult>>(`${this.baseUrl}/units/${unitId}/vocab/sync`, {})
      .pipe(map((res) => res.data));
  }

  submitUnitQuiz(
    unitId: number,
    answers: Array<{ questionId: string; selectedIndex: number }>,
  ): Observable<UnitQuizSubmissionResult> {
    return this.http
      .post<ApiEnvelope<UnitQuizSubmissionResult>>(`${this.baseUrl}/units/${unitId}/quiz/submit`, {
        answers,
      })
      .pipe(map((res) => res.data));
  }

  evaluateUnitWriting(
    unitId: number,
    text: string,
    explanationLang: ExplanationLanguage = 'vi',
  ): Observable<EvaluateUnitWritingResult> {
    return this.http
      .post<ApiEnvelope<EvaluateUnitWritingResult>>(
        `${this.baseUrl}/units/${unitId}/writing/evaluate`,
        { text, explanationLang },
      )
      .pipe(map((res) => res.data));
  }

  startUnitSpeaking(
    unitId: number,
    explanationLang: ExplanationLanguage = 'vi',
  ): Observable<StartUnitSpeakingResult> {
    return this.http
      .post<ApiEnvelope<StartUnitSpeakingResult>>(
        `${this.baseUrl}/units/${unitId}/speaking/start`,
        { explanationLang },
      )
      .pipe(map((res) => res.data));
  }

  completeUnitSpeaking(unitId: number): Observable<{ progress: UnitProgressView }> {
    return this.http
      .post<ApiEnvelope<{ progress: UnitProgressView }>>(
        `${this.baseUrl}/units/${unitId}/speaking/complete`,
        {},
      )
      .pipe(map((res) => res.data));
  }

  saveUnitWords(
    unitId: number,
    words: Array<{
      term: string;
      partOfSpeech?: string | null;
      definition: string;
      example?: string | null;
    }>,
  ): Observable<SaveUnitWordsResult> {
    return this.http
      .post<ApiEnvelope<SaveUnitWordsResult>>(
        `${this.baseUrl}/units/${unitId}/notebook/save-words`,
        { words },
      )
      .pipe(map((res) => res.data));
  }

  generateAiPath(payload: GenerateAiPathRequest): Observable<LearningPathOverview> {
    return this.http
      .post<ApiEnvelope<LearningPathOverview>>(`${this.baseUrl}/ai/generate`, payload)
      .pipe(map((res) => res.data));
  }

  deleteAiTrack(trackId: number): Observable<LearningPathOverview> {
    return this.http
      .delete<ApiEnvelope<LearningPathOverview>>(`${this.baseUrl}/ai-tracks/${trackId}`)
      .pipe(map((res) => res.data));
  }

  generateUnitStudyGuide(
    unitId: number,
    payload: { focusNote?: string; explanationLang?: ExplanationLanguage },
  ): Observable<GenerateStudyGuideResult> {
    return this.http
      .post<ApiEnvelope<GenerateStudyGuideResult>>(
        `${this.baseUrl}/units/${unitId}/ai/study-guide`,
        payload,
      )
      .pipe(map((res) => res.data));
  }

  regenerateAiUnit(
    unitId: number,
    payload: { focusNote?: string; explanationLang?: ExplanationLanguage },
  ): Observable<LearningPathUnitDetail> {
    return this.http
      .post<ApiEnvelope<LearningPathUnitDetail>>(
        `${this.baseUrl}/units/${unitId}/ai/regenerate`,
        payload,
      )
      .pipe(map((res) => res.data));
  }
}
