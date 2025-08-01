This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!


---

# Shipment Tracking API

This project includes an API-first web service for tracking global shipments using tracking numbers, powered by TrackingMore.

## Features
- API key authentication
- Courier auto-detection (or manual selection)
- Real-time tracking via TrackingMore
- Standardized JSON responses
- Ready for integration with other apps/services

## Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment variables:**
   Create a `.env.local` file in the project root with:
   ```env
   TRACKINGMORE_API_KEY=your_trackingmore_api_key
   API_KEY=your_custom_api_key
   ```
   - `TRACKINGMORE_API_KEY`: Your TrackingMore API key
   - `API_KEY`: Your own API key for authenticating users of this API

3. **Run the development server:**
   ```bash
   npm run dev
   ```

## API Usage

### Endpoint
`POST /api/track`

#### Headers
- `x-api-key: <your_custom_api_key>`
- `Content-Type: application/json`

#### Request Body
```json
{
  "tracking_number": "<tracking number>",
  "courier": "<optional courier code>"
}
```
- `tracking_number` (required): The shipment tracking number
- `courier` (optional): Courier code (if omitted, auto-detection is used)

#### Example Request
```http
POST /api/track
x-api-key: mysecretkey
Content-Type: application/json

{
  "tracking_number": "1234567890"
}
```

#### Example Success Response
```json
{
  "tracking_number": "1234567890",
  "courier": "fedex",
  "status": "delivered",
  "last_checkpoint": { /* ... */ },
  "checkpoints": [ /* ... */ ],
  "raw": { /* full TrackingMore response */ }
}
```

#### Example Error Response
```json
{
  "error": "Unable to auto-detect courier. Please specify the courier manually."
}
```

## Integration
- This API is designed for easy integration into other apps and services.
- Returns clear, standardized JSON for all responses.

## Security
- Your TrackingMore API key and your own API key are kept in `.env.local` (never commit this file).
- All requests require the correct `x-api-key` header.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
