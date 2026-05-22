# Convoy — Mobile (Expo)

React Native + Expo (SDK 54) JavaScript app for the Convoy FastAPI backend.

## Quick start

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press `a` / `i` in the terminal to open an emulator.

## Configuration

The API base URL is read from `EXPO_PUBLIC_API_URL` in `.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.103:8000
```

> Your phone must be on the same Wi-Fi as your backend machine when using a LAN IP.
> To use a public tunnel later (e.g. ngrok) just change the value — no code changes required.

There is also an `app.json` `extra.apiUrl` fallback used if the env var is missing.

## Backend the app talks to

- `POST /login`, `POST /users` for auth
- `GET /users/{id}` for profile (+ vehicles)
- `GET/POST/PUT/DELETE` `/vehicles` for the garage
- `POST /convoys`, `GET /convoys/{id}`, `POST /convoys/{id}/join`
- `GET /users/{id}/convoys` (list user's convoys)
- `POST /convoys/{id}/drives`, `GET /drives/{id}`, `POST /drives/{id}/join`
- `GET /convoys/{id}/drives` (drives in a convoy)
- `GET /users/{id}/drives` (all drives a user joined)

The JWT returned by `/login` is stored in `expo-secure-store` and attached as `Authorization: Bearer <token>` to every API call.

## Architecture

```
src/
  api/         Centralized HTTP client + per-resource service files
  components/  Reusable UI (Button, Input, Card, Avatar, Tag, EmptyState, ...)
  context/     AuthContext — secure persistent session
  hooks/       useApi (loading/error/data wrapper)
  navigation/  RootNavigator → AuthStack | MainStack (Tabs + modals)
  screens/     auth / home / convoys / drives / vehicles / profile
  styles/      Theme: colors, spacing, typography, radii, shadows
  utils/       format, validation
```

## Persistent auth

- `access_token` and the `user` object are saved in `expo-secure-store`.
- On app launch, `AuthContext` hydrates from secure store before rendering navigation.
- Logout fully clears both keys.

## Expo Go compatibility

Only Expo SDK-compatible libraries are used. No native modules outside Expo's managed set.
