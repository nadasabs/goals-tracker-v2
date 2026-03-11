# Goals Tracker – Tutorial for Each Test

Step-by-step instructions to run every test. Use a REST client (Postman, Thunder Client, Insomnia, or `curl`) for API tests. Base URL for API: **http://localhost:3000** (or your backend URL).

---

## Before you start

1. **Start the backend:** In project root run `npm run dev`. Wait for "Server running on http://localhost:3000".
2. **Start the frontend (for frontend tests):** Run `cd client && npm run dev`, open http://localhost:5173.
3. **REST client:** Install Postman/Thunder Client/Insomnia, or use `curl` in a terminal.

---

## 1. Server & health

### Test 1.1 – GET / (no auth)

**Steps:**
1. In your REST client: **GET** `http://localhost:3000/`
2. Send the request (no headers, no body).

**Expected:** Status **200**, response body: `Goals API running ✅`

**curl:** `curl http://localhost:3000/`

---

### Test 1.2 – Backend not running, frontend login

**Steps:**
1. Stop the backend (Ctrl+C in the terminal where `npm run dev` is running).
2. In the browser, open http://localhost:5173 and go to the login page.
3. Enter any email and password, click "Sign in".

**Expected:** An error message like "Could not reach server. Is the backend running on port 3000?" (or "Server unavailable...").

**After:** Start the backend again (`npm run dev`).

---

## 2. Auth – Register

### Test 2.1 – Register with valid email and password

**Steps:**
1. **Method:** POST  
2. **URL:** `http://localhost:3000/users/register`  
3. **Headers:** `Content-Type: application/json`  
4. **Body (raw JSON):**
   ```json
   {
     "email": "testuser@example.com",
     "password": "password123"
   }
   ```
5. Send the request.

**Expected:** Status **201**. Body has `message: "User created"` and `user` with `id`, `email`, `provider: "local"`.

---

### Test 2.2 – Register with same email again

**Steps:**
1. Use the same email you used in Test 2.1 (e.g. `testuser@example.com`).
2. **POST** `http://localhost:3000/users/register`  
3. **Body:** `{"email": "testuser@example.com", "password": "anotherpass"}`  
4. Send.

**Expected:** Status **409**, body: `{"message": "Email already registered"}`.

---

### Test 2.3 – Register with missing email

**Steps:**
1. **POST** `http://localhost:3000/users/register`  
2. **Body:** `{"password": "password123"}` (no `email`).  
3. Send.

**Expected:** Status **400**, message like "Email and password are required".

---

### Test 2.4 – Register with missing password

**Steps:**
1. **POST** `http://localhost:3000/users/register`  
2. **Body:** `{"email": "new@example.com"}` (no `password`).  
3. Send.

**Expected:** Status **400**, message like "Email and password are required".

---

### Test 2.5 – Register with password shorter than 6 characters

**Steps:**
1. **POST** `http://localhost:3000/users/register`  
2. **Body:** `{"email": "short@example.com", "password": "12345"}`  
3. Send.

**Expected:** Status **400**, validation error mentioning password (e.g. Path `password`).

---

### Test 2.6 – Register with invalid email format

**Steps:**
1. **POST** `http://localhost:3000/users/register`  
2. **Body:** `{"email": "not-an-email", "password": "password123"}`  
3. Send.

**Expected:** **400** or validation error, depending on your validation.

---

### Test 2.7 – Register with same email, different case

**Steps:**
1. Assume `testuser@example.com` already exists (from 2.1).
2. **POST** `http://localhost:3000/users/register`  
3. **Body:** `{"email": "TestUser@Example.com", "password": "password123"}`  
4. Send.

**Expected:** Status **409** (email is normalized to lowercase, so it’s the same user).

---

## 3. Auth – Login

### Test 3.1 – Login with valid email and password

**Steps:**
1. **POST** `http://localhost:3000/users/login`  
2. **Body:** `{"email": "testuser@example.com", "password": "password123"}`  
3. Send.

**Expected:** Status **200**. Body has `token` (long string) and `user` with `id`, `email`, `provider`, `passwordReset`. **Copy the `token`** for later tests.

---

### Test 3.2 – Login with wrong password

**Steps:**
1. **POST** `http://localhost:3000/users/login`  
2. **Body:** `{"email": "testuser@example.com", "password": "wrongpassword"}`  
3. Send.

**Expected:** Status **401**, `{"message": "Invalid email or password"}`.

