# Google OAuth Config (passportGoogle.js)

This file’s job is:

✅ **Teach Passport how to log users in with Google**  
✅ When Google sends back a user profile, this file decides:
- Do we already have this user in MongoDB?
- If not, create them
- Then return the user back to Passport

---
## How Google Login Works (Big Picture)

1) When someone goes to this route in the browser:

```
GET /auth/google
```

2) Passport redirects them to Google.

3) Google asks the user to login + consent.

4) Then Google redirects back to your server to this callback route:
```
GET /auth/google/callback
```
5. At that moment, Passport runs the code in this file.


## Step-by-step Explanation (Based on the Code Outline)
### 1) Import GoogleStrategy
```
const GoogleStrategy = require("passport-google-oauth20").Strategy;
```
Passport uses “strategies” as different login methods.

GoogleStrategy is a strategy that knows how to talk to Google OAuth.

> Think:
Strategy = login method (Google, Facebook, local password, etc.)

### 2) Import the User model
```
const User = require("../models/User");
```

This lets you:

search users in MongoDB

create users in MongoDB

So the moment Google proves the person is real, you can store them as a user.

### 3) Export a setup function
```
module.exports = function setupGooglePassport(passport) {
```
This file exports a function because your app will do something like:

```
setupGooglePassport(passport);
```
That means:

you configure passport in one place

and the server becomes cleaner

### 4) Register the Google strategy inside passport
``` 
passport.use(
  new GoogleStrategy(...)
);
```
This tells Passport:

“When someone logs in using Google, use this strategy.”

### 5) Strategy config object (clientID, secret, callback)
```
{
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}
```

These values come from your .env.

- clientID: identifies your app to Google

- clientSecret: proves your app is trusted (keep secret)

- callbackURL: where Google redirects after login

> ⚠️ The callbackURL must match Google Cloud Console exactly.

### 6) Verify callback function (MOST IMPORTANT PART)
```
async (_accessToken, _refreshToken, profile, done) => { ... }
```
This function runs after Google login succeeds.

profile = Google user information (name, email, id)

done() = a callback function you must call at the end:

- done(null, user) ✅ success

- done(err) ❌ error

Why _accessToken and _refreshToken have underscore?

Because you’re not using them.
Underscore is a common way to say:

> “I receive this value but I don’t use it.”

### 7) Extract email and name from Google profile
```
const email = profile.emails?.[0]?.value;
const name = profile.displayName || "";
```
profile.emails could be undefined in some cases

```?.``` prevents crashing if it’s missing

[0] takes the first email

### 8) If no email, fail login
```
if (!email) return done(null, false);
```
Meaning:

“We cannot create a user without email, so login fails.”

### 9) Find user in MongoDB
```
let user = await User.findOne({ email });
```
This checks:

- has this person logged in before?

- We use email as the main “unique identity”.

### 10) If user doesn't exist → create it
```
if (!user) {
  user = await User.create({
    email,
    name,
    provider: "google",
    googleId: profile.id,
  });
}
```

This saves a new user document like:

- email: someone@gmail.com

- name: Someone Name

- provider: "google"

- googleId: Google’s unique ID for them

### 11) If user exists → update some fields (optional)
```
else {
  user.googleId = user.googleId || profile.id;
  user.provider = user.provider || "google";
  user.name = user.name || name;
  await user.save();
}
```

This means:

- If they were created earlier (maybe from normal email/password login)

- You “attach” their Google data too

- And it avoids overwriting fields unnecessarily by using:

```
 A = A || B
```
Meaning:

If A is empty, use B. Otherwise keep A.

### 12) Return success to Passport
```return done(null, user);```

This tells Passport:

✅ Google login succeeded
✅ Here is the user object we found/created
✅ Continue the login process

### 13) Error handling
```
catch (err) {
  return done(err);
}
```

If anything fails (DB down, etc):

- Passport receives error

- Your route should handle it (usually returns 500 or redirects to error page)

- What You Must Have Elsewhere (for this to work)

- This file alone is not enough. Your server also needs:

- passport.initialize() in index.js

Auth routes like:

- GET /auth/google

- GET /auth/google/callback