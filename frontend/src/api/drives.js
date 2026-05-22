// Drive API calls.
// Matches the backend:
//   POST /convoys/{convoy_id}/drives           body: { name, starting_location, destination, date_time, creator_id }
//   GET  /drives/{drive_id}
//   POST /drives/{drive_id}/join               body: { user_id }
//   GET  /convoys/{convoy_id}/drives           -> { convoy_id, drives: [...] }
//   GET  /users/{user_id}/drives               -> { user_id, drives: [...] }

import api from './client';

export function createDrive(convoyId, { name, starting_location, destination, date_time, creator_id }) {
  return api.post(`/convoys/${convoyId}/drives`, {
    name,
    starting_location,
    destination,
    date_time,
    creator_id,
  });
}

export function getDrive(driveId) {
  return api.get(`/drives/${driveId}`);
}

export function joinDrive(driveId, userId) {
  return api.post(`/drives/${driveId}/join`, { user_id: userId });
}

export function listConvoyDrives(convoyId) {
  return api.get(`/convoys/${convoyId}/drives`);
}

export function listUserDrives(userId) {
  return api.get(`/users/${userId}/drives`);
}