---

### Test 3.3 – Login with email that does not exist

**Steps:**
1. **POST** `http://localhost:3000/users/login`  
2. **Body:** `{"email": "nobody@example.com", "password": "anything"}`  
3. Send.

**Expected:** Status **401**, "Invalid email or password".

---

### Test 3.4 – Login with missing email or password

**Steps:**
1. **POST** `http://localhost:3000/users/login`  
2. **Body:** `{"email": "test@example.com"}` (no password). Send.  
3. Then try **Body:** `{"password": "secret"}` (no email). Send.

**Expected:** Both return **400**, "Email and password are required".

---

### Test 3.5 – Login with Google-only user

**Steps:**
1. Create a user only via Google sign-in (no password ever set), or use an existing Google-only account.  
2. **POST** `http://localhost:3000/users/login` with that user’s email and any password.

**Expected:** **400**, message like "This account uses Google login. Please sign in with Google."

---

### Test 3.6 – Login with temp password after reset

**Steps:**
1. Request a password reset for a local user (Test 6.1).  
2. Get the temporary password from the email (or from your mailer logs if not using real email).  
3. **POST** `http://localhost:3000/users/login` with that email and the temp password.

**Expected:** **200**, token and `user` with `passwordReset: true`.

---

## 4. Auth – Google OAuth

### Test 4.1 – GET /auth/google redirects to Google

**Steps:**
1. In the browser, go to: `http://localhost:3000/auth/google`  
2. Or in REST client: **GET** `http://localhost:3000/auth/google` (follow redirects if possible).

**Expected:** You are redirected to a Google sign-in page (no 500 error).

---

### Test 4.2 – Complete Google sign-in (with FRONTEND_URL)

**Steps:**
1. In backend `.env` set `FRONTEND_URL=http://localhost:5173`.  
2. Open frontend at http://localhost:5173, click "Continue with Google".  
3. Sign in with Google and complete the flow.

**Expected:** You are redirected to `http://localhost:5173/auth/callback?token=...` and then to the Goals page (logged in).

---

### Test 4.3 – Google sign-in without FRONTEND_URL

**Steps:**
1. Remove or comment out `FRONTEND_URL` in backend `.env`, restart backend.  
2. In browser go to `http://localhost:3000/auth/google`, complete Google sign-in.

**Expected:** After Google redirects back, you see **200** with JSON: `token`, `user` (no redirect to frontend).

---

### Test 4.4 – Cancel or fail Google sign-in

**Steps:**
1. With `FRONTEND_URL` set, click "Continue with Google" on the frontend.  
2. On the Google page, cancel or choose an account that fails.

**Expected:** Redirect to `http://localhost:5173/login?error=google_failed` and an error message on the login page.

---

### Test 4.5 – New Google user (first sign-in)

**Steps:**
1. Use a Google account that has never been used with your app.  
2. Complete "Continue with Google" from the frontend (or hit `/auth/google` and then callback).

**Expected:** A new user is created with `provider: "google"`, email lowercased; you get a token and are logged in.

---

### Test 4.6 – Existing local user signs in with Google

**Steps:**
1. Register a user with email/password (e.g. `linktest@example.com`).  
2. Without logging in with password, use "Continue with Google" with the same email (same Google account).

**Expected:** Same user is used/updated (no duplicate); you get a token and are logged in.

---

## 5. Users – GET /users/me

### Test 5.1 – With valid token

**Steps:**
1. Login (Test 3.1) and copy the `token`.  
2. **GET** `http://localhost:3000/users/me`  
3. **Headers:** `Authorization: Bearer <paste-your-token>`  
4. Send.

**Expected:** **200**, user object (no `password` field).

---

### Test 5.2 – Without Authorization header

**Steps:**
1. **GET** `http://localhost:3000/users/me`  
2. Do **not** add any `Authorization` header.  
3. Send.

**Expected:** **401**, "Missing Authorization header".

---

### Test 5.3 – With invalid or malformed token

**Steps:**
1. **GET** `http://localhost:3000/users/me`  
2. **Headers:** `Authorization: Bearer invalid.token.here`  
3. Send.

**Expected:** **401**, "Invalid or expired token".

---

### Test 5.4 – With expired token

**Steps:**
1. Use a token that was issued a long time ago (or change `JWT_SECRET` so old tokens are invalid).  
2. **GET** `http://localhost:3000/users/me` with that token.

**Expected:** **401**, "Invalid or expired token".

