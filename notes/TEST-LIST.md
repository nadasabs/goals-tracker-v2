# Goals Tracker – Full Test List

Use this list to test the API (backend) and the app (frontend) manually.  
**Prerequisites:** Backend running (`npm run dev`), frontend running (`cd client && npm run dev`), MongoDB connected.

---

## 1. Server & health

| # | Test | Expected |
|---|------|----------|
| 1.1 | `GET /` (no auth) | `200`, body: "Goals API running ✅" |
| 1.2 | Backend not running, then open frontend and try login | Frontend shows: "Could not reach server..." or "Server unavailable..." |

---

## 2. Auth – Register (`POST /users/register`)

| # | Test | Expected |
|---|------|----------|
| 2.1 | Register with valid `email` + `password` (min 6 chars) | `201`, `message: "User created"`, `user` with `id`, `email`, `provider: "local"` |
| 2.2 | Register with same email again | `409`, `message: "Email already registered"` |
| 2.3 | Register with missing `email` | `400`, "Email and password are required" |
| 2.4 | Register with missing `password` | `400`, "Email and password are required" |
| 2.5 | Register with password &lt; 6 characters | `400`, validation error (Path `password` …) |
| 2.6 | Register with invalid email format (if validated) | `400` or validation error |
| 2.7 | Register with email in different case than existing user (e.g. Test@x.com vs test@x.com) | `409` (treated as same user) |

---

## 3. Auth – Login (`POST /users/login`)

| # | Test | Expected |
|---|------|----------|
| 3.1 | Login with valid email + password (local user) | `200`, `token`, `user` (id, email, provider, passwordReset) |
| 3.2 | Login with wrong password | `401`, "Invalid email or password" |
| 3.3 | Login with email that does not exist | `401`, "Invalid email or password" |
| 3.4 | Login with missing email or password | `400`, "Email and password are required" |
| 3.5 | Login with email of a Google-only user (no password set) | `400`, "This account uses Google login. Please sign in with Google." |
| 3.6 | Login with correct temp password after "request password reset" | `200`, token, `user.passwordReset: true` |

---

## 4. Auth – Google OAuth

| # | Test | Expected |
|---|------|----------|
| 4.1 | `GET /auth/google` | Redirect to Google sign-in (no 500) |
| 4.2 | Complete Google sign-in (with `FRONTEND_URL` set) | Redirect to `{FRONTEND_URL}/auth/callback?token=...` |
| 4.3 | Complete Google sign-in (no `FRONTEND_URL`) | `200` JSON with `token`, `user` |
| 4.4 | Cancel or fail Google sign-in (with `FRONTEND_URL`) | Redirect to `{FRONTEND_URL}/login?error=google_failed` |
| 4.5 | New Google user: first sign-in creates user with `provider: "google"`, correct email (lowercased) | User created, token returned |
| 4.6 | Existing local user signs in with Google (same email) | Same user updated/linked, token returned (no duplicate user) |

---

## 5. Users – Get current user (`GET /users/me`)

| # | Test | Expected |
|---|------|----------|
| 5.1 | With valid `Authorization: Bearer <token>` | `200`, user object (no `password`) |
| 5.2 | Without `Authorization` header | `401`, "Missing Authorization header" |
| 5.3 | With invalid or malformed token | `401`, "Invalid or expired token" |
| 5.4 | With expired token | `401`, "Invalid or expired token" |
| 5.5 | With valid token but user deleted from DB | `404`, "User not found" |

---

## 6. Users – Request password reset (`POST /users/request-password-reset`)

| # | Test | Expected |
|---|------|----------|
| 6.1 | With existing local user email | `200`, "Temporary password sent to email" (email sent if mailer configured) |
| 6.2 | With email that does not exist | `404`, "User not found" |
| 6.3 | With missing email | `400`, "Email is required" |
| 6.4 | With Google-only user email | `400`, "This account uses Google login. Please sign in with Google." |

---

## 7. Users – Update password (`PUT /users/update-password`)

| # | Test | Expected |
|---|------|----------|
| 7.1 | With valid token + valid `newPassword` (≥ 6 chars) | `200`, "Password updated successfully" |
| 7.2 | With valid token + `newPassword` &lt; 6 characters | `400`, "Password must be at least 6 characters" |
| 7.3 | With valid token + missing `newPassword` | `400`, "New password is required" |
| 7.4 | Without token | `401` |
| 7.5 | After update, login with new password | `200`, token; `passwordReset` can be false |

---

## 8. Goals – Create (`POST /goals`)

| # | Test | Expected |
|---|------|----------|
| 8.1 | With valid token + `title` + `targetDate` | `201`, goal with `userId`, `title`, `targetDate`, default `status`/`progress` |
| 8.2 | With valid token + optional `description`, `status`, `progress` | `201`, goal includes those fields |
| 8.3 | With valid token, missing `title` | `400`, "Title and targetDate are required" |
| 8.4 | With valid token, missing `targetDate` | `400`, "Title and targetDate are required" |
| 8.5 | Without token | `401` |
| 8.6 | With token of user who has `passwordReset: true` | `403`, "Password reset required. Please update your password." |
| 8.7 | With invalid `status` (e.g. "invalid") | `400`, validation error |
| 8.8 | With `progress` &lt; 0 or &gt; 100 | `400`, validation error |

---

## 9. Goals – List (`GET /goals`)

