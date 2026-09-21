# Wa-CRM Intelligence - Frontend Dashboard

Web dashboard and CRM intelligence portal for WhatsApp lead intelligence, analytics, real-time follow-ups, and sales agent management.

## Features

- **Executive & Sales Dashboard**: Visual KPI metrics (Active Leads, Revenue at Risk, Conversion Rates), recent lead updates, and activity feeds.
- **Lead Intelligence Management**: Comprehensive lead records with AI deal temperature (Hot, Warm, At-Risk, Cold), buyer intent signals, and timeline history.
- **Lead Details & Suggested Replies**: Contextual conversation view with AI-recommended action items and one-click copyable WhatsApp replies.
- **Automated Follow-ups & Reminders**: Scheduled WhatsApp outreach tracking and urgency prioritization.
- **Agent Performance**: Performance monitoring, load distribution, and conversion tracking across sales reps.
- **Supabase Integration**: Ready-to-connect Supabase schema for persistent authentication, lead storage, and conversation telemetry.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + PostCSS
- **Database & Auth**: Supabase (@supabase/supabase-js)
- **Linter**: Oxlint

## Getting Started

### 1. Navigate to directory
```bash
cd apps/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the example environment file and add your Supabase credentials:
```bash
cp .env.example .env
```

Configure:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