---

### Test 5.5 – Valid token but user deleted

**Steps:**
1. Get a valid token, then delete that user from the database (e.g. via MongoDB Compass or shell).  
2. **GET** `http://localhost:3000/users/me` with that token.

**Expected:** **404**, "User not found".

---

## 6. Users – Request password reset

### Test 6.1 – Existing local user

**Steps:**
1. **POST** `http://localhost:3000/users/request-password-reset`  
2. **Body:** `{"email": "testuser@example.com"}` (use an existing local user).  
3. Send.

**Expected:** **200**, "Temporary password sent to email". If mailer is configured, that user receives the email.

---

### Test 6.2 – Email that does not exist

**Steps:**
1. **POST** `http://localhost:3000/users/request-password-reset`  
2. **Body:** `{"email": "doesnotexist@example.com"}`  
3. Send.

**Expected:** **404**, "User not found".

---

### Test 6.3 – Missing email

**Steps:**
1. **POST** `http://localhost:3000/users/request-password-reset`  
2. **Body:** `{}`  
3. Send.

**Expected:** **400**, "Email is required".

---

### Test 6.4 – Google-only user

**Steps:**
1. **POST** `http://localhost:3000/users/request-password-reset`  
2. **Body:** `{"email": "<google-only-user-email>"}`  
3. Send.

**Expected:** **400**, "This account uses Google login. Please sign in with Google."

---

## 7. Users – Update password

### Test 7.1 – Valid token and new password

**Steps:**
1. Login, copy token.  
2. **PUT** `http://localhost:3000/users/update-password`  
3. **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
4. **Body:** `{"newPassword": "mynewpassword123"}`  
5. Send.

**Expected:** **200**, "Password updated successfully".

---

### Test 7.2 – New password too short

**Steps:**
1. **PUT** `http://localhost:3000/users/update-password` with valid token.  
2. **Body:** `{"newPassword": "12345"}`  
3. Send.

**Expected:** **400**, "Password must be at least 6 characters".

---

### Test 7.3 – Missing newPassword

**Steps:**
1. **PUT** `http://localhost:3000/users/update-password` with valid token.  
2. **Body:** `{}`  
3. Send.

**Expected:** **400**, "New password is required".

---

### Test 7.4 – Without token

**Steps:**
1. **PUT** `http://localhost:3000/users/update-password` with **no** `Authorization` header.  
2. **Body:** `{"newPassword": "newpass123"}`  
3. Send.

**Expected:** **401**.

---

### Test 7.5 – Login with new password after update

**Steps:**
1. After Test 7.1, **POST** `http://localhost:3000/users/login`  
2. **Body:** `{"email": "testuser@example.com", "password": "mynewpassword123"}`  
3. Send.

**Expected:** **200**, new token.

---

## 8. Goals – Create

### Test 8.1 – With valid token, title and targetDate

**Steps:**
1. Get a token (login).  
2. **POST** `http://localhost:3000/goals`  
3. **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
4. **Body:**
   ```json
   {
     "title": "Learn Node.js",
     "targetDate": "2025-12-31"
   }
   ```
5. Send.

**Expected:** **201**, goal object with `_id`, `userId`, `title`, `targetDate`, default `status` and `progress`.

---

### Test 8.2 – With optional fields

**Steps:**
1. **POST** `http://localhost:3000/goals` with same headers as 8.1.  
2. **Body:**
   ```json
   {
     "title": "Run 5k",
     "description": "Complete a 5k run",
     "targetDate": "2025-06-15",
     "status": "in_progress",
     "progress": 30
   }
   ```
3. Send.

**Expected:** **201**, goal includes `description`, `status`, `progress`.

---

### Test 8.3 – Missing title

**Steps:**
1. **POST** `http://localhost:3000/goals` with valid token.  
2. **Body:** `{"targetDate": "2025-12-31"}`  
3. Send.

**Expected:** **400**, "Title and targetDate are required".

---

### Test 8.4 – Missing targetDate

**Steps:**
1. **POST** `http://localhost:3000/goals` with valid token.  
2. **Body:** `{"title": "My goal"}`  
3. Send.

**Expected:** **400**, "Title and targetDate are required".

---

### Test 8.5 – Without token

**Steps:**
1. **POST** `http://localhost:3000/goals` with **no** `Authorization` header.  
2. **Body:** `{"title": "A goal", "targetDate": "2025-12-31"}`  
3. Send.

