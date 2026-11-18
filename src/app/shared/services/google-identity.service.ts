import { Injectable, NgZone, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/auth.service';

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme?: string; size?: string; width?: number; text?: string },
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private readonly authService = inject(AuthService);
  private readonly ngZone = inject(NgZone);
  private cachedClientId$: Observable<string | null> | null = null;

  resolveClientId(): Observable<string | null> {
    const envClientId = environment.googleClientId.trim();
    if (envClientId) {
      return of(envClientId);
    }

    if (!this.cachedClientId$) {
      this.cachedClientId$ = this.authService.getGoogleConfig().pipe(
        map((cfg) => (cfg.enabled && cfg.clientId ? cfg.clientId.trim() : null)),
        catchError(() => of(null)),
        shareReplay(1),
      );
    }

    return this.cachedClientId$;
  }

  renderButton(
    container: HTMLElement,
    clientId: string,
    onCredential: (idToken: string) => void,
    options: { text?: 'signin_with' | 'signup_with' | 'continue_with'; width?: number } = {},
  ): void {
    const mount = () => {
      const gsi = window.google?.accounts?.id;
      if (!gsi) {
        return;
      }
      container.innerHTML = '';
      gsi.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response.credential) {
            return;
          }
          this.ngZone.run(() => onCredential(response.credential!));
        },
      });
      gsi.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: options.width ?? 340,
        text: options.text ?? 'continue_with',
      });
    };

    if (window.google?.accounts?.id) {
      mount();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', mount, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = mount;
    document.head.appendChild(script);
  }
}
