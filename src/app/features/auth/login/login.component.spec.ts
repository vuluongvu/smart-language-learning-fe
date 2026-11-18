import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('validates empty login form before submitting and resolves dynamic Google clientId', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const cfgReq = httpMock.expectOne(`${environment.apiBaseUrl}/auth/google/config`);
    cfgReq.flush({
      statusCode: 200,
      message: 'Success',
      timestamp: '2026-11-18T00:00:00Z',
      data: { enabled: true, clientId: 'test-google-client.apps.googleusercontent.com' },
    });
    fixture.detectChanges();

    expect((component as unknown as { googleClientId: () => string | null }).googleClientId()).toBe(
      'test-google-client.apps.googleusercontent.com',
    );

    component.submit();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Please enter a valid email address.');
    expect(el.textContent).toContain('Password is required.');
  });
});
