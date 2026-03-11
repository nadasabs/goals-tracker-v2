# How Middleware Works (Quick Idea)

Express processes a request in order:
1. request enters Express

2. middleware runs (logger runs here)

3. route runs (your GET/POST handler)

4. response is sent back

5. request ends

```next()``` means:

> "I’m done, go to the next middleware or route."

If you forget ```next()```, the request will get stuck.

Step-by-step Explanation (Based on Code Outline)
## 1) Create a function called ```logger```
```
function logger(req, res, next) {
```
Express middleware always has this shape:

- req = request (incoming)

- res = response (what you send back)

- next = function that continues the flow

## 2) Record start time
```
const start = Date.now();
```
- Date.now() gives the current time in milliseconds.

- This is how you measure how long the request takes.

Think:

> "Start the stopwatch."

## 3) Listen for when the response finishes
```
res.on("finish", () => {
```
This is the most important part.

```res.on("finish")``` means:

> "When Express is completely done sending the response to the client, run this code."

Why is this needed?

Because at the beginning of the request, you don’t know the final status code yet.

Example:

- A request might become 401 (auth error)

- or 500 (server crash)

- or 200 (success)

Only when it finishes do we know the final result.

## 4) Calculate duration
```
const duration = Date.now() - start;
```
This is stopwatch math:

- end time - start time = time spent

So if it prints ```12ms```, the request took 12 milliseconds.

## 5) Print the log line
```
console.log(
  `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
);
```

This line builds a string with useful information:
- new Date().toISOString() → timestamp (UTC time)
- req.method → GET / POST / PUT / DELETE
- req.originalUrl → full route path used
- res.statusCode → final status code (200, 201, 400, 401, 404, 500)
- duration → how long the request took

Example output:
- [2026-03-04T01:23:45.000Z] POST /users/login 200 - 9ms
- [2026-03-04T01:23:49.000Z] GET /goals 401 - 2ms

## 6) Continue request flow
```
next();
```
This is critical.

It tells Express:

> "Continue to the next middleware or route handler."

If you remove ```next()```, the request never reaches your routes.

## 7) Export the logger
```
module.exports = logger;
```

So you can use it in ```src/index.js```:

```
const logger = require("./middlewares/logger");
app.use(logger);
```
✅ Important: Put it before routes so it logs everything.

# Where to place it in index.js

Correct order:
```
app.use(express.json());
app.use(logger);        // logger before routes

app.use("/users", userRoutes);
app.use("/goals", goalsRoutes);

app.use(errorHandler);  // error handler last
```