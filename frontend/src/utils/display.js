// Labels for convoys and users. Uses `name` when the API provides it; otherwise falls back to id.

export function convoyLabel(convoy) {
  if (convoy == null) return 'Convoy';
  const name = typeof convoy === 'string' ? convoy : convoy.name?.trim();
  if (name) return name;
  const id = typeof convoy === 'object' ? convoy.id ?? convoy.convoy_id : null;
  return id != null ? String(id) : 'Convoy';
}

export function userLabel(userOrId, nameById = {}) {
  if (userOrId != null && typeof userOrId === 'object') {
    const name = userOrId.name?.trim();
    if (name) return name;
    if (userOrId.id != null) return String(userOrId.id);
  }
  const id = userOrId;
  const mapped = nameById[id]?.trim();
  if (mapped) return mapped;
  return id != null ? String(id) : 'User';
}

export function memberId(member) {
  return typeof member === 'object' && member != null ? member.id : member;
}
