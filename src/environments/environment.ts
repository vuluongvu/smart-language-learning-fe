import type { AppEnvironment } from './environment.type';

type RuntimeEnvGlobal = typeof globalThis & {
  __ARGON_ENV__?: Partial<AppEnvironment>;
};

const runtimeEnv = (globalThis as RuntimeEnvGlobal).__ARGON_ENV__;

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: runtimeEnv?.apiBaseUrl?.trim() || '/api/v1',
  googleClientId: runtimeEnv?.googleClientId?.trim() || '',
  aiEnabled: runtimeEnv?.aiEnabled ?? false,
};
