# Musabaka

Judging site for competitions: admin runs the event, judges score on a private link, public page shows placements only (no marks).

MIT licensed — see [LICENSE](LICENSE). Built by [Nishal K](https://github.com/nishal21).

## Run locally

```bash
cp .env.example .env
# set ADMIN_PASSWORD and SESSION_SECRET (≥32 chars)
mkdir -p data
npm install
npx prisma migrate deploy
npm run dev
```

- Results: http://localhost:3000/results  
- Admin: http://localhost:3000/login  



## Stack

Next.js App Router, Prisma + SQLite, Tailwind, Framer Motion, `@react-pdf/renderer`.

## VPS

[`deploy/DEPLOY.md`](deploy/DEPLOY.md)

Before you push:

```bash
npm run check:repo
```