**Expected:** **401**.

---

### Test 8.6 – User with passwordReset true

**Steps:**
1. Request password reset for a user (Test 6.1), then login with the temp password so that user has `passwordReset: true`.  
2. Use that user’s token to **POST** `http://localhost:3000/goals` with valid body.

**Expected:** **403**, "Password reset required. Please update your password."

---

### Test 8.7 – Invalid status

**Steps:**
1. **POST** `http://localhost:3000/goals` with valid token.  
2. **Body:** `{"title": "Goal", "targetDate": "2025-12-31", "status": "invalid_value"}`  
3. Send.

**Expected:** **400**, validation error.

---

### Test 8.8 – Progress out of range

**Steps:**
1. **POST** `http://localhost:3000/goals` with valid token.  
2. **Body:** `{"title": "Goal", "targetDate": "2025-12-31", "progress": 150}` then try `-10`.  
3. Send each.

**Expected:** **400**, validation error.

---

## 9. Goals – List

### Test 9.1 – With token, user has goals

**Steps:**
1. Create at least one goal (Test 8.1).  
2. **GET** `http://localhost:3000/goals`  
3. **Headers:** `Authorization: Bearer <token>`  
4. Send.

**Expected:** **200**, JSON array of goals for that user, newest first.

---

### Test 9.2 – With token, no goals

**Steps:**
1. Use a token for a user who has no goals (or delete all their goals).  
2. **GET** `http://localhost:3000/goals` with that token.

**Expected:** **200**, `[]`.

---

### Test 9.3 – Without token

**Steps:**
1. **GET** `http://localhost:3000/goals` with no `Authorization` header.

**Expected:** **401**.

---

## 10. Goals – Get one

### Test 10.1 – Own goal

**Steps:**
1. Create a goal (Test 8.1) and copy its `_id`.  
2. **GET** `http://localhost:3000/goals/<goal-id>`  
3. **Headers:** `Authorization: Bearer <token>`  
4. Send.

**Expected:** **200**, that goal object.

---

### Test 10.2 – Other user’s goal

**Steps:**
1. Create two users (A and B). Create a goal as user A and copy its id.  
2. Login as user B, get B’s token.  
3. **GET** `http://localhost:3000/goals/<user-A-goal-id>` with B’s token.

**Expected:** **404**, "Goal not found".

---

### Test 10.3 – Invalid ObjectId

**Steps:**
1. **GET** `http://localhost:3000/goals/notavalidid` with valid token.

**Expected:** **400**, "Invalid ID format" (or similar).

---

### Test 10.4 – Valid id but no matching goal

**Steps:**
1. Use a valid 24-char hex ObjectId that doesn’t exist (e.g. `000000000000000000000001`).  
2. **GET** `http://localhost:3000/goals/000000000000000000000001` with valid token.

**Expected:** **404**, "Goal not found".

---

### Test 10.5 – Without token

**Steps:**
1. **GET** `http://localhost:3000/goals/<any-valid-id>` with no `Authorization` header.

**Expected:** **401**.

---

## 11. Goals – Update

### Test 11.1 – Own goal, valid data

**Steps:**
1. Create a goal, copy `_id`.  
2. **PUT** `http://localhost:3000/goals/<goal-id>`  
3. **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
4. **Body:** `{"title": "Updated title", "targetDate": "2025-12-31"}`  
5. Send.

**Expected:** **200**, updated goal.

---

### Test 11.2 – Update optional fields

**Steps:**
1. **PUT** `http://localhost:3000/goals/<goal-id>` with token.  
2. **Body:** `{"title": "Same", "targetDate": "2025-12-31", "description": "New desc", "status": "completed", "progress": 100}`  
3. Send.

**Expected:** **200**, goal reflects new values.

---

### Test 11.3 – Missing title or targetDate

**Steps:**
1. **PUT** with **Body:** `{"targetDate": "2025-12-31"}` (no title).  
2. Then **Body:** `{"title": "Title"}` (no targetDate).

**Expected:** **400** each time, "Title and targetDate are required".

---

### Test 11.4 – Other user’s goal

**Steps:**
1. Use user B’s token and user A’s goal id in **PUT** `http://localhost:3000/goals/<user-A-goal-id>`.

**Expected:** **404**, "Goal not found".

---

### Test 11.5 – User with passwordReset true

**Steps:**
1. Use token of a user who logged in with temp password (passwordReset: true).  
2. **PUT** `http://localhost:3000/goals/<own-goal-id>` with valid body.

