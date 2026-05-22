import { useEffect, useState } from 'react';

import { getUser } from '../api/users';
import { memberId, userLabel } from '../utils/display';

// Fetches display names for numeric user ids (GET /users/{id}).
export default function useUserNames(userIds) {
  const [namesById, setNamesById] = useState({});

  const key = (userIds || [])
    .map((m) => memberId(m))
    .filter((id) => id != null)
    .sort((a, b) => a - b)
    .join(',');

  useEffect(() => {
    const ids = key ? key.split(',').map((s) => Number(s)) : [];
    if (!ids.length) {
      setNamesById({});
      return;
    }

    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const profile = await getUser(id);
            return [id, profile?.name?.trim() || String(id)];
          } catch {
            return [id, String(id)];
          }
        })
      );
      if (!cancelled) setNamesById(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const labelFor = (userOrId) => userLabel(userOrId, namesById);

  return { namesById, labelFor };
}
