// Centralized fetch client.
// - Reads base URL from EXPO_PUBLIC_API_URL (or app.json `extra.apiUrl` fallback).
// - Attaches the JWT token if one has been registered via setAuthToken().
// - Normalizes errors into a single shape: { status, message }.

import Constants from 'expo-constants';

const FALLBACK_URL =
  Constants?.expoConfig?.extra?.apiUrl ||
  Constants?.manifest?.extra?.apiUrl ||
  'http://localhost:8000';

export const API_URL =
  (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim()) ||
  FALLBACK_URL;

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function getAuthToken() {
  return authToken;
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_URL.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method, path, { body, headers, signal } = {}) {
  const finalHeaders = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(headers || {}),
  };

  const _url = buildUrl(path);

  let response;
  try {
    response = await fetch(_url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (e) {
    const message =
      e?.message === 'Network request failed'
        ? 'Cannot reach the server. Check your connection and API URL.'
        : e?.message || 'Network error';
    throw { status: 0, message };
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    const message =
      (payload && (payload.detail || payload.message)) ||
      (typeof payload === 'string' && payload) ||
      `Request failed (${response.status})`;
    throw { status: response.status, message };
  }

  return payload;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  del: (path, opts) => request('DELETE', path, opts),
};

export default api;
