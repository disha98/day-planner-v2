# Day Planner

A Notion-style weekly day planner with authentication, cloud persistence, live weather forecasts, and public holiday awareness.

## What's New (this branch)

This branch adds four major integrations on top of the original client-side day planner:

### Clerk Authentication
- Landing page for signed-out users with feature highlights and sign-in/sign-up CTAs
- Clerk-powered sign-in and sign-up flows
- User avatar button in the sidebar for profile and sign-out
- Route protection via Clerk proxy middleware

### Supabase Persistence
- All data (categories, time blocks, tasks, notes) now stored in Supabase Postgres instead of browser IndexedDB (Dexie removed)
- Data persists across devices and browsers — sign in anywhere to access your planner
- Import/export functionality preserved, now backed by Supabase
- SQL migration script provided for table setup (`supabase-migration.sql`)

### Weather Forecasts (Open-Meteo API)
- 16-day weather forecast displayed in all three planner views
- **Week view** — colored weather icon + high/low temperature + precipitation % in each day column header
- **Day view** — descriptive weather card with colored icon, temps, condition label, and precipitation chance
- **List view** — inline weather icon + temps in each day header
- Icons colored by condition: amber (sun), blue (rain), sky (snow), violet (thunderstorm), gray (overcast/fog)
- Uses browser geolocation, falls back to Chicago if denied
- Free API, no key required

### Public Holidays (Nager.Date API)
- Holidays for 25+ countries displayed across all planner views
- **Week view** — pink badge with holiday name in the day column header
- **Day view** — pink banner above the schedule
- **List view** — pink badge inline in the day header
- Default country: US (configurable in Settings)
- "Holidays" category auto-created with pink color
- Free API, no key required

### Calendar Sharing
- Share your calendar via a link — click "Share" in the planner header to generate a URL
- Recipients must sign in; the shared calendar overlays on their own in indigo
- Toggle checkboxes to show/hide "My Calendar" and "Shared" independently
- Shared events are read-only — no editing or dragging
- Shared token persists in localStorage across refreshes; dismiss with the X button
- Revoke access anytime with "Stop sharing" in the share dialog
- API routes: `POST /api/share` (create), `GET /api/share/[token]` (fetch shared data), `DELETE /api/share` (revoke)
- Migration: `supabase-shares-migration.sql` adds the `calendar_shares` table

### User Preferences
- **Country** — select holiday country from 25+ options
- **Temperature unit** — toggle between °C and °F
- **Weather location** — update via browser geolocation button
- Preferences stored per-user in Supabase

## Setup

### Prerequisites
- A [Clerk](https://clerk.com) account and application
- A [Supabase](https://supabase.com) project

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create `.env.local` with:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-supabase-anon-key>
SUPABASE_SECRET_KEY=<your-supabase-secret-key>
```

### 3. Set up the database
Run `supabase-migration.sql` in your Supabase SQL Editor to create all tables.

Then run `supabase-disable-rls.sql` to disable RLS (application-level user_id filtering is used instead).

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Clerk](https://clerk.com/) (authentication)
- [Supabase](https://supabase.com/) (Postgres database)
- [Open-Meteo](https://open-meteo.com/) (weather API — free, no key)
- [Nager.Date](https://date.nager.at/) (holidays API — free, no key)
- [ical.js](https://github.com/kewisch/ical.js) (calendar parsing)
- [date-fns](https://date-fns.org/) (date utilities)
- [@dnd-kit](https://dndkit.com/) (drag and drop)
- [Lucide](https://lucide.dev/) (icons)

## Project Structure (key additions)

```
src/
├── app/
│   ├── page.tsx                # Landing page (signed-out) or redirect (signed-in)
│   ├── sign-in/                # Clerk sign-in page
│   ├── sign-up/                # Clerk sign-up page
│   ├── share/[token]/page.tsx  # Share link handler (redirects to /planner?shared=token)
│   └── api/share/              # Share API routes (create, fetch, revoke)
├── components/planner/
│   ├── share-button.tsx        # Share button + copy-link modal
│   └── calendar-toggle.tsx     # My Calendar / Shared toggle checkboxes
├── lib/
│   ├── supabase.ts             # Supabase public client (anon key)
│   ├── supabase-admin.ts       # Supabase admin client (secret key, server-side)
│   ├── weather-utils.ts        # WMO weather code → colored icon mapping
│   └── hooks/
│       ├── use-supabase.ts     # Provides Supabase client + Clerk userId
│       ├── use-shared-calendar.ts # Fetches shared calendar data by token
│       ├── use-holidays.ts     # Nager.Date public holiday hook
│       ├── use-weather.ts      # Open-Meteo 16-day forecast hook
│       └── use-preferences.ts  # User preferences (country, location, temp unit)
├── proxy.ts                    # Clerk middleware (route protection)
supabase-migration.sql          # Database schema + RLS policies
supabase-shares-migration.sql   # Calendar sharing table
supabase-disable-rls.sql        # Disables RLS for anon-key usage
```
