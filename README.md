# Plant Server

Simple Express backend for authentication (signup/login) using MongoDB.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.

2. Install dependencies and start server:

```powershell
cd server
npm install
npm run start
```

API Endpoints

- `POST /api/signup`  { name, email, password } -> { success, token, user }
- `POST /api/login`   { email, password } -> { success, token, user }
- `GET /api/me`       Protected, requires `Authorization: Bearer <token>` -> { user }

Notes

- This is a simple local dev backend. Passwords are hashed with bcrypt; tokens are JWTs.
- For production, secure secrets, use HTTPS, and configure proper CORS and rate-limiting.
