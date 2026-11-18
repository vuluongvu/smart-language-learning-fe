import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function normalizeApiBaseUrl(rawValue) {
  const trimmed = (rawValue || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  const parsed = new URL(trimmed);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`ARGON_API_BASE_URL must use http:// or https:// (got ${parsed.protocol})`);
  }

  if (parsed.pathname === '' || parsed.pathname === '/') {
    parsed.pathname = '/api/v1';
  }

  return parsed.toString().replace(/\/+$/, '');
}

function escapeJsonForInlineScript(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
}

execSync('npx ng build', { stdio: 'inherit' });

const rawApiUrl =
  process.env.ARGON_API_BASE_URL ||
  process.env.NG_APP_API_BASE_URL ||
  process.env.API_BASE_URL ||
  '';
const apiBaseUrl = normalizeApiBaseUrl(rawApiUrl);
const googleClientId = (
  process.env.ARGON_GOOGLE_CLIENT_ID ||
  process.env.NG_APP_GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  ''
).trim();

if (process.env.VERCEL === '1' && !apiBaseUrl) {
  console.warn(
    '[vercel-build] WARNING: ARGON_API_BASE_URL is not set. Falling back to "/api/v1" (requests will fail unless rewritten to your AWS backend).',
  );
}

if (!apiBaseUrl && !googleClientId) {
  process.exit(0);
}

const runtimeConfig = {
  ...(apiBaseUrl ? { apiBaseUrl } : {}),
  ...(googleClientId ? { googleClientId } : {}),
};

const indexPath = resolve('dist/smart-language-learning-fe/browser/index.html');
const html = readFileSync(indexPath, 'utf8');
if (!html.includes('</head>')) {
  throw new Error(`Could not find </head> in built ${indexPath}`);
}

const scriptTag = `<script>window.__ARGON_ENV__=${escapeJsonForInlineScript(runtimeConfig)};</script>`;
const updatedHtml = html.replace('</head>', `${scriptTag}</head>`);
writeFileSync(indexPath, updatedHtml, 'utf8');
console.log(
  `[vercel-build] Injected runtime config into dist/smart-language-learning-fe/browser/index.html (apiBaseUrl=${apiBaseUrl || '/api/v1'})`,
);
