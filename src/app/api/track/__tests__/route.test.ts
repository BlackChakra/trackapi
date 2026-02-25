import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// ─── Setup ──────────────────────────────────────────────────────────

beforeEach(() => {
    vi.stubEnv('API_KEY', 'test-api-key');
    vi.stubEnv('TRACKINGMORE_API_KEY', 'test-tracking-key');
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

function createRequest(body: unknown, apiKey = 'test-api-key'): NextRequest {
    return new NextRequest('http://localhost:3000/api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify(body),
    });
}

// ─── Authentication ─────────────────────────────────────────────────

describe('POST /api/track — Authentication', () => {
    it('returns 401 when x-api-key is missing', async () => {
        const req = new NextRequest('http://localhost:3000/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracking_number: 'ABC123' }),
        });

        const res = await POST(req);
        expect(res.status).toBe(401);

        const json = await res.json();
        expect(json.error).toBe('Unauthorized');
    });

    it('returns 401 when x-api-key is wrong', async () => {
        const req = createRequest({ tracking_number: 'ABC123' }, 'wrong-key');

        const res = await POST(req);
        expect(res.status).toBe(401);
    });
});

// ─── Validation ─────────────────────────────────────────────────────

describe('POST /api/track — Validation', () => {
    it('returns 400 for invalid JSON body', async () => {
        const req = new NextRequest('http://localhost:3000/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'test-api-key',
            },
            body: 'not json',
        });

        const res = await POST(req);
        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.error).toBe('Invalid JSON body');
    });

    it('returns 400 when tracking_number is missing', async () => {
        const req = createRequest({});

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('returns 400 when tracking_number has invalid characters', async () => {
        const req = createRequest({ tracking_number: '<script>alert("xss")</script>' });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('returns 400 when courier code is invalid', async () => {
        const req = createRequest({ tracking_number: 'ABC123', courier: 'bad courier!' });

        const res = await POST(req);
        expect(res.status).toBe(400);
    });
});

// ─── Tracking Success ───────────────────────────────────────────────

describe('POST /api/track — Tracking', () => {
    it('returns tracking data on success', async () => {
        // Mock detect + tracking calls
        vi.spyOn(globalThis, 'fetch')
            // First call: detect courier
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        meta: { code: 200, type: 'Success', message: 'Success' },
                        data: {
                            couriers: [{ code: 'fedex', name: 'FedEx', country_code: 'US', phone: '', homepage: '' }],
                        },
                    }),
                    { status: 200 }
                )
            )
            // Second call: fetch tracking
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        meta: { code: 200, type: 'Success', message: 'Success' },
                        data: {
                            items: [
                                {
                                    tracking_number: 'ABC123',
                                    courier_code: 'fedex',
                                    status: 'in_transit',
                                    lastEvent: null,
                                    origin_info: { trackinfo: [] },
                                    destination_info: null,
                                },
                            ],
                        },
                    }),
                    { status: 200 }
                )
            );

        const req = createRequest({ tracking_number: 'ABC123' });
        const res = await POST(req);

        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.tracking_number).toBe('ABC123');
        expect(json.courier).toBe('fedex');
        expect(json.status).toBe('in_transit');
        expect(json.checkpoints).toEqual([]);
    });

    it('returns 400 when courier auto-detection fails', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: { couriers: [] },
                }),
                { status: 200 }
            )
        );

        const req = createRequest({ tracking_number: 'UNKNOWN123' });
        const res = await POST(req);

        expect(res.status).toBe(400);

        const json = await res.json();
        expect(json.error).toContain('auto-detect');
    });

    it('returns 404 when no tracking data found', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: { items: [] },
                }),
                { status: 200 }
            )
        );

        const req = createRequest({ tracking_number: 'ABC123', courier: 'fedex' });
        const res = await POST(req);

        expect(res.status).toBe(404);
    });
});
