# Goals Tracker – Frontend

React (Vite) app for the Goals API.

## Run

1. **Start the backend** first (from project root: `npm run dev`). It runs on port 3000 and listens on all interfaces.
2. **Start the frontend**:
   ```bash
   cd client
   npm run dev
   ```
3. Open the URL Vite prints:
   - **http://localhost:5173** or
   - **http://127.0.0.1:5173** (use this if localhost doesn’t work on your machine)

In dev, the frontend **proxies** `/auth`, `/users`, and `/goals` to the backend, so you don’t set `VITE_API_URL` unless the API is on another host/port.

## Google sign-in

In the **backend** `.env`, set:

- `FRONTEND_URL=http://localhost:5173`  
  or `FRONTEND_URL=http://127.0.0.1:5173` if you use 127.0.0.1 in the browser.

The backend redirects here after Google login to send the token to the app.
