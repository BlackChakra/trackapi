// ─── TrackingMore API Response Types ────────────────────────────────

/** A courier returned by the TrackingMore detect endpoint */
export interface TrackingMoreCourier {
    code: string;
    name: string;
    country_code: string;
    phone: string;
    homepage: string;
}

/** Response from POST /v4/couriers/detect */
export interface TrackingMoreDetectResponse {
    meta: { code: number; type: string; message: string };
    data: {
        couriers: TrackingMoreCourier[];
    };
}

/** A single checkpoint in a tracking item */
export interface TrackingMoreCheckpoint {
    Date: string;
    StatusDescription: string;
    Details: string;
    checkpoint_time?: string;
    status_description?: string;
    status?: string;
    date?: string;
    details?: string;
    location?: string;
}

/** A single tracking item from TrackingMore */
export interface TrackingMoreTrackingItem {
    tracking_number: string;
    courier_code: string;
    status: string;
    lastEvent: string | null;
    origin_info: {
        trackinfo: TrackingMoreCheckpoint[];
    } | null;
    destination_info: {
        trackinfo: TrackingMoreCheckpoint[];
    } | null;
}

/** Response from GET /v4/trackings/:courier/:tracking_number */
export interface TrackingMoreTrackingResponse {
    meta: { code: number; type: string; message: string };
    data: {
        items: TrackingMoreTrackingItem[];
    };
}

// ─── Internal API Types ─────────────────────────────────────────────

/** Validated track request body */
export interface TrackRequest {
    tracking_number: string;
    courier?: string;
}

/** Successful track response from our API */
export interface TrackResponse {
    tracking_number: string;
    courier: string;
    status: string;
    last_checkpoint: TrackingMoreCheckpoint | null;
    checkpoints: TrackingMoreCheckpoint[];
}

/** Standardized API error response */
export interface ApiErrorResponse {
    error: string;
    details?: unknown;
}
