# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev
```

- `npm run dev` — Vite dev server on port 3000, opens a browser automatically.
- `npm run build` — production build to `dist/` (sourcemaps on).
- `npm run preview` — serve the built bundle.
- `npm run lint` — `eslint . --ext js,jsx --max-warnings 0`. **Note: there is no ESLint config file in the repo**, so this command currently fails. If lint is needed, an `.eslintrc.cjs` / `eslint.config.js` must be added first (the react, react-hooks, and react-refresh plugins are already installed).

There is no test framework in this project — no test runner, no test files.

Deployment is Vercel (`vercel.json` rewrites everything to `/` for client-side routing).

## Architecture

React 18 + Vite SPA (JSX, not TypeScript — `.tsx`/`typescript` appear in deps but only `src/hooks/global/useDebounce.tsx` uses it). Tailwind CSS, React Router v6, axios, socket.io-client, recharts, react-hot-toast.

### Configuration is centralized in `src/config/constants.js`

This file is the control panel for the whole app and is imported nearly everywhere. It holds:

- `API_CONFIG.baseURL` — the backend base URL, **hardcoded** (currently `https://api.fiveebusiness.com`; a commented-out localhost line sits above it). Changing environments means editing this constant, not an `.env`.
- `MENU_ITEMS` — drives the sidebar. Most entries are commented out; only Dashboard, User Management, Push Notifications, Tax Information (`/videos`), and Chat are live. **Adding a page requires adding both a `<Route>` in `src/App.jsx` and an entry here** — routes exist for many pages (Products, Orders, Transactions, Reports, Support tickets/email) that are unreachable from the nav.
- `COLOR_CONFIG` / `THEME_OPTIONS`, `PAGINATION_CONFIG`, `SECURITY_CONFIG` (login lockout, OTP), `AUTH_ROUTES`, `FEATURE_FLAGS`, `CHART_COLORS`.

### Theming

`ThemeContext` generates a 50–950 palette at runtime from `COLOR_CONFIG.*.hex` and writes it to CSS custom properties (`--color-primary-500`, etc.) on `<html>`. `tailwind.config.js` maps `primary.*` / `secondary.*` to those variables via `rgb(var(...) / <alpha-value>)`. So rebranding = change two hex values in constants. `darkMode: "class"`, and `THEME_OPTIONS.forceTheme` is currently `"light"`, which disables the toggle entirely — dark-mode classes throughout the JSX are inert until that is cleared.

### Provider nesting (`src/App.jsx`)

`ThemeProvider > AppProvider > UploadProvider > Router > AuthProvider > Routes`. Auth routes (`/auth/*`) are public; everything else is wrapped in `ProtectedRoute > Layout` with a nested `<Routes>`. `FloatingUploadProgress` sits outside the Router so upload progress survives navigation, backed by `UploadContext` (state persisted to `sessionStorage`).

### API layer — two coexisting patterns

1. **`src/lib/services.js`** (preferred). An axios instance with a request interceptor that attaches `Bearer ${localStorage.authToken}`, and a response interceptor that clears the token and hard-redirects to `/auth/login` on 401/403. `apiHandler` unwraps responses and throws when `responseData.status` is falsy, so callers get `{status, message, data}` or an `Error`. Exported as a single `api` object.
2. **Direct axios in components/hooks** — `Videos.jsx`, `UserManagement.jsx`, `Notifications.jsx`, `Dashboard.jsx`, `hooks/users/useGetAllUsers.js` build URLs from `API_CONFIG.baseURL` and read `localStorage.getItem("authToken")` by hand, bypassing both interceptors (no auto-logout on 401). New code should go through `api` in `services.js`.

`src/hooks/useApi.js` is a third, `fetch`-based layer that appears unused — don't extend it.

Note `services.js` `getOrders` references `API_CONFIG.pagination.defaultPageSize`, which does not exist (the constant is the top-level `PAGINATION_CONFIG`) — that call throws if used.

### Data-fetching hook convention

Feature hooks live in `src/hooks/<feature>/`. Each is a self-contained `useGetAllX` / `useXActions` that owns its own `loading`, data, `stats`, `totalPages`, `totalData` state, calls `api.*`, funnels failures into `handleError` from `src/utils/helpers.js` (which toasts), and re-runs via `useEffect` on `[page, limit, search, status]`. It returns the refetch function so callers can refresh after a mutation. There is no global data cache or query library — each hook fetches independently.

Some hooks are stubbed with large inline mock objects while the real `api.*` call is commented out (e.g. `hooks/products/useGetAllProducts.js`). Check for this before assuming a screen is wired to the backend.

### Auth

`AuthContext` stores `authToken` + `userData` in `localStorage` and implements client-side login throttling: failed attempts and a `lockedUntil` timestamp are kept in `localStorage`, locking the form for `SECURITY_CONFIG.lockoutDuration` after `maxLoginAttempts`. `user` is set from `response.data.role` on login but from `response.data.user` after OTP verification — an inconsistency to be aware of when reading user fields. `register` calls `api.register`, which is not exported from `services.js`.

### Realtime chat

Two independent implementations exist: `src/pages/ChatSupport.jsx` (mounted at `/support/chat`, the one the sidebar links to) uses `createSocket(token)` from `src/socket/socket.js`; `src/pages/Chat.jsx` (mounted at `/chat`, not in the nav) creates its own `io(...)` inline with a hardcoded URL and admin ID. Prefer `ChatSupport` + `src/socket/socket.js`. The socket URL is hardcoded separately from `API_CONFIG.baseURL` and must be updated alongside it.

### UI components

`src/components/ui/` holds hand-rolled primitives (`Button`, `Input`, `Select`, `Modal`, `Table`, `Badge`, `TagInput`, `ImageUploader`, …). Despite a large set of `@radix-ui/*` packages in `package.json`, these components do not use them — match the existing hand-rolled style rather than introducing Radix.

`src/components/common/DataTable.jsx` is the standard list surface: pass `data`, `columns`, plus **server-side** pagination/search props (`totalPages`, `totalData`, `currentPage`, `pageSize`, `searchTerm`, `onPageChange`, `onPageSizeChange`, `onSearch`) — it does not sort or filter locally. `StatsCard` renders the metric row above it.

### Video upload flow

`Videos.jsx` (labeled "Tax Information" in the nav) uploads via presigned S3 URLs: `GET /media/presigned-url` → `PUT` the file straight to S3 with an `onUploadProgress` handler wired into `UploadContext` → `POST /media/video` with the resulting metadata. Progress is surfaced by the app-level `FloatingUploadProgress`.
