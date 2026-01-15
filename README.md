# SmartOffice-Pro (Local Demo)

This repository contains a small client-side HR / office management demo app.

Overview
- UI: static HTML files + `styles.css` (modern glassmorphism theme).
- Client logic: `script.js` (localStorage-backed data layer, simple auth, UI helpers).
- Optional local API: `server.js` (Express server persisting to `data.json`).
- Entry: `index.html` (login page).

How data is stored
- By default the app uses `localStorage` keys:
  - `smartoffice_employees`, `smartoffice_attendance`, `smartoffice_leaves`, `smartoffice_tasks`
- `script.js` seeds mock data on first run.
- To use the optional API server, set `localStorage.smartoffice_api_base` to `http://localhost:3000`.

Run the demo locally
1. Open `index.html` in a browser (no server required), or
2. To use the backend API:

```bash
npm install
node server.js
# then set localStorage key in browser console:
# localStorage.setItem('smartoffice_api_base', 'http://localhost:3000')
```

Notes
- `package.json` lists dependencies; JSON does not support comments. See this README for context.
- This project is a demo. Replace client-side auth and localStorage persistence with a secure backend for production.
