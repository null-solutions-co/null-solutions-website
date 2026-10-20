# Connecting to NULL Platform

NULL Platform is the backend for this site: it serves the client portal API, stores the
contact-form leads and holds the site's editable content (texts, portfolio, contact details).
Platform docs: `docs/WEBSITE_API.md` (portal API) and `docs/PUBLIC_API.md` (content API) in the
`null-platform` repo.

## Environment

| Variable | Example | What it does |
|---|---|---|
| `NEXT_PUBLIC_API_MODE` | `live` | `live` = portal and leads go to the platform; `mock` = in-memory mock (dev default) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | Portal API, called server-to-server by the BFF (`app/api/*`) |
| `SESSION_SECRET` | 32+ random chars | Encrypts the portal session cookie |
| `NULL_CMS_URL` | `http://localhost:3000` | Platform origin for content (`/api/public/*`). Unset = bundled content only |
| `REVALIDATE_SECRET` | random string | Shared with the platform's webhook settings |
| `NEXT_PUBLIC_LEADS_VIA` | *(empty)* | Empty = contact form → `/api/leads` → platform `POST /leads` (a Lead in the CRM) |
| `NEXT_PUBLIC_REALTIME` | *(empty)* | Empty = the portal polls for notifications; `signalr` = use a SignalR hub |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` | This site's public origin |

`NEXT_PUBLIC_*` values are baked in at build time: rebuild after changing them.

## What comes from the platform

All reads are server-side (`lib/cms.ts`), cached 60 s with a cache tag, 3 s timeout. If the
platform is unreachable or answers something unexpected, the bundled content is used.

| Content | Endpoint | Tag | Fallback |
|---|---|---|---|
| All texts (next-intl messages) | `/api/public/site-messages?locale=en\|ar` | `null:messages` | `messages/<locale>.json`, merged key by key (`i18n/request.ts`) |
| Portfolio | `/api/public/portfolio-entries` | `null:portfolio` | `PORTFOLIO` in `lib/portfolio.ts` |
| Email, phone, Instagram, social links | `/api/public/site` | `null:site` | `COMPANY` in `lib/company.ts` |

Images uploaded in the platform come back as absolute `${NULL_CMS_URL}/api/media/<id>` URLs;
`next.config.ts` allows that origin in the CSP `img-src` and `images.remotePatterns`, and they are
rendered unoptimized (loaded straight from the platform).

The portal dashboard (a client component) still shows the bundled `COMPANY.email`.

## Instant updates (revalidation webhook)

In the platform: `/admin/settings` → website → `revalidateUrl` = `https://<site>/api/revalidate`,
`revalidateSecret` = this site's `REVALIDATE_SECRET`. On every content save the platform sends
`POST /api/revalidate` with `{ secret, paths, tags }`; the route checks the secret (constant time,
401 otherwise), calls `revalidateTag(tag, { expire: 0 })` for each `null:*` tag and
`revalidatePath` for each path. Manual test:

```bash
curl -X POST http://localhost:3001/api/revalidate -H "content-type: application/json" \
  -d '{"secret":"<REVALIDATE_SECRET>","tags":["null:messages"],"paths":["/"]}'
```

## Run locally against the platform

1. Platform running at `http://localhost:3000` (with its demo data).
2. `.env.local` here with the values from the table above.
3. `npm run build && npx next start -p 3001` (or `npx next dev -p 3001`).
   For a production build opened over plain http, build with `LOCAL_HTTP_PREVIEW=1`.
4. Client portal: `/login` with a project access code (`NS-XXXX-XXXX-XXXX-XXXX`);
   team: `/team` with a platform staff account (Dev = `projects.manage`, otherwise Partner).
