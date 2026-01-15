# Mock Data System

## Overview
This project supports a toggleable mock data system for all API/database interactions, including authentication. You can switch between static, random, or real backend data for development and testing.

## How to Use

### Toggle Methods
- **Environment Variable:** Set `NEXT_PUBLIC_MOCK_MODE` to `static`, `random`, or `off`.
- **Config File:** Edit `lib/mocks/config.ts` to change the default mode.
- **Runtime UI Switch:** In development mode, a UI switch is available for toggling mock mode.

Priority: UI switch (dev only) > env variable > config file default.

### Modes
- `static`: Returns fixed, predictable mock data.
- `random`: Returns randomly generated mock data.
- `off`: Uses the real backend/API.

## Limitations & Differences from Real Backend
- Real-time updates, external integrations, and side effects are not fully mocked.
- Some backend validation, error cases, or business logic may not be represented in mocks.
- The runtime UI switch is only available in development (`NODE_ENV !== 'production'`).
- Mock authentication always succeeds with known credentials in static mode, and with any credentials in random mode.

## Visual Cues
When mock mode is active in development, a clear visual indicator is shown.

## Extending Mocks
Add or update mock data in `lib/mocks/`. All API functions in `lib/api/` are already wired to use mocks when enabled.

---
# UBA USSD Portal - Admin Dashboard

A modern Next.js admin dashboard for managing the UBA USSD Menu system.

## Features

- **Dashboard**: Overview statistics, revenue charts, and user growth analytics
- **User Management**: View, enable/disable users, reset PINs, and manage user accounts
- **Transaction Monitoring**: Track all transactions with filtering and export capabilities
- **USSD Sessions**: Monitor active and historical USSD menu sessions
- **Operators Management**: CRUD operations for network operators
- **System Settings**: View and configure system parameters

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **TanStack Query** for data fetching
- **Zustand** for state management
- **React Hook Form** + **Zod** for form validation
- **Recharts** for data visualization

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see parent directory)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:9092/api
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
ussd-portal/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   └── (dashboard)/       # Protected dashboard routes
├── components/            # React components
│   ├── ui/                # Shadcn/ui components
│   ├── layout/            # Layout components
│   ├── dashboard/         # Dashboard components
│   └── users/             # User management components
├── lib/                   # Utilities and configurations
│   ├── api/               # API client functions
│   ├── store/             # Zustand stores
│   └── utils/             # Helper functions
└── types/                 # TypeScript type definitions
```

## API Integration

The application connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`. All API calls are handled through the centralized API client in `lib/api/`.

## Authentication

- Login page at `/login`
- JWT token stored in localStorage
- Protected routes automatically redirect to login if not authenticated
- Token automatically included in API requests

## Key Pages

- `/` - Dashboard with statistics and charts
- `/users` - User management list
- `/users/[id]` - User details with transactions and sessions
- `/transactions` - Transaction list with filters
- `/sessions` - USSD session monitoring
- `/operators` - Operator management
- `/settings` - System configuration

## Features in Detail

### User Management

- List all users with search and filters
- Enable/Disable user accounts
- Reset user PINs (random or custom)
- View user transaction history
- View user USSD session history

### Transaction Management

- Filter by type, status, date range
- Search transactions
- Export to CSV
- View transaction details

### Dashboard

- Real-time statistics
- Revenue trends (line chart)
- User growth (line chart)
- Transaction summaries

## Development

The application uses:

- **React Server Components** where possible
- **Client Components** for interactivity
- **React Query** for server state management
- **Zustand** for client state (auth)

## License

ISC
