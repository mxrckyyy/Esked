# Esked

A free, offline-first web application that converts students' class schedules into
beautiful, readable, high-resolution phone wallpapers.

- React 18 + Vite
- Tailwind CSS
- vite-plugin-pwa (Workbox) for offline support
- IndexedDB (idb) for local persistence
- Vitest + React Testing Library

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm test` — run unit tests
- `npm run lint` — lint

## Current Implementation Status

Phases 0-6 implemented: scaffold, data layer, schedule management UI, Quick Add parser,
wallpaper rendering engine, preview/export, and PWA/offline support.

## Offline and Installation

Esked works offline after the first successful online visit. Schedule data stays on
your device in IndexedDB.

- Android/Chrome: use the in-app "Install app" prompt when available.
- iOS/Safari: Share menu -> Add to Home Screen.
- Offline reload and navigation are supported after first load.

## Privacy

All schedule data stays on the user's device. No backend, no accounts, no analytics.