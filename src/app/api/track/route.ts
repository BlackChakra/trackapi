import { NextRequest, NextResponse } from 'next/server';
import type { TrackResponse, ApiErrorResponse } from '@/app/types';
import { validateTrackRequest } from '@/app/lib/validation';
import { detectCourier, fetchTracking } from '@/app/lib/trackingmore.service';
import { logger } from '@/app/lib/logger';

const CONTEXT = 'api/track';

// ─── Authentication ─────────────────────────────────────────────────
function authenticate(req: NextRequest): boolean {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    logger.error(CONTEXT, 'API_KEY environment variable is not set');
    return false;
  }
  const clientKey = req.headers.get('x-api-key');
  return clientKey === apiKey;
}

// ─── Helpers ────────────────────────────────────────────────────────
function jsonError(error: string, status: number, details?: unknown): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ error, ...(details !== undefined ? { details } : {}) }, { status });
}

// ─── POST Handler ───────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse<TrackResponse | ApiErrorResponse>> {
  // Auth check
  if (!authenticate(req)) {
    return jsonError('Unauthorized', 401);
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    logger.warn(CONTEXT, 'Failed to parse request body', {
      error: error instanceof Error ? error.message : String(error),
    });
    return jsonError('Invalid JSON body', 400);
  }

  // Validate input
  const validation = validateTrackRequest(body);
  if (!validation.success) {
    return jsonError(validation.error, 400);
  }

  const { tracking_number, courier } = validation.data;

  // Auto-detect courier if not provided
  let courierCode = courier;
  if (!courierCode) {
    courierCode = (await detectCourier(tracking_number)) ?? undefined;
    if (!courierCode) {
      return jsonError(
        'Unable to auto-detect courier. Please specify the courier manually.',
        400
      );
    }
  }

  // Fetch tracking
  const tracking = await fetchTracking(courierCode, tracking_number);
  if (!tracking) {
    return jsonError('No tracking data found', 404);
  }

  // Build typed response
  const response: TrackResponse = {
    tracking_number: tracking.tracking_number,
    courier: tracking.courier_code,
    status: tracking.status,
    last_checkpoint: tracking.lastEvent
      ? (tracking.origin_info?.trackinfo?.[0] ?? null)
      : null,
    checkpoints: tracking.origin_info?.trackinfo ?? [],
  };

  logger.info(CONTEXT, `Tracking fetched successfully`, {
    tracking_number: response.tracking_number,
    courier: response.courier,
    status: response.status,
  });

  return NextResponse.json(response);
}
