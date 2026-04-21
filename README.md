# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Socket.IO on Vercel

Socket works in a resilient mode:

- `VITE_API_BASE_URL` is required for REST API.
- `VITE_SOCKET_URL` is optional. If omitted, client reuses origin from `VITE_API_BASE_URL`.
- `VITE_SOCKET_PATH` is optional. If omitted, client auto-inferrs path from `VITE_API_BASE_URL`:
  - `.../api` -> `.../socket.io`
  - fallback default -> `/socket.io`

If socket cannot connect, chat still sends via REST API and data persists; realtime updates resume automatically when socket reconnects.

## Share Link SEO on Vercel

Project is configured so social bots (Facebook, Zalo, Messenger, Twitter/X, LinkedIn, Discord, Telegram, WhatsApp, etc.) receive server-rendered Open Graph/Twitter metadata instead of client-side SPA HTML.

How it works:

- Bot user agents are rewritten to `api/seo` via `vercel.json`.
- `api/seo` returns HTML with dynamic `<title>`, `description`, `og:*`, `twitter:*`, and canonical tags.
- For course detail routes (`/courses/:id`), function fetches real course data from backend API to build per-course share metadata.

Environment variables (Vercel):

- `SEO_API_BASE_URL` (recommended): backend API base URL (example: `https://your-domain.com/gateway/edunet/api`)
- Fallbacks if missing: `VITE_API_BASE_URL`, then `API_BASE_URL`

After adding/updating env vars, redeploy FE project so share metadata function uses the latest values.

Example:

- `VITE_API_BASE_URL=https://vietprodev.duckdns.org/gateway/edunet/api`
- `VITE_SOCKET_URL=https://vietprodev.duckdns.org`
- `VITE_SOCKET_PATH=/gateway/edunet/socket.io`

After updating variables, trigger a new Vercel deployment.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
