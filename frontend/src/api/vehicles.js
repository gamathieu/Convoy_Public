// Vehicle API calls.
// Matches the backend:
//   GET    /users/{user_id}/vehicles                       -> { user_id, garage: [...] }
//   POST   /users/{user_id}/vehicles                       body: { make, model, year }
//   PUT    /vehicles/{vehicle_id}                          body: { make?, model?, year? }
//   DELETE /vehicles/{vehicle_id}?user_id=...&requester_id=...

import api from './client';

export function listVehicles(userId) {
  return api.get(`/users/${userId}/vehicles`);
}

export function addVehicle(userId, { make, model, year }) {
  return api.post(`/users/${userId}/vehicles`, { make, model, year: Number(year) });
}

export function updateVehicle(vehicleId, patch) {
  const body = { ...patch };
  if (body.year !== undefined && body.year !== null && body.year !== '') {
    body.year = Number(body.year);
  }
  return api.put(`/vehicles/${vehicleId}`, body);
}

export function deleteVehicle(vehicleId, userId, requesterId) {
  return api.del(
    `/vehicles/${vehicleId}?user_id=${userId}&requester_id=${requesterId}`
  );
}
