import type {
    TrackingMoreDetectResponse,
    TrackingMoreTrackingItem,
    TrackingMoreTrackingResponse,
} from '@/app/types';
import { logger } from './logger';

const CONTEXT = 'trackingmore-service';
const REQUEST_TIMEOUT_MS = 10_000;

function getApiKey(): string {
    const key = process.env.TRACKINGMORE_API_KEY;
    if (!key) {
        throw new Error('TRACKINGMORE_API_KEY environment variable is not set');
    }
    return key;
}

/**
 * Create an AbortSignal that times out after REQUEST_TIMEOUT_MS.
 */
function createTimeoutSignal(): AbortSignal {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

/**
 * Detect the courier for a given tracking number using TrackingMore.
 * Returns the courier code string, or null if detection fails.
 */
export async function detectCourier(trackingNumber: string): Promise<string | null> {
    const apiKey = getApiKey();

    try {
        const resp = await fetch('https://api.trackingmore.com/v4/couriers/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Tracking-Api-Key': apiKey,
            },
            body: JSON.stringify({ tracking_number: trackingNumber }),
            signal: createTimeoutSignal(),
        });

        if (!resp.ok) {
            logger.warn(CONTEXT, `Courier detection failed with status ${resp.status}`, {
                trackingNumber,
            });
            return null;
        }

        const data: TrackingMoreDetectResponse = await resp.json();

        if (data.data?.couriers && data.data.couriers.length > 0) {
            const courierCode = data.data.couriers[0].code;
            logger.info(CONTEXT, `Detected courier: ${courierCode}`, { trackingNumber });
            return courierCode;
        }

        logger.warn(CONTEXT, 'No couriers detected', { trackingNumber });
        return null;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            logger.error(CONTEXT, 'Courier detection timed out', { trackingNumber });
        } else {
            logger.error(CONTEXT, 'Courier detection failed', {
                trackingNumber,
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return null;
    }
}

/**
 * Fetch tracking information for a shipment from TrackingMore.
 * Returns the tracking item, or null if not found / on error.
 */
export async function fetchTracking(
    courier: string,
    trackingNumber: string
): Promise<TrackingMoreTrackingItem | null> {
    const apiKey = getApiKey();
    const url = `https://api.trackingmore.com/v4/trackings/${encodeURIComponent(courier)}/${encodeURIComponent(trackingNumber)}`;

    try {
        const resp = await fetch(url, {
            headers: {
                'Tracking-Api-Key': apiKey,
            },
            signal: createTimeoutSignal(),
        });

        if (!resp.ok) {
            const errorBody = await resp.text();
            logger.warn(CONTEXT, `Tracking fetch failed with status ${resp.status}`, {
                courier,
                trackingNumber,
                body: errorBody,
            });
            return null;
        }

        const data: TrackingMoreTrackingResponse = await resp.json();
        const item = data.data?.items?.[0] ?? null;

        if (!item) {
            logger.warn(CONTEXT, 'No tracking items in response', { courier, trackingNumber });
        }

        return item;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            logger.error(CONTEXT, 'Tracking fetch timed out', { courier, trackingNumber });
        } else {
            logger.error(CONTEXT, 'Tracking fetch failed', {
                courier,
                trackingNumber,
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return null;
    }
}
