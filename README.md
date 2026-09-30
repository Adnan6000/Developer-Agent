# Deepseek Agent Desktop

A lightweight Electron desktop application with an Antigravity-inspired interface and a Deepseek search integration stub.

## Setup

1. Open the workspace in VS Code.
2. Run `npm install`.
3. Set your Deepseek environment variables:
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_API_ENDPOINT` (optional; defaults to `https://api.deepseek.example.com/v1/search`)
4. Start the app with:
   ```bash
   npm start
   ```

## Notes

- The UI is built in `renderer/index.html`, `renderer/style.css`, and `renderer/app.js`.
- The Electron main process is in `main.js`.
- Deepseek search requests are proxied through `ipcMain` using `window.api.searchDeepseek(query)`.
- Replace the placeholder Deepseek endpoint with your real API URL.
