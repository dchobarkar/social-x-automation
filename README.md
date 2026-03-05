# Social X Automation

Automates commenting on posts using the X (Twitter) API and OpenAI.

This is a personal automation tool built to reduce repetitive manual
engagement. It runs locally and allows generating AI-powered replies and
posting them directly via the X API using OAuth 2.0 Authorization Code
Flow with PKCE.

---

## 🚀 What This Project Does

- Authenticates with X using OAuth 2.0 (Authorization Code Flow +
  PKCE)
- Stores access and refresh tokens securely (local JSON storage)
- Generates contextual replies using OpenAI
- Posts replies via X API v2
- Handles token refresh automatically
- Provides a minimal dashboard to control the full flow (shows “Connected to X” when logged in)

This project is intended for personal use only.

---

## 🏗 Tech Stack

- Next.js (App Router)
- X API v2
- OAuth 2.0 with PKCE
- OpenAI API
- Local JSON token storage

No separate backend server. Everything runs inside Next.js API routes.

---

## 📦 Installation

Clone the repository:

    git clone https://github.com/dchobarkar/social-x-automation.git
    cd social-x-automation

Install dependencies:

    pnpm install

---

## 🔐 Environment Variables

Create a `.env.local` file in the root:

    X_CLIENT_ID=YOUR_X_CLIENT_ID
    X_CLIENT_SECRET=YOUR_X_CLIENT_SECRET
    X_REDIRECT_URI=http://127.0.0.1:3000/api/auth/x/callback
    OPENAI_API_KEY=YOUR_OPENAI_KEY
    APP_BASE_URL=http://127.0.0.1:3000
    STATE_SECRET=random_long_string_here

**Important:** Use `127.0.0.1` instead of `localhost` for `X_REDIRECT_URI` and `APP_BASE_URL`.  
X’s OAuth does not accept `localhost` as a callback URL and will return 400 if you use it.

Never commit `.env.local` to GitHub.

---

## ▶ Running the Project

Start the development server:

    pnpm run dev

Visit:

    http://localhost:3000/dashboard

---

## 🧪 Usage Flow

1. Click Connect X Account
2. Approve OAuth permissions
3. Get tweets either by **search** (keyword query) or **load my home feed** (same as your X home/feed, with optional filters)
4. Generate AI reply variants (humorous / insightful)
5. Review, edit if needed, and post reply

Everything runs locally.

---

## 🛡 Security Notes

- Access tokens are never exposed to the frontend
- All X API calls are server-side
- Refresh tokens are handled automatically
- For production use, replace JSON storage with a secure database

---

## 📌 Current Scope

This project currently focuses on:

- Local execution
- Manual trigger commenting (search by keyword or load home feed)
- Optional filters: time range, exclude replies/retweets, max reply count, min author followers
- AI-assisted reply generation (humorous / insightful)
- Review and post replies

Future enhancements may include: auto scanning posts, scheduling replies, multi-account support, advanced prompt customization.

---

## ⚠ Disclaimer

This tool is intended for personal automation.\
You are responsible for complying with X's platform policies and rate
limits.

---

## 📜 License

MIT
