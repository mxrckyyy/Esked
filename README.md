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

Phases 0-5 implemented: scaffold, data layer, schedule management UI, customization,
templates/themes, canvas rendering and PNG export. PWA configured.

## Privacy

All schedule data stays on the user's device. No backend, no accounts, no analytics.