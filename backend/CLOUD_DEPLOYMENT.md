# Soil2Crop cloud backend preparation

The Android app calls the Node/Express API directly. The laptop does not need to run the API after it has been deployed to a reachable HTTPS host and an APK has been built with that API URL.

## MongoDB Atlas

1. Create an Atlas project, cluster, database user, and database named `soil2crop`.
2. Restrict the database user's permissions to the application database. Use a unique generated password.
3. Configure Atlas Network Access for the selected API host's outbound addresses. If that host does not provide stable egress IPs, choose the narrowest network policy it supports and review the exposure before launch.
4. Copy the Atlas connection string into the API host's `MONGODB_URI` setting and URL-encode special characters in the username/password. Never put this URI in frontend variables or the APK.
5. Back up any existing development data separately. Atlas starts empty; the current memory database is ephemeral and is not automatically migrated.

## Node host (Render or equivalent)

Create a Node web service using `backend` as its root directory, `npm install` as its build command, and `npm start` as its start command. The server binds `0.0.0.0` and uses the platform's `PORT` value (with 5001 for local development).

Set these backend environment variables in the host dashboard:

- `NODE_ENV=production`
- `USE_MEMORY_DB=false`
- `MONGODB_URI` = the Atlas connection string
- `JWT_SECRET` = a cryptographically random value with at least 32 characters, generated in the host's secret manager
- `CORS_ORIGINS` = exact HTTPS web origins only, comma-separated; use an empty value if only Capacitor clients call the API
- `OPENWEATHER_API_KEY` only if the weather integration needs it

`MONGODB_DNS_SERVERS` is an optional comma-separated resolver override applied before Mongoose connects (including Atlas SRV/TXT lookups). Leave it unset on cloud hosts by default so the provider resolver is used. Configure it only if that host's DNS resolver is confirmed to fail; resolver IPs should be selected for that host/network rather than copied from a developer machine.

The server fails on startup if production memory mode, a missing Atlas URI, or a missing/short JWT secret is configured. `/health` reports service/database mode; do not treat it as an Atlas backup or data-integrity check. The host-assigned HTTPS service URL is not known until the service is created. Use that actual URL for the later mobile build; do not substitute a guessed host name.

## Crop catalog seed

After the Atlas URI has been set for a one-time administrative shell, run `npm run seed:crops` from `backend`. The seed uses `$setOnInsert` keyed by `cropId`: rerunning it adds missing project records and never overwrites existing crop values. Review the project-configured agronomic values before using them as production advice.

## Authentication and account migration

New registrations require name, mobile, district, language, and a password of at least 8 characters. Passwords are bcrypt-hashed; successful login returns a signed 30-day JWT. The signing secret remains backend-only. Farmer profiles, language updates, report upload/submission/listing, recommendations, verified crop advice, and feedback require a bearer token and enforce farmer ownership.

Accounts created by the old mobile-only flow have no password hash. They cannot use the new login, and there is no SMS/OTP provider in this project to prove ownership or safely issue them a password reset. Before importing those accounts and reports, choose a verified account migration/recovery process; do not set a shared/default password. For a new Atlas database, farmers can register through the app.

## Soil report file retention

Uploads stay in Multer memory storage and are parsed during the request. The original PDF/image bytes are not persisted; MongoDB stores extracted/entered report data and file metadata only. This deployment does not provide original-file download or recovery.

## Android release build gate

Configure `VITE_API_URL` in the frontend production build environment to the actual HTTPS API base URL (for example `https://<host-assigned-domain>`). Production frontend configuration rejects HTTP, localhost, and loopback values. Then build the frontend and sync/build the Android release. Do not use `.env.android.local` or the prior LAN APK for release. The final production APK remains unbuilt until the cloud API exists and its HTTPS URL has been verified.