**Expected:** **403**, "Password reset required...".

---

### Test 11.6 – Without token

**Steps:**
1. **PUT** `http://localhost:3000/goals/<goal-id>` with no `Authorization` header.

**Expected:** **401**.

---

## 12. Goals – Delete

### Test 12.1 – Own goal

**Steps:**
1. Create a goal, copy `_id`.  
2. **DELETE** `http://localhost:3000/goals/<goal-id>`  
3. **Headers:** `Authorization: Bearer <token>`  
4. Send.

**Expected:** **200**, e.g. `{"message": "Goal deleted"}`. **GET** /goals should no longer include that goal.

---

### Test 12.2 – Other user’s goal

**Steps:**
1. **DELETE** `http://localhost:3000/goals/<other-user-goal-id>` with your token.

**Expected:** **404**, "Goal not found".

---

### Test 12.3 – User with passwordReset true

**Steps:**
1. Use token of user with passwordReset: true.  
2. **DELETE** `http://localhost:3000/goals/<own-goal-id>`.

**Expected:** **403**, "Password reset required...".

---

### Test 12.4 – Without token

**Steps:**
1. **DELETE** `http://localhost:3000/goals/<goal-id>` with no `Authorization` header.

**Expected:** **401**.

---

## 13. Error handler

### Test 13.1 – Validation error (invalid enum)

**Steps:**
1. **POST** `http://localhost:3000/goals` with valid token.  
2. **Body:** `{"title": "X", "targetDate": "2025-12-31", "status": "invalid_status"}`  
3. Send.

**Expected:** **400**, `message` (string or array) describing validation error.

---

### Test 13.2 – Duplicate key

**Steps:**
1. **POST** `http://localhost:3000/users/register` twice with the same email (Test 2.2).

**Expected:** **409**, duplicate/conflict message.

---

### Test 13.3 – Invalid ObjectId

**Steps:**
1. **GET** `http://localhost:3000/goals/abc` with valid token.

**Expected:** **400**, "Invalid ID format".

---

## 14. Frontend – App & routing

### Test 14.1 – Open app without token

**Steps:**
1. Clear localStorage (or use a private window): F12 → Application → Local Storage → clear.  
2. Open http://localhost:5173.

**Expected:** You see the login page (or are redirected to `/login`).

---

### Test 14.2 – Open /goals or /profile without token

**Steps:**
1. With no token (cleared storage), go to http://localhost:5173/goals.  
2. Then try http://localhost:5173/profile.

**Expected:** Redirect to login in both cases.

---

### Test 14.3 – After login, redirect to Goals

**Steps:**
1. On login page, enter valid email and password, click "Sign in".

**Expected:** You are redirected to the Goals page.

---

### Test 14.4 – Header shows email and Sign out

**Steps:**
1. After logging in, look at the top of the page.

**Expected:** Your email is shown and there is a "Sign out" (or similar) control.

---

### Test 14.5 – Sign out

**Steps:**
1. While logged in, click "Sign out".  
2. Then try to open http://localhost:5173/goals.

**Expected:** After sign out you are on the login page; visiting `/goals` redirects back to login.

---

## 15. Frontend – Register & login

### Test 15.1 – Register new user

**Steps:**
1. Open http://localhost:5173.  
2. Click "Sign up" (or go to /register).  
3. Enter email and password (min 6 chars), submit.

**Expected:** Success, then you are on the Goals page.

---

### Test 15.2 – Login with that user

**Steps:**
1. Sign out.  
2. Enter the same email and password, click "Sign in".

**Expected:** You are on the Goals page.

---

### Test 15.3 – Wrong password

**Steps:**
1. On login page, enter correct email and wrong password.  
2. Click "Sign in".

**Expected:** Error message: "Invalid email or password".

---

### Test 15.4 – Continue with Google

**Steps:**
1. On login (or register) page, click "Continue with Google".  
2. Complete Google sign-in (with FRONTEND_URL set in backend).

**Expected:** Redirect to Google, then back to app; you are on Goals and logged in.

---

### Test 15.5 – Google failure

**Steps:**
1. Click "Continue with Google", then cancel or fail on the Google page.

**Expected:** You return to the login page with an error (e.g. google_failed).

---

### Test 15.6 – Sign up / Sign in links

**Steps:**
1. On login page, click "Sign up" (or similar).  
2. On register page, click "Sign in" (or similar).

