# SNR.red — Public API v1 Reference

Programmatic API for creating and managing short URLs from your own projects.

- **Base URL (prod):** `https://api.snr.red/api/v1`
- **Base URL (local):** `http://localhost:3001/api/v1`
- **Auth:** every request must include an API key in the `X-API-Key` header
  (or `Authorization: Bearer snr_live_...`).
- **Content type:** `application/json`.
- **Response envelope:** `{ "success": boolean, "data"?: ..., "error"?: string, "message"?: string }`

## Getting an API key

1. Sign in to the dashboard at `https://snr.red`.
2. Open the **API Keys** tab → **New key** → give it a name.
3. Copy the token shown **once** (format `snr_live_...`). It is stored hashed and
   cannot be retrieved again. Losing it means creating a new one.

Keys are scoped: `urls:read`, `urls:write`, `analytics:read` (all granted by default).
Revoke a key any time from the dashboard; revoked keys immediately return `401`.

## Rate limits

Requests are limited **per API key** (default 120 req/min, configurable via
`API_RATE_LIMIT_*`). Exceeding it returns `429` with standard `RateLimit-*` headers.

## Endpoints

### Create a short URL
`POST /urls` — scope `urls:write`

```bash
curl -X POST https://api.snr.red/api/v1/urls \
  -H "X-API-Key: snr_live_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com/some/long/path","customCode":"promo"}'
```

Body fields: `originalUrl` (required, must include protocol), `customCode`
(optional, 3–20 chars `[a-zA-Z0-9_-]`), `title`, `description`, `expiresAt`
(ISO 8601, future), `generateQr` (boolean).

`201` → `data` is the created URL (`shortCode`, `shortUrl`, …).
`409` if `customCode` is taken.

### List your URLs
`GET /urls` — scope `urls:read`

Returns every active URL owned by the key's user (with click counts).

### Get one URL
`GET /urls/:shortCode` — scope `urls:read`

`404` if it doesn't exist or isn't owned by the key's user.

### Delete a URL
`DELETE /urls/:shortCode` — scope `urls:write`

Soft-deletes (deactivates) the URL. `404` if not owned by the key's user.

### URL analytics
`GET /urls/:shortCode/analytics` — scope `analytics:read`

Returns total/unique clicks and breakdowns by date, country, device, browser.

## Errors

| Status | Meaning |
|--------|---------|
| 400 | Validation error (see `error`) |
| 401 | Missing / invalid / revoked API key |
| 403 | Key lacks the required scope, or resource not owned by the key |
| 404 | Resource not found (or not owned) |
| 409 | Custom code already exists |
| 429 | Rate limit exceeded for this key |

## Notes

- The browser app (dashboard) authenticates with JWT + an anonymous `x-user-id`
  header. Those are separate from API keys; server-to-server integrations should
  always use API keys.
- Redirects (`https://snr.red/<shortCode>`) are public and unauthenticated.
