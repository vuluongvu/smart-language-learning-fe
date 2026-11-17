import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../api/api-response.type';
import { LanguageItem } from '../types/auth.types';

@Injectable({ providedIn: 'root' })
export class LanguagesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getLanguages(): Observable<LanguageItem[]> {
    return this.http
      .get<ApiEnvelope<LanguageItem[]>>(`${this.baseUrl}/languages`)
      .pipe(map((res) => res.data));
  }
}
