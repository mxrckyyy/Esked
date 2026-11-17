# Architecture

- `src/components/` — reusable UI components.
- `src/hooks/` — reusable stateful logic (custom hooks).
- `src/lib/` — pure business logic (no React).
- `src/storage/` — IndexedDB access and in-memory fallback.
- `src/rendering/` — Canvas wallpaper rendering.
- `public/` — static assets, PWA icons.
- `src/test/` — test setup.

Principles: separate UI, business logic, storage, and rendering. Keep schedule data local.