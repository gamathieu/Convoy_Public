// User profile API calls.
// Matches the backend:
//   GET    /users/{user_id}
//   PUT    /users/{user_id}              body: { name?, email?, starting_location? }
//   DELETE /users/{user_id}?requester_id=...

import api from './client';

export function getUser(userId) {
  return api.get(`/users/${userId}`);
}

export function updateUser(userId, patch) {
  return api.put(`/users/${userId}`, patch);
}

export function deleteUser(userId, requesterId) {
  return api.del(`/users/${userId}?requester_id=${requesterId}`);
}