**Expected:** You switch between `/login` and `/register` without errors.

---

## 16. Frontend – Goals

### Test 16.1 – Add goal

**Steps:**
1. Log in.  
2. Click "Add goal".  
3. Fill title and target date (optionally description, status, progress).  
4. Submit (Create/Save).

**Expected:** The new goal appears in the list.

---

### Test 16.2 – Edit goal

**Steps:**
1. On Goals page, click "Edit" on a goal.  
2. Change title or other fields, save.

**Expected:** Modal opens; after save the list shows the updated goal.

---

### Test 16.3 – Delete goal

**Steps:**
1. Click "Delete" on a goal.  
2. Confirm in the dialog.

**Expected:** Goal disappears from the list.

---

### Test 16.4 – Empty state

**Steps:**
1. Log in as a user with no goals (or delete all goals).  
2. Open the Goals page.

**Expected:** Message like "No goals yet" and a button like "Add your first goal".

---

### Test 16.5 – Goals order

**Steps:**
1. Add several goals with different dates.  
2. Look at the list order.

**Expected:** Newest goal first.

---

### Test 16.6 – 403 password reset

**Steps:**
1. Request password reset for your user, then log in with the temp password.  
2. Go to Goals and try to add or edit a goal.

**Expected:** Message that you must update your password (e.g. in Profile).

---

## 17. Frontend – Profile

### Test 17.1 – Profile shows email and login type

**Steps:**
1. Log in.  
2. Go to Profile (link in header or /profile).

**Expected:** Your email and login type (Google or Email & password) are shown.

---

### Test 17.2 – Update password

**Steps:**
1. On Profile, fill "New password" and "Confirm password" (≥ 6 chars, matching).  
2. Click "Update password".

**Expected:** Success message. Sign out and sign in with the new password; it works.

---

### Test 17.3 – Update password – mismatch

**Steps:**
1. Enter different values in "New password" and "Confirm password".  
2. Submit.

**Expected:** Error like "Passwords do not match".

---

### Test 17.4 – Request temporary password (valid email)

**Steps:**
1. On Profile, in "Forgot password?" section enter your (local) email.  
2. Submit "Send temporary password".

**Expected:** Success message (and email if mailer is set up).

---

### Test 17.5 – Request temporary password (unknown email)

**Steps:**
1. Enter an email that is not registered.  
2. Submit.

**Expected:** Error from API (e.g. "User not found").

---

## 18. Password reset flow (end-to-end)

### Test 18.1 – Request reset → get temp password → login

**Steps:**
1. Request password reset for a local user (Profile or API).  
2. Get the temp password from email or logs.  
3. Log in on the frontend with that email and temp password.

**Expected:** Login succeeds.

---

### Test 18.2 – Blocked until password updated

**Steps:**
1. While logged in with the temp password, go to Goals.  
2. Try to add or edit a goal.

**Expected:** 403 or UI message: must update password first.

---

### Test 18.3 – Update password in Profile

**Steps:**
1. Go to Profile.  
2. Set a new password (and confirm), submit.

**Expected:** Success message.

---

### Test 18.4 – Goals work after update

**Steps:**
1. After updating password (18.3), go back to Goals.  
2. Add or edit a goal.

**Expected:** Request succeeds; no 403.

---

## 19. Quick smoke checklist (minimal pass)

**API (REST client):**
1. **GET** http://localhost:3000/ → 200.  
2. **POST** /users/register with email + password → 201.  
3. **POST** /users/login with same credentials → 200, copy token.  
4. **GET** /users/me with `Authorization: Bearer <token>` → 200.  
5. **POST** /goals with token, body `{"title":"Smoke goal","targetDate":"2025-12-31"}` → 201, copy goal `_id`.  
6. **GET** /goals with token → 200, array contains the new goal.  
7. **PUT** /goals/<id> with token, body `{"title":"Updated","targetDate":"2025-12-31"}` → 200.  
8. **DELETE** /goals/<id> with token → 200.

**Frontend (browser):**
1. Open http://localhost:5173 → login page.  
2. Login → Goals page.  
3. Add goal → appears in list.  
4. Edit goal → changes saved.  
5. Delete goal → removed.  
6. Profile → Update password → success.  
7. Sign out → back to login; /goals redirects to login.

---

*Use this file together with TEST-LIST.md: TEST-LIST.md has the short table; TEST-TUTORIALS.md has the step-by-step instructions for each test.*