| # | Test | Expected |
|---|------|----------|
| 9.1 | With valid token, user has goals | `200`, array of goals for that user only, newest first |
| 9.2 | With valid token, user has no goals | `200`, `[]` |
| 9.3 | Without token | `401` |

---

## 10. Goals – Get one (`GET /goals/:id`)

| # | Test | Expected |
|---|------|----------|
| 10.1 | With valid token, goal belongs to user | `200`, that goal |
| 10.2 | With valid token, goal belongs to another user | `404`, "Goal not found" |
| 10.3 | With valid token, invalid ObjectId format | `400`, "Invalid ID format" or validation error |
| 10.4 | With valid token, valid format but no matching goal | `404`, "Goal not found" |
| 10.5 | Without token | `401` |

---

## 11. Goals – Update (`PUT /goals/:id`)

| # | Test | Expected |
|---|------|----------|
| 11.1 | With valid token, own goal, valid `title` + `targetDate` | `200`, updated goal |
| 11.2 | With valid token, own goal, optional fields updated | `200`, goal reflects new values |
| 11.3 | With valid token, missing `title` or `targetDate` | `400`, "Title and targetDate are required" |
| 11.4 | With valid token, other user's goal id | `404`, "Goal not found" |
| 11.5 | With token of user with `passwordReset: true` | `403`, "Password reset required..." |
| 11.6 | Without token | `401` |

---

## 12. Goals – Delete (`DELETE /goals/:id`)

| # | Test | Expected |
|---|------|----------|
| 12.1 | With valid token, own goal | `200`, "Goal deleted" |
| 12.2 | With valid token, other user's goal id | `404`, "Goal not found" |
| 12.3 | With token of user with `passwordReset: true` | `403`, "Password reset required..." |
| 12.4 | Without token | `401` |

---

## 13. Error handler (global)

| # | Test | Expected |
|---|------|----------|
| 13.1 | Trigger Mongoose validation error (e.g. invalid enum) | `400`, `message` (string or array of messages) |
| 13.2 | Trigger duplicate key (e.g. register same email twice) | `409`, "Duplicate value error" or similar |
| 13.3 | Invalid ObjectId in goal id | `400`, "Invalid ID format" |

---

## 14. Frontend – App & routing

| # | Test | Expected |
|---|------|----------|
| 14.1 | Open app (e.g. http://localhost:5173) without token | Redirect to `/login` or show login |
| 14.2 | Open `/goals` or `/profile` without token | Redirect to `/login` |
| 14.3 | After login, redirect to `/goals` | Goals page loads |
| 14.4 | Header shows email and "Sign out" when logged in | Correct email, Sign out works |
| 14.5 | Sign out | Redirect to login, token cleared; visiting `/goals` redirects to login |

---

## 15. Frontend – Register & login

| # | Test | Expected |
|---|------|----------|
| 15.1 | Register new user (email + password) | Success, then on Goals page |
| 15.2 | Login with that user | Success, Goals page |
| 15.3 | Wrong password | Error message: "Invalid email or password" |
| 15.4 | "Continue with Google" (with backend `FRONTEND_URL`) | Redirect to Google, then back to app with token, on Goals |
| 15.5 | Login with Google failure (cancel) | Back on login with error message (e.g. google_failed) |
| 15.6 | Link "Sign up" / "Sign in" | Navigate between `/register` and `/login` |

---

## 16. Frontend – Goals

| # | Test | Expected |
|---|------|----------|
| 16.1 | Add goal (title + target date, optional description/status/progress) | Goal appears in list |
| 16.2 | Edit goal | Modal opens, save updates list |
| 16.3 | Delete goal, confirm | Goal removed from list |
| 16.4 | Empty state (no goals) | Message + "Add your first goal" (or similar) |
| 16.5 | Goals sorted by newest first | Order correct |
| 16.6 | 403 (password reset required) | Message to update password (e.g. Profile) |

---

## 17. Frontend – Profile

| # | Test | Expected |
|---|------|----------|
| 17.1 | Profile shows current email and login type | Correct email, "Google" or "Email & password" |
| 17.2 | Update password (new + confirm, ≥ 6 chars) | Success message; can login with new password |
| 17.3 | Update password with mismatch | Error (e.g. "Passwords do not match") |
| 17.4 | Request temporary password (valid email) | Success message (email sent if configured) |
| 17.5 | Request temporary password (unknown email) | Error from API shown |

---

## 18. Password reset flow (end-to-end)

| # | Test | Expected |
|---|------|----------|
| 18.1 | Request password reset for local user → get temp password (email or logs) → login with temp password | Login succeeds |
| 18.2 | After login with temp password, try to create/edit/delete goal | `403` or UI message: must update password |
| 18.3 | Go to Profile → Update password → set new password | Success |
| 18.4 | After update, create/edit goal | Allowed, no 403 |

---

## 19. Quick smoke checklist (minimal pass)

- [ ] Backend: `GET /` returns 200.
- [ ] Register → Login → get token.
- [ ] `GET /users/me` with token returns user.
- [ ] `POST /goals` with token creates goal.
- [ ] `GET /goals` returns list including new goal.
- [ ] `PUT /goals/:id` updates goal.
- [ ] `DELETE /goals/:id` deletes goal.
- [ ] Frontend: Login → Goals → Add goal → Edit → Delete → Profile → Update password → Sign out.

---

*Last updated for goals-tracker-v2 (Express backend + React frontend).*
