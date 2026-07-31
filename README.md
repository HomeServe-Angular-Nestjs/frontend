# HomeServe Frontend — Angular Application

Angular 19 SPA for the HomeServe home services marketplace, containing the **Customer**, **Provider**, and **Admin** portals in a single workspace with lazy-loaded feature modules and centralized NgRx state.

## Features

- **Customer Portal** — Landing page, service exploration, provider discovery & detailed profiles (Mapbox location search), cart, slot-based booking & rescheduling, Razorpay checkout, order history, reviews & ratings, wallet, notifications, real-time chat and video calls.
- **Provider Portal** — KYC application, availability & slot management (default schedules, date overrides, slot rules), service catalog management, booking calendar & pipeline, invoice downloads, revenue/area/performance analytics dashboards, wallet with withdrawal requests.
- **Admin Portal** — Analytics dashboard (revenue trends, subscription breakdown, user tracking, top-earning providers), provider approval workflows, user/service/category/coupon/subscription management, transactions, complaints, and downloadable PDF reports.
- **Real-time** — Socket.IO client integration for live chat, notifications, and WebRTC video calls (STUN/TURN via metered relay).
- **State Management** — NgRx Store/Effects/Entity/Router-Store with state persistence via `ngrx-store-localstorage`.

## Tech Stack

| Concern | Technology |
| --- | --- |
| Framework | Angular 19, TypeScript 5.7, RxJS |
| State | NgRx (Store, Effects, Entity, Router-Store, Component-Store) |
| Styling | Tailwind CSS, Angular Material, tailwind-scrollbar |
| Maps | Mapbox GL JS + Mapbox Geocoder |
| Geocoding | OpenCage Geocoding API |
| Charts | Apache ECharts (ngx-echarts) |
| Real-Time | socket.io-client, WebRTC (metered TURN relay) |
| UI Feedback | ngx-toastr, SweetAlert2, ngx-spinner, Notyf |
| Testing | Karma, Jasmine |

## Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── pages/       # Page-level feature modules (customer, provider, admin, subscription, 404)
│   │   ├── routes/      # Lazy-loaded route configuration per portal
│   │   ├── shared/      # Reusable components, partials, and models
│   │   └── config/      # Module configuration
│   ├── core/
│   │   ├── services/    # API services (public, socket)
│   │   ├── guards/      # Route guards (auth, role-based)
│   │   ├── interceptors/# HTTP interceptors
│   │   ├── models/      # TypeScript models/interfaces
│   │   ├── enums/       # Shared enums
│   │   ├── pipes/       # Custom pipes
│   │   ├── utils/       # Helpers (e.g., table generation)
│   │   └── resolver/    # Route resolvers
│   ├── store/           # NgRx state slices (auth, customer, provider, chat, notification, users)
│   ├── UI/              # Reusable UI primitives (button, spinner)
│   └── ...
├── environments/        # Environment configuration (env.ts, env.prod.ts)
└── ...
```

## Getting Started

### Prerequisites
- Node.js ≥ 18 and npm
- Backend API running (see `backend/` README)

### Setup

```bash
npm install
ng serve          # dev server at http://localhost:4200
```

The application reads API endpoints, the Socket.IO URL, and third-party keys (Mapbox, Razorpay, OpenCage, TURN relay) from `src/environments/env.ts` (development) and `env.prod.ts` (production). Update these files to point at your backend and supply your own keys.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm start` | Run `ng serve` (dev server with hot reload) |
| `npm run build` | Production build (output in `dist/`) |
| `npm run watch` | Build in watch mode (development configuration) |
| `npm test` | Unit tests via Karma + Jasmine |

## Build

```bash
ng build
```

The production build optimizes the app for performance and outputs artifacts to `dist/`.

## Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [NgRx Documentation](https://ngrx.io)

## License

Private / UNLICENSED.
