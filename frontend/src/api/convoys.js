// Convoy API calls.
// Matches the backend:
//   POST  /convoys                              body: { leader_id, name? }
//   GET   /convoys/{convoy_id}                  -> { convoy: { id, name?, leader_id, created_at, members: [...] } }
//   POST  /convoys/{convoy_id}/join             body: { user_id }
//   POST  /convoys/{convoy_id}/leave            body: { user_id }
//   POST  /convoys/{convoy_id}/transfer-leadership  body: { current_leader_id, new_leader_id }
//   GET   /users/{user_id}/convoys              -> { user_id, convoys: [{ id, leader_id, created_at, is_leader, member_count }] }

import api from './client';

export function createConvoy(leaderId, { name } = {}) {
  const body = { leader_id: leaderId };
  const trimmed = name?.trim();
  if (trimmed) body.name = trimmed;
  return api.post('/convoys', body);
}

export function getConvoy(convoyId) {
  return api.get(`/convoys/${convoyId}`);
}

export function joinConvoy(convoyId, userId) {
  return api.post(`/convoys/${convoyId}/join`, { user_id: userId });
}

export function leaveConvoy(convoyId, userId) {
  return api.post(`/convoys/${convoyId}/leave`, { user_id: userId });
}

export function transferConvoyLeadership(convoyId, currentLeaderId, newLeaderId) {
  return api.post(`/convoys/${convoyId}/transfer-leadership`, {
    current_leader_id: currentLeaderId,
    new_leader_id: newLeaderId,
  });
}

export function listUserConvoys(userId) {
  return api.get(`/users/${userId}/convoys`);
}
