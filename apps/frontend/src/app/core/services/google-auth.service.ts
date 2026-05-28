import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: 'standard' | 'icon';
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      logo_alignment?: 'left' | 'center';
      width?: number | string;
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  readonly clientId = environment.googleClientId;
  readonly isConfigured = !!environment.googleClientId;

  private readyPromise: Promise<GoogleAccountsId> | null = null;

  ready(): Promise<GoogleAccountsId> {
    if (!this.isConfigured) {
      return Promise.reject(new Error('Google client ID is not configured'));
    }
    this.readyPromise ??= new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (window.google?.accounts?.id) {
          resolve(window.google.accounts.id);
          return;
        }
        if (Date.now() - start > 10_000) {
          reject(new Error('Google Identity Services script failed to load'));
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    });
    return this.readyPromise;
  }

  async renderButton(
    element: HTMLElement,
    onCredential: (credential: string) => void,
    text: 'signin_with' | 'signup_with' | 'continue_with' = 'signin_with',
  ) {
    const gsi = await this.ready();
    gsi.initialize({
      client_id: this.clientId,
      callback: (response) => onCredential(response.credential),
    });
    gsi.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      logo_alignment: 'left',
      width: element.clientWidth || 360,
    });
  }
}
