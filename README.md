# Publish Everywhere

Write once, publish to Medium, WordPress, and Substack from a single dashboard.

## Features

- **Email/password authentication** with JWT sessions
- **Connect accounts** for Medium, WordPress, and Substack
- **Rich Markdown editor** for writing posts
- **One-click multi-platform publishing** with per-platform status tracking
- **Post history** with links to live published articles
- **Encrypted credential storage** (AES-256-GCM at rest)

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (via `jose`) + bcrypt password hashing
- **Encryption**: AES-256-GCM for provider tokens/credentials

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted, e.g., Supabase, Neon, Railway)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/publish_everywhere?schema=public"

# Random 64-char hex strings for JWT signing and credential encryption
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="<your-64-char-hex>"
ENCRYPTION_KEY="<your-64-char-hex>"
```

### 3. Run Database Migrations

```bash
npx prisma db push
```

Or if you prefer migration files:

```bash
npx prisma migrate dev --name init
```

### 4. Start the Dev Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Platform Setup

### Medium

1. Go to [Medium Settings](https://medium.com/me/settings) > Security and apps > Integration tokens
2. Create a new token
3. Paste it into the Connect Accounts page

### WordPress

1. Ensure your WordPress site has the REST API enabled (default on WP 4.7+)
2. Go to WP Admin > Users > Your Profile > Application Passwords
3. Create a new application password
4. Enter your site URL, username, and application password in the Connect Accounts page

### Substack

Substack does not have an official public API. This app uses Substack's internal API endpoints:

1. Log into your Substack publication in a browser
2. Open DevTools > Application > Cookies
3. Copy the value of the `substack.sid` cookie
4. Enter your publication URL and session cookie in the Connect Accounts page

**Note**: This is an unofficial integration. The session cookie may expire and need to be refreshed. If Substack releases an official API, this integration should be updated.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login, signup, logout, me endpoints
│   │   ├── credentials/   # CRUD + test for provider credentials
│   │   ├── dashboard/     # Dashboard stats endpoint
│   │   └── posts/         # Create post + publish, list, detail
│   ├── accounts/          # Connect Accounts page
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── posts/
│   │   ├── new/           # New Post editor
│   │   └── [id]/          # Post detail page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppShell.tsx       # Auth-protected layout wrapper
│   ├── Navbar.tsx         # Navigation bar
│   ├── ProviderIcon.tsx   # Provider icon badges
│   └── StatusBadge.tsx    # Success/failed status badges
├── lib/
│   ├── api.ts             # Frontend fetch helper
│   ├── auth.ts            # JWT creation/verification
│   ├── cn.ts              # Tailwind class merge utility
│   ├── crypto.ts          # AES-256-GCM encrypt/decrypt
│   ├── db.ts              # Prisma client singleton
│   └── types.ts           # Shared TypeScript interfaces
└── services/
    ├── mediumService.ts   # Medium API integration
    ├── normalization.ts   # Post input normalization + payload mappers
    ├── substackService.ts # Substack (unofficial) API integration
    └── wordpressService.ts # WordPress REST API integration
```

## Adding New Platforms

To add a new publishing platform:

1. Add the provider to the `ProviderType` enum in `prisma/schema.prisma`
2. Create a new service file in `src/services/` (e.g., `devtoService.ts`)
3. Add a `mapToDevtoPayload()` function in `src/services/normalization.ts`
4. Add the publish call in `src/app/api/posts/route.ts`
5. Add the test call in `src/app/api/credentials/test/route.ts`
6. Add UI for the new provider in the Connect Accounts and New Post pages
