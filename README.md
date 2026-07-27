# Trimly

A production-grade URL shortener with real-time analytics, built on Next.js 16, React 19, and MongoDB.

Trimly lets users shorten URLs, track every click with granular analytics (geolocation, device, browser, bot/VPN detection), and provides an admin dashboard for platform-wide monitoring.

**Live Demo:** [trimly-pro.vercel.app](https://trimly-pro.vercel.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Features

**URL Management**
- Shorten any URL into an 8-character unique short link
- Copy short URLs to clipboard with one click
- Delete URLs from your dashboard at any time
- Support for optional password-protected links (schema ready)

**Click Analytics**
- Real-time click tracking on every redirect
- Geographic data: country, city, region, coordinates, ISP
- Device intel: browser, OS, device type, brand
- Security insights: bot detection, VPN/proxy flags, threat level
- Referrer and landing page tracking
- Session and unique visitor identification

**Authentication & User Management**
- Email/password registration with bcrypt hashing
- Google OAuth sign-in
- 6-digit OTP email verification (via Gmail SMTP)
- Forgot password flow with time-limited OTP (5-minute expiry)
- JWT-based session management

**Admin Dashboard**
- Platform-wide URL and click statistics
- Browse all shortened URLs across all users
- Deep-dive analytics per URL: top countries, browsers, referral sources, security overview
- Granular per-click traffic table with export capability

**UI/UX**
- Responsive design with mobile hamburger menu
- Tailwind CSS v4 styling
- Geist Sans + Geist Mono typography

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Database | [MongoDB](https://www.mongodb.com/) (Atlas) |
| ODM | [Mongoose 9](https://mongoosejs.com/) |
| Authentication | [NextAuth.js 4](https://next-auth.js.org/) |
| Email | [Nodemailer](https://nodemailer.com/) (Gmail SMTP) |
| Short ID | [nanoid](https://github.com/ai/nanoid) |
| Analytics Parsing | [ua-parser-js](https://github.com/nicktomlin/ua-parser-js) |
| HTTP Client | [Axios](https://axios-http.com/) |
| GeoIP | [ipinfo.io](https://ipinfo.io/) |

---

## Architecture

```
Browser
  |
  v
Next.js App Router (Vercel)
  |
  +-- Server Components  -->  Static pages, layouts
  +-- Client Components  -->  Interactive dashboards, auth forms
  +-- API Routes         -->  /api/url, /api/auth, /api/admin/*
  |
  v
MongoDB Atlas  <-->  Mongoose ODM
  |
  v
[shortUrl] route  -->  Redirect + analytics pipeline
                          |
                          +-- IP hashing (bcrypt)
                          +-- GeoIP lookup (ipinfo.io)
                          +-- UA parsing (ua-parser-js)
                          +-- Bot/VPN detection
                          +-- Write clickHistory to MongoDB
```

**Key design decisions:**
- **App Router only** -- no `pages/` directory; all routes use `app/` with `route.ts` handlers and `page.tsx` pages
- **JWT sessions** -- no database session store; session data embedded in signed JWT
- **Embedded click history** -- click events stored as subdocuments inside the `ShortUrl` document for fast single-document reads
- **IP hashing** -- raw IPs are never stored; bcrypt-hashed IPs protect user privacy

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- **MongoDB** instance (Atlas cluster or local)
- **Gmail** account with app password (for OTP emails)
- **Google Cloud** project with OAuth credentials (for Google sign-in)
- **ipinfo.io** account (for geolocation on click tracking)

### Installation

```bash
git clone https://github.com/mabdullah356/trimly.git
cd Trimly
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=<random-secret-string>
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Email (Gmail SMTP)
USER_EMAIL=your-gmail@gmail.com
USER_PASS=<16-char-gmail-app-password>

# Geolocation
IPINFO_TOKEN=<your-ipinfo-token>

# Application
APP_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Secret for encrypting JWTs (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL for NextAuth callbacks |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `USER_EMAIL` | Gmail address used to send OTP emails |
| `USER_PASS` | Gmail app password (not your account password) |
| `IPINFO_TOKEN` | API token from [ipinfo.io](https://ipinfo.io/) |
| `APP_URL` | Application base URL |

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
trimly/
|-- app/                          # Next.js App Router
|   |-- layout.tsx                # Root layout (fonts, session provider, header, footer)
|   |-- page.tsx                  # Homepage (hero + URL list)
|   |-- globals.css               # Tailwind CSS v4 entry
|   |
|   |-- [shortUrl]/
|   |   |-- route.ts              # Redirect handler + analytics tracking
|   |
|   |-- admin/
|   |   |-- page.tsx              # Admin dashboard
|   |   |-- url/[id]/page.tsx     # Per-URL analytics detail
|   |
|   |-- api/
|   |   |-- auth/
|   |   |   |-- [...nextauth]/route.ts   # NextAuth handler
|   |   |   |-- signups/route.ts         # User registration
|   |   |-- url/
|   |   |   |-- route.ts                 # Create / list URLs
|   |   |   |-- [id]/route.ts            # Delete URL
|   |   |-- admin/urls/
|   |   |   |-- route.ts                 # All URLs (admin)
|   |   |   |-- [id]/route.ts            # URL detail (admin)
|   |   |-- user/
|   |       |-- forgot-password/route.ts
|   |       |-- reset-password/route.ts
|   |       |-- verify-account/route.ts
|   |       |-- resend-verification-email/route.ts
|   |
|   |-- login/page.tsx            # Login page
|   |-- signups/page.tsx          # Registration page
|   |-- verify-account/[email]/   # OTP verification
|   |-- reset-password/page.tsx   # Password reset flow
|
|-- components/
|   |-- Header.tsx                # Auth-aware navbar
|   |-- Footer.tsx                # Site footer
|   |-- HeroSection.tsx           # URL shortening form
|   |-- Urls.tsx                  # User URL grid
|
|-- config/
|   |-- mongodb.ts                # Mongoose connection helper
|   |-- nextAuth.ts               # NextAuth configuration
|   |-- nodemailer.ts             # Email transporter + OTP utilities
|
|-- Models/
|   |-- user.model.ts             # User schema (with bcrypt pre-save)
|   |-- shortUrl.model.ts         # ShortUrl schema + click history
|
|-- Providers/
|   |-- sessionProvider.tsx       # Client-side SessionProvider wrapper
|
|-- types/
    |-- next-auth.d.ts            # NextAuth type augmentation
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signups` | Register a new user. Sends verification OTP email. |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth handler (sign in, sign out, session) |
| `POST` | `/api/user/verify-account` | Verify email with 6-digit OTP |
| `POST` | `/api/user/resend-verification-email` | Resend verification OTP |
| `POST` | `/api/user/forgot-password` | Send password reset OTP |
| `POST` | `/api/user/reset-password` | Verify OTP and update password |

### URL Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/url` | Required | Create a shortened URL |
| `GET` | `/api/url` | Required | List current user's URLs |
| `DELETE` | `/api/url/[id]` | Required | Delete a URL |

### Redirect

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/[shortUrl]` | Redirect to original URL and log click analytics |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/urls` | Admin | List all URLs across all users |
| `GET` | `/api/admin/urls/[id]` | Admin | Full click history for a URL |

### Utility

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/testDB` | Test MongoDB connection health |

---

## Database Models

### User

| Field | Type | Notes |
|---|---|---|
| `fullName` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required, bcrypt hashed |
| `type` | String | `"user"` or `"admin"` |
| `isVerified` | Boolean | Default `false` |
| `VerifyOtp` | String | 6-digit OTP code |
| `VerifyOtpExpire` | Date | 5-minute TTL |

### ShortUrl

| Field | Type | Notes |
|---|---|---|
| `userId` | String | Owner reference |
| `originalUrl` | String | Target URL |
| `shortUrl` | String | 8-char nanoid, unique, indexed |
| `customAlias` | String | Optional custom slug |
| `clicks` | Number | Denormalized click counter |
| `password` | String | Optional, excluded by default |
| `isActive` | Boolean | Toggle redirect on/off |
| `clickHistory` | Array | Embedded click event subdocuments |

### Click Event (subdocument)

Each entry in `clickHistory` captures:

| Field | Description |
|---|---|
| `timestamp` | Click time |
| `hashedIp` | Bcrypt-hashed visitor IP |
| `country`, `countryCode`, `city`, `region` | Geolocation |
| `lat`, `lon` | Coordinates |
| `browser`, `browserVersion` | Browser info |
| `os`, `osVersion` | Operating system |
| `device`, `deviceBrand` | Device type |
| `isp` | Internet service provider |
| `referrer`, `refererDomain` | Traffic source |
| `language`, `timezone` | Locale |
| `isBot`, `botName` | Bot detection |
| `isVpn`, `isProxy`, `threatLevel` | Security flags |

---

## Authentication

Trimly uses [NextAuth.js](https://next-auth.js.org/) with JWT strategy:

- **Credentials Provider** -- email + password login with bcrypt verification
- **Google Provider** -- OAuth 2.0 sign-in
- **Email Verification** -- registration requires OTP verification before login is allowed
- **Password Reset** -- OTP-based flow with 5-minute expiry

Sessions are stateless JWTs. User data (`id`, `email`, `fullName`, `type`) is embedded in the token and made available via `useSession()`.

---

## Deployment

**Vercel (recommended):**

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Configure environment variables in the Vercel dashboard
4. Deploy -- Vercel auto-detects Next.js

```bash
npm run build   # Production build
npm run start   # Start production server locally
```

**Other platforms:**

Trimly is a standard Next.js application and can be deployed anywhere that supports Node.js (Railway, Render, AWS, etc.). Ensure the environment variables are configured for your target platform.

---

## Security

- Passwords are hashed with `bcryptjs` (10 salt rounds) before database storage
- Visitor IP addresses are bcrypt-hashed and never stored in plaintext
- API routes validate authentication and authorization before returning data
- Sensitive environment variables are server-side only and never bundled into client code
- OTP codes expire after 5 minutes
- Admin routes check `session.user.type === "admin"` before granting access

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change, then submit a pull request.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## Author

**M Abdullah** -- [GitHub](https://github.com/mabdullah356)
