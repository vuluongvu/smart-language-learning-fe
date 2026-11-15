import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  firstValueFrom,
  map,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/api/api-response.type';
import {
  AuthTokenResponse,
  ChangePasswordRequest,
  DeleteAccountRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../../shared/types/auth.types';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly userSignal = signal<UserProfile | null>(null);
  private readonly initializedSignal = signal(false);
  private initPromise: Promise<void> | null = null;
  private refreshInFlight$: Observable<AuthTokenResponse> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly isInitialized = this.initializedSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  initializeSession(): Promise<void> {
    if (this.initializedSignal()) {
      return Promise.resolve();
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    const token = this.tokenStorage.getAccessToken();
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!token && !refreshToken) {
      this.initializedSignal.set(true);
      return Promise.resolve();
    }

    this.initPromise = firstValueFrom(
      this.fetchMe().pipe(
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      ),
    )
      .then(() => undefined)
      .finally(() => {
        this.initializedSignal.set(true);
        this.initPromise = null;
      });

    return this.initPromise;
  }

  register(payload: RegisterRequest): Observable<UserProfile> {
    return this.http
      .post<ApiEnvelope<AuthTokenResponse>>(`${this.baseUrl}/auth/register`, payload)
      .pipe(
        map((res) => res.data),
        tap((data) => this.applySession(data)),
        map((data) => data.user),
      );
  }

  login(payload: LoginRequest): Observable<UserProfile> {
    return this.http
      .post<ApiEnvelope<AuthTokenResponse>>(`${this.baseUrl}/auth/login`, payload)
      .pipe(
        map((res) => res.data),
        tap((data) => this.applySession(data)),
        map((data) => data.user),
      );
  }

  googleLogin(idToken: string, timezone?: string): Observable<UserProfile> {
    return this.http
      .post<ApiEnvelope<AuthTokenResponse>>(`${this.baseUrl}/auth/google`, { idToken, timezone })
      .pipe(
        map((res) => res.data),
        tap((data) => this.applySession(data)),
        map((data) => data.user),
      );
  }

  refreshTokens(): Observable<AuthTokenResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshInFlight$ = this.http
      .post<ApiEnvelope<AuthTokenResponse>>(`${this.baseUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        map((res) => res.data),
        tap((data) => this.applySession(data)),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay(1),
      );

    return this.refreshInFlight$;
  }

  fetchMe(): Observable<UserProfile> {
    return this.http.get<ApiEnvelope<UserProfile>>(`${this.baseUrl}/users/me`).pipe(
      map((res) => res.data),
      tap((user) => this.userSignal.set(user)),
    );
  }

  updateProfile(payload: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<ApiEnvelope<UserProfile>>(`${this.baseUrl}/users/me`, payload).pipe(
      map((res) => res.data),
      tap((user) => this.userSignal.set(user)),
    );
  }

  updateTimezone(timezone: string): Observable<UserProfile> {
    return this.http
      .patch<ApiEnvelope<UserProfile>>(`${this.baseUrl}/users/me/timezone`, {
        timezone,
      })
      .pipe(
        map((res) => res.data),
        tap((user) => this.userSignal.set(user)),
      );
  }

  updateLeaderboardVisibility(isLeaderboardVisible: boolean): Observable<UserProfile> {
    return this.http
      .patch<ApiEnvelope<UserProfile>>(`${this.baseUrl}/users/me/leaderboard-visibility`, {
        isLeaderboardVisible,
      })
      .pipe(
        map((res) => res.data),
        tap((user) => this.userSignal.set(user)),
      );
  }

  changePassword(payload: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http
      .patch<ApiEnvelope<{ message: string }>>(`${this.baseUrl}/users/me/password`, payload)
      .pipe(map((res) => res.data));
  }

  deleteAccount(payload: DeleteAccountRequest): Observable<{ message: string }> {
    return this.http
      .delete<ApiEnvelope<{ message: string }>>(`${this.baseUrl}/users/me`, {
        body: payload,
      })
      .pipe(
        map((res) => res.data),
        tap(() => this.clearSession()),
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http
      .post<ApiEnvelope<{ message: string }>>(`${this.baseUrl}/auth/logout`, {
        refreshToken: refreshToken ?? undefined,
      })
      .pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
        finalize(() => this.clearSession()),
      );
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.userSignal.set(null);
    this.initializedSignal.set(true);
  }

  private applySession(data: AuthTokenResponse): void {
    this.tokenStorage.setTokens(data.accessToken, data.refreshToken);
    this.userSignal.set(data.user);
    this.initializedSignal.set(true);
  }
}
