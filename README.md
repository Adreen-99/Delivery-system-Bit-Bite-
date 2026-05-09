# Bit-Bite 

BitBite is a modern food delivery platform designed to connect customers, restaurants, and delivery riders through a fast, efficient, and transparent ordering system.

BitBite is built as a startup-style MVP that demonstrates how a real-world food delivery system works from both a business and technical perspective.

## Stack 
 React,  Flask, Tailwind & LNbits.

## Quick Start

```bash
#  Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run.py                     # http://localhost:5000

#  Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173

# Seed data (optional)
cd backend && source venv/bin/activate && python seed.py
```

## Structure

```
backend/app/          → Flask app, models, routes, LNbits client
frontend/src/
  pages/              → Home, Restaurant, Cart, Checkout, Login, Signup, etc.
  components/         → Navbar, Logo, ErrorBoundary, Skeleton
  context/            → CartContext, UserContext, ThemeContext, ToastContext
  services/api.js     → Axios client
```

## Config File (`backend/.env`)


## API endpoints

| Endpoint | What |
|----------|------|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in, returns token |
| `GET /api/auth/me` | Current user (Bearer token) |
| `GET /api/restaurants` | List restaurants |
| `GET /api/restaurants/:id/menu` | Menu items |
| `POST /api/orders` | Create order + Lightning invoice |
| `GET /api/payments/check/:hash` | Poll payment status |
| `PUT /api/delivery/:id` | Update delivery status |

## Features

- Browse restaurants + menus, cart with local persistence
- Lightning invoice payments via LNbits (QR code + auto-polling)
- Order tracking (preparing → ready → in_transit → delivered)
- Email/password auth with token-based sessions
- Dark/light theme toggle (persisted, respects system pref)
- Lazy-loaded routes, loading skeletons, error boundary, toast notifications

---

## AI Prompting Journal

**Student:** Adreen Nyawira
**Capstone:** Food Delivery App (Bitcoin Development)
**AI Tool:** Claude.ai

### Prompt #1 — Conceptual Understanding

*"I'm proficient in Python, and want to learn to create a delivery system integrating Bitcoin payments using FastAPI and PostgreSQL."*

**Key differences: Python vs FastAPI**

| Python | FastAPI |
|--------|---------|
| Readability & simplicity | Speed & correctness by default |
| Type hints optional | Type hints drive validation, docs, serialization |
| Async optional | Async first-class |
| Errors at runtime | Errors caught at declaration via Pydantic |
| Manual docs | Auto-generated from code |

**Mental models to adjust:**
- Functions become HTTP endpoint contracts
- Type hints are runtime behavior
- Async = yield control, don't wait
- PostgreSQL provides atomicity (critical for payments)
- Pydantic models are source of truth

**Misconceptions:**
- FastAPI is not "Flask with async" — built around asyncio from day one
- Skipping Pydantic loses 80% of FastAPI's value
- Sync code in `async def` blocks the event loop
- 422 errors = FastAPI is working correctly

### Prompt #2 — What is FastAPI?

Builds backend services with standard Python, auto-handling HTTP requests, validation, JSON serialization, and docs.

### Prompt #3 — Routes & Endpoints

- **Route** = a URL path (e.g. `/users`)
- **Endpoint** = route + HTTP method that performs an action

Example: `GET /users` retrieves users; `POST /users` creates one.

##  License
  MIT