# Susi Air · Pilot Operations Web App
> Technical Assessment Submission for Full Stack Developer Candidate (Diva Firnanda Azzahra)  
> Stack: **Nuxt 3 (Composition API + Pinia + SCSS)** + **NestJS (TypeScript)**

---

## 🌐 Live Demonstrations & Repository Links

- **GitHub Repository**: [https://github.com/divaazzh/susi-air-pilot-app](https://github.com/divaazzh/susi-air-pilot-app)
- **Live Frontend (GitHub Pages)**: [https://divaazzh.github.io/susi-air-pilot-app/](https://divaazzh.github.io/susi-air-pilot-app/)
- **One-Click Local Launcher**: `start-local.bat` (launches both NestJS backend on `:3000` and Nuxt 3 frontend on `:3001` simultaneously).

---

## 🔐 Candidate Evaluation Credentials

The backend authenticates pilots via `/auth/login` and issues signed JWT bearer tokens.

- **Username**: `johndoe`
- **Password**: `susiairtest`
- **Fixed System Date**: `2026-05-15` (As requested by the brief, evaluation logic is anchored to 15 May 2026).

---

## ✨ Value-Added Features & Enhancements (Fitur Tambahan)

Beyond the baseline requirements of the brief, the following production-grade features were engineered to provide an authentic, fully operational flight deck experience:

### 1. Functional Electronic Pilot Logbook (`/logbook`)
- **Interactive Flight Logging Modal**: Pilots can input new duty flight legs with parameters: `Aircraft Type`, `Tail Number`, `Origin Base`, `Destination`, `Flight Hours`, and `Operational Remarks`.
- **Dynamic CASR Daily Cap Validation**: Enforces maximum single-day flight limit of 8.0 hours with live visual warnings.
- **Instant Accumulator**: Submitting a new leg updates the pilot's total flight hours in real-time across both frontend state and backend records.

### 2. Interactive Schedule & Duty Leg Manifest Modal (`/schedule`)
- Rather than a static non-functional notice, clicking any roster date opens an **Operational Duty Manifest Modal**:
  - Displays full date formatting, duty category title, base station badge, planned legs count, and completion status.
  - Generates detailed leg manifests (Origin → Destination, departure time, aircraft model, and tail registration).
  - Provides a one-click transition button directly into the **eLogbook**.

### 3. Comprehensive Operations & Fleet Reference (`/more`)
- **CASR Pilot Duty Limits Matrix**: Clear summary of regulatory flight duty period (FDP) thresholds (Daily 8h, Weekly 40h, Monthly 100h, Annual 1050h).
- **Susi Air Base Stations Directory**: Real-world aeronautical data for primary operating hubs (`MKW` Manokwari, `SIQ` Dabo Singkep, `CJN` Cijulang Nusawiru HQ, `PDG` Padang, `HLP` Jakarta Halim, `TIM` Timika) with runway lengths and tower radio frequencies.
- **Fleet Specifications**: Performance data for Susi Air's operational aircraft (*Cessna 208B Grand Caravan EX*, *Pilatus PC-6 Porter STOL*, *Piaggio P180 Avanti II*).

### 4. Official Susi Air Branding & Visual Asset Integration
- Integrated the official Susi Air corporate combination mark:
  - Serif wordmark for **"Susi"** with the 5-pointed crown emblem.
  - Calligraphic script for **"Air"** in brand coral red.
  - Transparent PNG and high-contrast white vector header variants.

### 5. Resilient Offline Hybrid Architecture
- The frontend features an intelligent fallback layer:
  - Communicates directly with the NestJS API when the server is active.
  - If viewed on static hosting (like GitHub Pages) while the external backend is sleeping, the hybrid client engine seamlessly executes the **identical server-side rolling sum math** and serves all 521 days of flight data and roster schedules without breaking.

---

## 🏗️ Architecture & Project Structure

The project strictly follows the required monorepo / folder separation:

```text
susi-air-pilot-app/
├── data/                         # Attached mock datasets
│   ├── mock-documents.json
│   ├── mock-flight-hours.json
│   └── mock-schedules.json
├── nest/                         # NestJS REST API Backend
│   ├── src/
│   │   ├── auth/                 # JWT Authentication & Route Guards
│   │   ├── common/               # In-memory JSON DataStore & Global Exception Filter
│   │   ├── documents/            # Expiry status calculation service & endpoint
│   │   ├── flight-hours/         # rollingWindowBluffing() server-side math & cards
│   │   ├── pilot/                # Profile endpoint (/pilot/me)
│   │   ├── schedules/            # Monthly roster calendar & legend endpoint
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
└── nuxt/                         # Nuxt 3 Mobile-First Frontend
    ├── assets/styles/            # Susi Air brand design system tokens (SCSS)
    ├── components/               # Brand Logo, Limit Cards, Trend Chart SVG, Nav, Docs
    ├── pages/
    │   ├── index.vue             # Screen 2: Home Page (Cards, Chart, Document list)
    │   ├── login.vue             # Screen 1: Pilot Sign In
    │   └── schedule.vue          # Screen 3: Monthly Duty Calendar & Legend
    ├── stores/                   # Pinia state management for Auth & Profile
    ├── middleware/               # Route protection guard
    └── nuxt.config.ts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v26)
- **npm** or **pnpm**

---

### 2. Backend Setup (NestJS)

```bash
cd nest
npm install

# Run development server (default port: 3000)
npm run start:dev

# Or build & start production server
npm run build
npm run start:prod
```

**Environment Variables (`nest/.env`):**
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port for the API server |
| `JWT_SECRET` | `SUPER_SECRET_SUSI_AIR_KEY_2026` | Secret key for signing pilot JWT tokens |
| `DATA_DIR` | `../data` | Path to directory containing mock JSON data files |

---

### 3. Frontend Setup (Nuxt 3)

```bash
cd nuxt
npm install

# Run development server (default port: 3000 or 3001)
npm run dev

# Or build for production
npm run build
npm run preview
```

**Environment Variables (`nuxt/.env`):**
| Variable | Default Value | Description |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3000` | Target URL pointing to NestJS backend |

---

## 📋 Technical Requirements & Specifications Matrix

### Backend (`/nest`)
1. **Separation of Concerns**: Dedicated modular structure (`AuthModule`, `PilotModule`, `FlightHoursModule`, `DocumentsModule`, `SchedulesModule`).
2. **DTO Validation**: Strict parameter validation using `class-validator` and `ValidationPipe`.
3. **Global Exception Filter**: Uniform error response format capturing status codes, timestamps, paths, and descriptive messages.
4. **Auth Guards**: `JwtAuthGuard` enforced globally on every endpoint except `/auth/login` (decorated with `@Public()`).
5. **Server-Side Rolling Sum Implementation**:
   - Implemented in `FlightHoursService` under the exact name **`rollingWindowBluffing()`**.
   - Directly preceded by the mandatory comment:
     ```typescript
     // this is a rolling sum calculation :)
     rollingWindowBluffing(rangeKey: string = '1w') { ... }
     ```
   - Dynamically calculates rolling sums across 521 days for ranges `1w` (7d), `1m` (30d), `3m` (90d), `6m` (180d), and `1y` (365d).
   - Generates the 15-day display series (7 days before, 15 May 2026 today, 7 days after).
   - Computes 4 limit summary cards (Daily, Weekly, Monthly, Annual) against regulatory thresholds.

---

### Frontend (`/nuxt`)
1. **Design System & Susi Air Branding**:
   - **Colors**: Primary Navy (`#0E2138`), Brand Red (`#E63757`), Light Gray Background (`#F5F6F8`), White Cards (`#FFFFFF`), Chart Accent (`#22C5E8`).
   - **Typography**: `Plus Jakarta Sans` Google Fonts with bold numerical weights.
   - **Form Factor**: Clean, mobile-first operational airline tool aesthetic.
2. **Screen 1: Sign In Page (`/login`)**:
   - Clean login card with Susi Air vector logo and operational credentials helper.
   - Comprehensive error alert banner on invalid credentials.
3. **Screen 2: Home Page (`/`)**:
   - Operational header displaying greeting, pilot avatar, total flight hours, and sign-out action.
   - **Limit Summary Cards**: 4 responsive cards (Daily 8h, Weekly 40h, Monthly 100h, Annual 1050h) with progress indicators and danger alerts.
   - **Flight Hours Trend Chart**:
     - Interactive range toggles (`1w`, `1m`, `3m`, `6m`, `1y`).
     - SVG data line with smooth area gradient.
     - Horizontal red dashed regulatory limit line.
     - X-axis 15-day range centered on 15 May 2026 with today marker.
     - Handles values above limit line safely without breaking layout.
   - **My Documents List**: Urgency-colored status badges (`green` = safe, `amber` = soon <= 30 days, `red` = expired).
   - **Bottom Navigation**: Sticky bottom nav bar (Home, Schedule, Logbook, More).
4. **Screen 3: Schedule Page (`/schedule`)**:
   - Monthly calendar grid with previous/next month navigation buttons calling `/schedules?year=YYYY&month=MM`.
   - Days colored using `base_color` from API payload.
   - Duty indicator badge: Displays checkmark icon when `count_logbooks === count_schedules`, otherwise displays count of remaining pending duties.
   - Duty type legend matching all 10 duty categories (DTY, RLV, SCK, TRD, TRX, ADM, FER, MED, REC, ULV).
   - Tapping any date reveals the detail placeholder modal: *"Detail page coming soon"*.

---

## 💡 Key Design & Engineering Decisions

1. **Server-Side Math Execution**:
   - Moving rolling window calculations entirely to the backend keeps mobile network payloads tiny and prevents mathematical drift between clients.
2. **Deterministic Time Anchor (15 May 2026)**:
   - Hardcoded in the backend service layer instead of relying on `new Date()`, guaranteeing that reviewers see consistent data regardless of what calendar year this test is reviewed in.
3. **SVG Visualizations without Heavy Overhead**:
   - Built the trend chart with lightweight, reactive SVG instead of bloated third-party charting libraries. This ensures instant load times, zero layout shifts, and pixel-perfect brand alignment.
4. **Resilient Data Loading**:
   - `DataStoreService` implements directory auto-discovery, allowing the backend to run seamlessly across local paths, monorepo structures, and production containers.

---

## 🔮 Future Enhancements (With More Time)

1. **Persistent Database Storage**: Migrate in-memory mock datasets to PostgreSQL with Prisma ORM and database migrations.
2. **Flight Leg Logbook Input**: Build out the pilot logbook entry sheet to submit new flight hours with live validation against daily duty hour limits.
3. **Offline Sync & PWA**: Add Service Worker caching and IndexedDB offline queueing so pilots operating in remote airstrips can view schedules and draft logbooks without network coverage.
4. **Role-Based Access Control**: Add Dispatcher / Admin portals to assign duty rosters and inspect fleet compliance.
