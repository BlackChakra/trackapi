import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectCourier, fetchTracking } from '../trackingmore.service';

// ─── Setup ──────────────────────────────────────────────────────────

beforeEach(() => {
    vi.stubEnv('TRACKINGMORE_API_KEY', 'test-api-key');
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

// ─── detectCourier ──────────────────────────────────────────────────

describe('detectCourier', () => {
    it('returns courier code on successful detection', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: {
                        couriers: [
                            { code: 'fedex', name: 'FedEx', country_code: 'US', phone: '', homepage: '' },
                        ],
                    },
                }),
                { status: 200 }
            )
        );

        const result = await detectCourier('1234567890');
        expect(result).toBe('fedex');
    });

    it('returns null when no couriers are detected', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: { couriers: [] },
                }),
                { status: 200 }
            )
        );

        const result = await detectCourier('invalid-number');
        expect(result).toBeNull();
    });

    it('returns null on HTTP error', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response('Internal Server Error', { status: 500 })
        );

        const result = await detectCourier('1234567890');
        expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

        const result = await detectCourier('1234567890');
        expect(result).toBeNull();
    });

    it('throws if TRACKINGMORE_API_KEY is not set', async () => {
        vi.stubEnv('TRACKINGMORE_API_KEY', '');

        await expect(detectCourier('1234567890')).rejects.toThrow(
            'TRACKINGMORE_API_KEY environment variable is not set'
        );
    });
});

// ─── fetchTracking ──────────────────────────────────────────────────

describe('fetchTracking', () => {
    it('returns tracking item on success', async () => {
        const mockItem = {
            tracking_number: '1234567890',
            courier_code: 'fedex',
            status: 'delivered',
            lastEvent: 'Delivered',
            origin_info: {
                trackinfo: [
                    {
                        Date: '2024-01-15',
                        StatusDescription: 'Delivered',
                        Details: 'Front door',
                    },
                ],
            },
            destination_info: null,
        };

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: { items: [mockItem] },
                }),
                { status: 200 }
            )
        );

        const result = await fetchTracking('fedex', '1234567890');
        expect(result).toEqual(mockItem);
    });

    it('returns null when no items in response', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: { items: [] },
                }),
                { status: 200 }
            )
        );

        const result = await fetchTracking('fedex', '1234567890');
        expect(result).toBeNull();
    });

    it('returns null on HTTP error', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response('Not Found', { status: 404 })
        );

        const result = await fetchTracking('fedex', '1234567890');
        expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
        vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

        const result = await fetchTracking('fedex', '1234567890');
        expect(result).toBeNull();
    });

    it('URL-encodes courier and tracking number', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    meta: { code: 200, type: 'Success', message: 'Success' },
                    data: { items: [] },
                }),
                { status: 200 }
            )
        );

        await fetchTracking('dhl-express', 'ABC 123');

        const calledUrl = fetchSpy.mock.calls[0][0] as string;
        expect(calledUrl).toContain('dhl-express');
        expect(calledUrl).toContain('ABC%20123');
    });
});
