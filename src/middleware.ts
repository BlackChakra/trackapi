import { NextRequest, NextResponse } from 'next/server';

// ─── In-memory Rate Limiter (sliding window) ────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30;

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now > entry.resetAt) {
        requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    entry.count++;
    return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requestCounts) {
        if (now > entry.resetAt) {
            requestCounts.delete(ip);
        }
    }
}, 5 * 60_000);

// ─── CORS Configuration ────────────────────────────────────────────
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') ?? ['*'];

function getCorsHeaders(origin: string | null): Record<string, string> {
    const allowedOrigin =
        ALLOWED_ORIGINS.includes('*') || (origin && ALLOWED_ORIGINS.includes(origin))
            ? (origin ?? '*')
            : '';

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        'Access-Control-Max-Age': '86400',
    };
}

// ─── Middleware ──────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only apply to API routes
    if (!pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: corsHeaders }
        );
    }

    // Attach CORS headers to the response
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
