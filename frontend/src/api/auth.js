// Auth-related API calls.
// Matches the backend exactly:
//   POST /login         -> { message, access_token, token_type, user: { id, name, email } }
//   POST /users         -> { message, user_id }
//   POST /forgot-password
//   POST /reset-password

import api from './client';

export function login({ email, password }) {
  return api.post('/login', { email, password });
}

export function register({ name, email, password, starting_location }) {
  return api.post('/users', { name, email, password, starting_location });
}

export function forgotPassword({ email }) {
  return api.post('/forgot-password', { email });
}

export function resetPassword({ token, new_password }) {
  return api.post('/reset-password', { token, new_password });
}
