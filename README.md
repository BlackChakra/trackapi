# TrackAPI — Shipment Tracking Service

An API-first web service for tracking global shipments using tracking numbers, powered by [TrackingMore](https://www.trackingmore.com/).

## Features

- **API key authentication** — secured with `x-api-key` header
- **Courier auto-detection** — or manual selection via courier code
- **Real-time tracking** — status, checkpoints, and last event data
- **Standardized JSON** — consistent response format across all carriers
- **Rate limiting** — 30 requests/minute per IP (configurable)
- **CORS support** — configurable allowed origins
- **Input validation** — tracking number and courier code sanitization
- **Web UI** — built-in tracking form at `/track`

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env.local` file in the project root:
   ```env
   TRACKINGMORE_API_KEY=your_trackingmore_api_key
   API_KEY=your_custom_api_key
   ALLOWED_ORIGINS=*
   ```
   | Variable | Description |
   |----------|-------------|
   | `TRACKINGMORE_API_KEY` | Your TrackingMore API key |
   | `API_KEY` | API key for authenticating clients |
   | `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins (default: `*`) |

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npx vitest run
   ```

## API Usage

### Endpoint

`POST /api/track`

#### Headers
| Header | Value |
|--------|-------|
| `x-api-key` | Your API key |
| `Content-Type` | `application/json` |

#### Request Body
```json
{
  "tracking_number": "<tracking number>",
  "courier": "<optional courier code>"
}
```
- `tracking_number` (required) — 3-60 alphanumeric characters
- `courier` (optional) — courier code (auto-detected if omitted)

#### Example Request
```bash
curl -X POST http://localhost:3000/api/track \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"tracking_number": "1Z999AA10123456784"}'
```

#### Success Response (200)
```json
{
  "tracking_number": "1Z999AA10123456784",
  "courier": "ups",
  "status": "delivered",
  "last_checkpoint": { ... },
  "checkpoints": [ ... ]
}
```

#### Error Responses
| Status | Condition |
|--------|-----------|
| `400` | Invalid input, missing tracking number, or courier auto-detect failure |
| `401` | Missing or invalid API key |
| `404` | No tracking data found |
| `429` | Rate limit exceeded |

## Project Structure

```
src/
├── middleware.ts              # Rate limiting + CORS
├── app/
│   ├── types.ts               # TypeScript interfaces
│   ├── lib/
│   │   ├── logger.ts          # Structured logging
│   │   ├── validation.ts      # Input validation
│   │   └── trackingmore.service.ts  # TrackingMore API service
│   ├── api/track/route.ts     # API endpoint
│   ├── track/
│   │   ├── actions.ts         # Server Action (secure)
│   │   └── page.tsx           # Tracking UI
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| External API | TrackingMore v4 |
| Deployment | Vercel-ready |

## Deploy

Deploy to [Vercel](https://vercel.com) with one click. Set your environment variables in the Vercel dashboard.
