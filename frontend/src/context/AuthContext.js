// AuthContext
// - Persists access_token + user in expo-secure-store.
// - Hydrates state on app launch (loading flag for splash gate).
// - Exposes signIn / signUp / signOut / refreshUser used by screens.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { setAuthToken } from '../api/client';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';

const TOKEN_KEY = 'convoy.access_token';
const USER_KEY = 'convoy.user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUserRaw] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);

        if (savedToken) {
          setAuthToken(savedToken);
          setToken(savedToken);
        }
        if (savedUserRaw) {
          try {
            setUser(JSON.parse(savedUserRaw));
          } catch {
            await SecureStore.deleteItemAsync(USER_KEY);
          }
        }
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const persistSession = useCallback(async (newToken, newUser) => {
    setAuthToken(newToken || null);
    setToken(newToken || null);
    setUser(newUser || null);

    if (newToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    if (newUser) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      const res = await authApi.login({ email, password });
      // Expected: { message, access_token, token_type, user: { id, name, email } }
      if (!res?.access_token || !res?.user) {
        throw { status: 0, message: 'Unexpected login response' };
      }
      await persistSession(res.access_token, res.user);
      return res.user;
    },
    [persistSession]
  );

  const signUp = useCallback(
    async ({ name, email, password, starting_location }) => {
      await authApi.register({ name, email, password, starting_location });
      // Backend register endpoint does not return a token, so we immediately log the user in.
      return signIn({ email, password });
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    await persistSession(null, null);
  }, [persistSession]);

  const refreshUser = useCallback(async () => {
    if (!user?.id) return null;
    const fresh = await usersApi.getUser(user.id);
    // We keep the same minimal shape we persist locally, but enrich with starting_location.
    const next = {
      id: fresh.id,
      name: fresh.name,
      email: fresh.email,
      starting_location: fresh.starting_location,
    };
    setUser(next);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(next));
    return fresh;
  }, [user?.id]);

  const value = useMemo(
    () => ({
      bootstrapping,
      token,
      user,
      isAuthenticated: !!token && !!user,
      signIn,
      signUp,
      signOut,
      refreshUser,
      setUser,
    }),
    [bootstrapping, token, user, signIn, signUp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
