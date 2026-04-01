# 🚕 RideBook

A minimal ride booking web app. Zero cost infrastructure.

Customer submits → Admin instantly sees → Admin calls → Ride done.

---

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS**
- **Supabase** (free tier)
- **Vercel** (free tier)

---

## Setup

### 1. Supabase — Create the table

Go to your Supabase project → **SQL Editor** → run this:

```sql
create table bookings (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  pickup     text not null,
  drop       text,
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Allow anyone to insert (customers)
create policy "Anyone can book"
  on bookings for insert
  to anon
  with check (true);

-- Allow anyone to read (admin panel — add auth later if needed)
create policy "Anyone can view"
  on bookings for select
  to anon
  using (true);

-- Allow anyone to update status
create policy "Anyone can update status"
  on bookings for update
  to anon
  using (true);

-- Enable Row Level Security
alter table bookings enable row level security;

-- Enable realtime
alter publication supabase_realtime add table bookings;
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Get the values from: Supabase → Project → Settings → API

### 3. Install & run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## Pages

| URL      | Description                        |
|----------|------------------------------------|
| `/`      | Customer booking form              |
| `/admin` | Admin panel with live bookings     |

---

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy — done!

---

## Notes

- No maps API, no SMS, no paid services
- Admin panel auto-updates via Supabase Realtime
- Click the phone number in admin to call directly
- Status: Pending → Called → Completed
