'use server';

import type { TrackResponse } from '@/app/types';
import { validateTrackingNumber, validateCourierCode } from '@/app/lib/validation';
import { detectCourier, fetchTracking } from '@/app/lib/trackingmore.service';
import { logger } from '@/app/lib/logger';

const CONTEXT = 'track-action';

export type TrackResult =
    | { success: true; data: TrackResponse }
    | { success: false; error: string };

/**
 * Server action to track a shipment.
 * Runs entirely server-side — the API key never reaches the browser.
 */
export async function trackShipment(
    trackingNumber: string,
    courierInput?: string
): Promise<TrackResult> {
    // Validate tracking number
    const validatedNumber = validateTrackingNumber(trackingNumber);
    if (!validatedNumber) {
        return { success: false, error: 'Invalid tracking number (3-60 alphanumeric characters)' };
    }

    // Validate courier if provided
    let courierCode: string | undefined;
    if (courierInput && courierInput.trim() !== '') {
        const validatedCourier = validateCourierCode(courierInput);
        if (!validatedCourier) {
            return { success: false, error: 'Invalid courier code' };
        }
        courierCode = validatedCourier;
    }

    // Auto-detect courier if not provided
    if (!courierCode) {
        const detected = await detectCourier(validatedNumber);
        if (!detected) {
            return {
                success: false,
                error: 'Unable to auto-detect courier. Please specify the courier manually.',
            };
        }
        courierCode = detected;
    }

    // Fetch tracking info
    const tracking = await fetchTracking(courierCode, validatedNumber);
    if (!tracking) {
        return { success: false, error: 'No tracking data found for this number.' };
    }

    logger.info(CONTEXT, 'Tracking fetched via server action', {
        tracking_number: tracking.tracking_number,
        courier: tracking.courier_code,
    });

    return {
        success: true,
        data: {
            tracking_number: tracking.tracking_number,
            courier: tracking.courier_code,
            status: tracking.status,
            last_checkpoint: tracking.lastEvent
                ? (tracking.origin_info?.trackinfo?.[0] ?? null)
                : null,
            checkpoints: tracking.origin_info?.trackinfo ?? [],
        },
    };
}
