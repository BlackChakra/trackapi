import type { TrackRequest } from '@/app/types';

const TRACKING_NUMBER_MIN = 3;
const TRACKING_NUMBER_MAX = 60;
const COURIER_CODE_MAX = 40;

/** Alphanumeric, hyphens, spaces — covers all common carrier formats */
const TRACKING_NUMBER_PATTERN = /^[a-zA-Z0-9\-\s]+$/;

/** Lowercase alphanumeric with hyphens — matches TrackingMore courier codes */
const COURIER_CODE_PATTERN = /^[a-z0-9\-]+$/;

/**
 * Validate and sanitize a tracking number.
 * Returns the trimmed value, or null if invalid.
 */
export function validateTrackingNumber(input: unknown): string | null {
    if (typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (trimmed.length < TRACKING_NUMBER_MIN || trimmed.length > TRACKING_NUMBER_MAX) return null;
    if (!TRACKING_NUMBER_PATTERN.test(trimmed)) return null;
    return trimmed;
}

/**
 * Validate and sanitize a courier code.
 * Returns the lowercase trimmed value, or null if invalid.
 */
export function validateCourierCode(input: unknown): string | null {
    if (typeof input !== 'string') return null;
    const trimmed = input.trim().toLowerCase();
    if (trimmed.length === 0) return null;
    if (trimmed.length > COURIER_CODE_MAX) return null;
    if (!COURIER_CODE_PATTERN.test(trimmed)) return null;
    return trimmed;
}

type ValidationResult =
    | { success: true; data: TrackRequest }
    | { success: false; error: string };

/**
 * Validate the full track request body.
 * Returns typed TrackRequest on success, or an error string on failure.
 */
export function validateTrackRequest(body: unknown): ValidationResult {
    if (body === null || typeof body !== 'object') {
        return { success: false, error: 'Request body must be a JSON object' };
    }

    const { tracking_number, courier } = body as Record<string, unknown>;

    const validatedNumber = validateTrackingNumber(tracking_number);
    if (!validatedNumber) {
        return {
            success: false,
            error: `Invalid tracking_number: must be ${TRACKING_NUMBER_MIN}-${TRACKING_NUMBER_MAX} alphanumeric characters`,
        };
    }

    const result: TrackRequest = { tracking_number: validatedNumber };

    if (courier !== undefined && courier !== null && courier !== '') {
        const validatedCourier = validateCourierCode(courier);
        if (!validatedCourier) {
            return {
                success: false,
                error: 'Invalid courier code: must be lowercase alphanumeric with hyphens',
            };
        }
        result.courier = validatedCourier;
    }

    return { success: true, data: result };
}
