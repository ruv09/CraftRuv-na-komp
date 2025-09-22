# Warmly API (MVP)

Minimalist backend for the Warmly app: daily kind phrases, gentle support, and sharing warmth.

## Run locally

```bash
npm install
npm run build
npm start
# Server: http://localhost:3000
```

Optionally use dev mode:
```bash
npm run dev
```

## Endpoints

- GET /health
- POST /api/auth/device
  - Body: `{ locale: 'ru'|'en', timezone: string }`
  - Returns: `{ deviceId, locale, timezone }`
- GET /api/phrases?lang=ru&part=morning&limit=5
  - Query: `lang` ('ru'|'en'), `part` ('morning'|'day'|'evening', optional), `limit`
  - Returns: random phrases
- GET /api/phrases/:id
- POST /api/favorites
  - Body: `{ deviceId, phraseId }`
- GET /api/favorites?deviceId=...
  - Returns favorites with embedded phrase
- POST /api/warm
  - Body: `{ text, fromName?, toAlias? }`
- GET /api/warm
  - Latest 50 shared messages

## Notes

- In-memory storage for MVP (no DB required to run).
- RU/EN phrases seeded at startup.
- Next steps: Prisma + SQLite, per-device settings (locale/time windows), cron for scheduled sends.