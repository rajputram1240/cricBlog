# SportsDraft Daily

A beginner-friendly full-stack sports blog built with **Next.js + Prisma + MongoDB**. It supports:

- Public football and cricket blog pages
- Search and filtering by keyword, category, and date
- Secure admin login
- AI-powered blog draft generation with OpenAI
- Admin review/edit/approve/publish workflow
- Required feature image upload before approval/publishing
- Local image uploads
- Dummy sample data and seed script

## Tech stack

- Next.js App Router
- Prisma ORM
- MongoDB database
- OpenAI API (`openai` SDK)
- Simple cookie-based admin session

## Status workflow

Blog posts move through these statuses:

- `draft`
- `pending_review`
- `approved`
- `published`
- `rejected`

Only `published` posts appear on the public website.

## OpenAI generation flow

### Manual generation

An admin can use the dashboard to generate a football or cricket draft for a custom topic.

### Daily generation

You can call the cron endpoint daily to create one football and one cricket draft:

- `POST /api/cron/daily-generate`
- Header: `x-cron-secret: <SESSION_SECRET>`

If `OPENAI_API_KEY` is not configured, the app still creates usable fallback drafts so the editorial workflow can be demonstrated locally.

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Prisma client and push the Prisma schema to MongoDB:

   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

4. Start development server:

   ```bash
   npm run dev
   ```

## Default admin credentials

- Email: value from `ADMIN_EMAIL`
- Password: value from `ADMIN_PASSWORD`

Defaults in `.env.example`:

- `admin@sportsblog.com`
- `ChangeMe123!`

## Feature image rule

AI drafts are **never auto-published**. The admin must upload a feature image manually before changing a draft to `approved` or `published`.

## Project structure

- `app/` – public pages, admin pages, API routes
- `components/` – reusable UI and admin components
- `lib/` – auth, Prisma, OpenAI, validation, helpers
- `prisma/` – MongoDB schema and seed data
- `public/uploads/` – uploaded feature images

## Notes

- This repository includes sample dummy content for both football and cricket.
- Public users only see approved and published-ready content once the status becomes `published`.
- Admins can edit outlines and content before publishing.


## MongoDB note

Set `DATABASE_URL` to a valid MongoDB connection string, such as a local MongoDB instance or MongoDB Atlas URI, before running `prisma db push` and `npm run seed`.
