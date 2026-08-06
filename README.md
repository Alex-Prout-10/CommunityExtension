# MILE-oh — Media Information and Literacy Extension

MILE-oh is a Chrome extension that teaches media literacy and flags safety signals such as suspicious links, possible AI-media signals, and misinformation signals. A flag is a prompt to investigate—not a claim that content is definitely false or harmful.

## How the pieces fit

```
Chrome extension popup  --HTTPS JSON-->  API server  --Prisma-->  PostgreSQL
       |                                      |
  chrome.storage.local                  validates request data
  (anonymous session ID)                before it reaches the database
```

The extension never has database credentials. It asks the API for an anonymous UUID session ID once and saves that ID in `chrome.storage.local`. The API stores quiz attempts and scan findings under that ID.

## Data we store

- `Session`: an anonymous UUID and timestamps; no account or personal profile.
- `QuizAttempt`: category, question snapshot, selected/correct answers, and result.
- `Scan`: the page **origin** (for example `https://example.com`), a 0–100 risk score, and time.
- `SafetyFinding`: the type, 1–5 severity, and short explanation for each scan signal.

Avoid saving full browsing URLs or page content by default—both can contain sensitive information. Add a clear opt-in before collecting either.

## Local setup

1. Obtain a direct PostgreSQL connection URL beginning with `postgresql://`. A Prisma Accelerate URL (`prisma+postgres://` or `accelerate.prisma-data.net`) is not enough for migrations or this API.
2. Copy the variables from `.env.example` into `.env` and set `DATABASE_URL` and `DIRECT_DATABASE_URL` to that direct URL.
3. Create the tables:

   ```powershell
   npx.cmd prisma migrate dev --name initial_safety_data
   ```

4. Start the API in one terminal:

   ```powershell
   npm.cmd run dev:api
   ```

5. In another terminal, build the extension:

   ```powershell
   npm.cmd run build
   ```

6. In Chrome, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `dist`.

The API is healthy when `http://localhost:3000/health` returns `{ "status": "ok" }`. Complete a quiz answer and the popup will create a session and save the attempt.

## Going live

Vite’s development server is only for building the extension; it is not the database server. For a public extension, deploy the API and PostgreSQL to a managed host, configure the host’s `DATABASE_URL`, run `prisma migrate deploy` in the deployment pipeline, then:

1. Set `VITE_API_URL` to the API’s HTTPS URL before running `npm.cmd run build`.
2. Replace the local `host_permissions` entry in `vite.config.ts` with that exact API origin, such as `https://api.example.com/*`.
3. Set `ALLOWED_ORIGINS` on the server to `chrome-extension://<your-published-extension-id>`.

Before publishing, add authentication or a signed anonymous token, rate limiting, data-retention/deletion controls, and a privacy policy. The current API is appropriate for local learning and a controlled prototype, not an open public endpoint.
