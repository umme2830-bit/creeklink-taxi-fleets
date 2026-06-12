# CreekLink — BPO Taxi Operations Platform

> **Seamless Support. Stronger Connections.**  
> A full-stack Node.js + Express website for CreekLink, a BPO-operated taxi cab service built for UK fleet operations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express 4 |
| Templating | EJS |
| Styling | Tailwind CSS 3 (custom dark cinematic tokens) |
| Animations | GSAP 3 + ScrollTrigger, Three.js (hero only) |
| Database | MongoDB + Mongoose (mock data fallback) |
| Auth | JWT via `jsonwebtoken` + `bcryptjs` |
| Email | Nodemailer (console stub when unconfigured) |

---

## Project Structure

```
creeklink/
├── server.js               ← Express entry point
├── .env                    ← Environment variables (copy from .env.example)
├── tailwind.config.js      ← Custom dark cinematic color tokens
├── postcss.config.js
│
├── routes/                 ← Express route handlers
├── controllers/            ← Business logic
├── models/                 ← Mongoose schemas (Booking, Driver, Contact)
├── middleware/
│   └── auth.js             ← JWT cookie guard for /dashboard
│
├── views/
│   ├── partials/
│   │   ├── head.ejs        ← <head> + Google Fonts + CDN scripts
│   │   ├── navbar.ejs      ← Sticky scroll-aware navbar
│   │   ├── footer.ejs      ← Full footer with links + contact info
│   │   └── whatsapp-fab.ejs← Floating WhatsApp button
│   ├── home.ejs            ← Hero + features + stats + testimonials
│   ├── services.ejs        ← 3D flip service cards
│   ├── book.ejs            ← Booking form
│   ├── about.ejs           ← BPO story + UK map + stats
│   ├── contact.ejs         ← Contact form + map embed
│   ├── login.ejs           ← Driver auth
│   ├── dashboard.ejs       ← Protected booking table
│   └── 404.ejs             ← Dark cinematic error page
│
└── public/
    ├── css/
    │   ├── input.css       ← Tailwind source (edit this)
    │   └── main.css        ← Compiled output (auto-generated)
    └── js/
        ├── main.js         ← GSAP + ScrollTrigger animations
        └── hero3d.js       ← Three.js UK map hero scene
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Build Tailwind CSS
```bash
npm run build:css
# Or watch mode during development:
npm run watch:css
```

### 4. Start the server
```bash
# Development (with auto-restart):
npm run dev

# Production:
npm start
```

Visit: **http://localhost:3000**

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port | No (default 3000) |
| `MONGO_URI` | MongoDB connection string | No (uses mock data) |
| `JWT_SECRET` | Secret for JWT signing | No (dev default used) |
| `EMAIL_USER` | Gmail address for Nodemailer | No (logs to console) |
| `EMAIL_PASS` | Gmail app password | No |

---

## Pages

| URL | Description |
|---|---|
| `/` | Home — hero + features + testimonials |
| `/services` | Economy / Business / Airport Transfer cards |
| `/book` | Booking form → MongoDB + email confirmation |
| `/about` | Brand story + BPO operations |
| `/contact` | Contact form + map |
| `/login` | Driver login (JWT) |
| `/dashboard` | Protected driver dashboard |

### Demo Driver Login
- **Email:** `driver@creeklink.com`  
- **Password:** `demo1234`

---

## Color Tokens (Tailwind)

```js
'ck-black':      '#0D0B08'   // Page background
'ck-dark':       '#1A1610'   // Section background
'ck-card':       '#12100D'   // Card surfaces
'ck-card-hover': '#1E1B15'   // Card hover
'ck-yellow':     '#F4B400'   // Primary accent / CTAs
'ck-gold':       '#C9A84C'   // Borders / dividers
'ck-gold-btn':   '#D4A94E'   // Secondary button outlines
'ck-cream':      '#F0EAD6'   // Primary text
'ck-muted':      '#B8AFA0'   // Subtext / captions
'ck-border':     '#2E2820'   // Dividers
```

---

## Animation Notes

- **Three.js hero scene** — lazy-loaded via `IntersectionObserver`, only initialises when the canvas enters viewport
- **GSAP ScrollTrigger** — all scroll animations wrapped in `prefers-reduced-motion` check
- **3D card flip** — pure CSS `preserve-3d` on hover, no JS needed
- **Count-up stats** — GSAP ticker triggered by ScrollTrigger on scroll-into-view
- **WhatsApp FAB** — CSS `@keyframes` pulse ring, no JS dependency

---

## Deployment Checklist

- [ ] Set a strong `JWT_SECRET` in `.env`
- [ ] Set `MONGO_URI` to your Atlas cluster
- [ ] Set `EMAIL_USER` / `EMAIL_PASS` for live email
- [ ] Run `npm run build:css` before deploying
- [ ] Set `NODE_ENV=production`
- [ ] Add HTTPS / reverse proxy (nginx or Caddy recommended)
