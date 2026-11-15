export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
  googleClientId: string;
  aiEnabled: boolean;
}

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/api/v1',
  googleClientId: '',
  aiEnabled: false,
};
