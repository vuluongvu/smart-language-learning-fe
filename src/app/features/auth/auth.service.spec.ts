import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorage: TokenStorageService;

  const sampleUser = {
    id: 1,
    email: 'learner@example.com',
    displayName: 'Learner',
    avatarUrl: null,
    timezone: 'Asia/Ho_Chi_Minh',
    isLeaderboardVisible: true,
    role: 'user',
    hasPassword: true,
    linkedProviders: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenStorage = TestBed.inject(TokenStorageService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores tokens and user profile on login', () => {
    let loggedInEmail = '';
    service.login({ email: 'learner@example.com', password: 'Password123!' }).subscribe((u) => {
      loggedInEmail = u.email;
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-01-01T00:00:00.000Z',
      data: {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: sampleUser,
      },
    });

    expect(loggedInEmail).toBe('learner@example.com');
    expect(service.isAuthenticated()).toBe(true);
    expect(tokenStorage.getAccessToken()).toBe('access-1');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-1');
  });

  it('clears tokens and user state on logout', () => {
    tokenStorage.setTokens('access-1', 'refresh-1');

    let done = false;
    service.logout().subscribe(() => {
      done = true;
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    req.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-01-01T00:00:00.000Z',
      data: { message: 'Logged out successfully' },
    });

    expect(done).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it('signs in with Google ID token and links/unlinks Google provider on user state', () => {
    let googleEmail = '';
    service.googleLogin('google-id-token-123', 'Asia/Ho_Chi_Minh').subscribe((u) => {
      googleEmail = u.email;
    });

    const loginReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/google`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({
      idToken: 'google-id-token-123',
      timezone: 'Asia/Ho_Chi_Minh',
    });
    loginReq.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-01-01T00:00:00.000Z',
      data: {
        accessToken: 'g-access',
        refreshToken: 'g-refresh',
        user: { ...sampleUser, linkedProviders: ['local'] },
      },
    });
    expect(googleEmail).toBe('learner@example.com');

    service.linkGoogle('google-id-token-456').subscribe();
    const linkReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/google/link`);
    expect(linkReq.request.method).toBe('POST');
    linkReq.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-01-01T00:00:00.000Z',
      data: { message: 'Google account linked successfully', linkedProviders: ['local', 'google'] },
    });
    expect(service.user()?.linkedProviders).toEqual(['local', 'google']);

    service.unlinkGoogle().subscribe();
    const unlinkReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/google/unlink`);
    expect(unlinkReq.request.method).toBe('POST');
    unlinkReq.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-01-01T00:00:00.000Z',
      data: { message: 'Google account unlinked successfully', linkedProviders: ['local'] },
    });
    expect(service.user()?.linkedProviders).toEqual(['local']);
  });
});
