import { NextRequest, NextResponse } from 'next/server';

const TRACKINGMORE_API_KEY = process.env.TRACKINGMORE_API_KEY || '';

// Helper: API key authentication
function authenticate(req: NextRequest): boolean {
  const apiKey = process.env.API_KEY || '';
  const clientKey = req.headers.get('x-api-key');
  return clientKey === apiKey;
}

// Helper: Detect courier via TrackingMore
async function detectCourier(trackingNumber: string): Promise<string | undefined> {
  if (!TRACKINGMORE_API_KEY) return undefined;
  const resp = await fetch('https://api.trackingmore.com/v4/couriers/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Tracking-Api-Key': TRACKINGMORE_API_KEY,
    } as Record<string, string>,
    body: JSON.stringify({ tracking_number: trackingNumber }),
  });
  if (!resp.ok) return undefined;
  const data = await resp.json();
  if (
    data?.data?.couriers &&
    Array.isArray(data.data.couriers) &&
    data.data.couriers.length > 0
  ) {
    // Use the first detected courier
    return data.data.couriers[0].code as string;
  }
  return undefined;
}

// Helper: Fetch tracking info from TrackingMore
async function fetchTrackingInfo(courier: string, trackingNumber: string) {
  if (!TRACKINGMORE_API_KEY) return { ok: false, data: { meta: { message: 'TrackingMore API key not set.' } } };
  const url = `https://api.trackingmore.com/v4/trackings/${courier}/${trackingNumber}`;
  const resp = await fetch(url, {
    headers: {
      'Tracking-Api-Key': TRACKINGMORE_API_KEY,
    } as Record<string, string>,
  });
  const data = await resp.json();
  return { ok: resp.ok, data };
}

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tracking_number: string | undefined;
  let courier: string | undefined;
  try {
    const body = await req.json();
    tracking_number = body.tracking_number;
    courier = body.courier;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!tracking_number) {
    return NextResponse.json({ error: 'Missing tracking_number' }, { status: 400 });
  }

  // Auto-detect courier if not provided
  let courierCode: string | undefined = courier;
  if (!courierCode) {
    courierCode = await detectCourier(tracking_number);
    if (!courierCode) {
      return NextResponse.json({
        error: 'Unable to auto-detect courier. Please specify the courier manually.',
      }, { status: 400 });
    }
  }

  // Fetch tracking info
  const { ok, data } = await fetchTrackingInfo(courierCode, tracking_number);
  if (!ok) {
    return NextResponse.json({
      error: data?.meta?.message || 'Failed to fetch tracking info',
      details: data,
    }, { status: 400 });
  }

  // Standardize response
  const tracking = data.data?.items?.[0];
  if (!tracking) {
    return NextResponse.json({
      error: 'No tracking data found',
      details: data,
    }, { status: 404 });
  }

  return NextResponse.json({
    tracking_number: tracking.tracking_number,
    courier: tracking.courier_code,
    status: tracking.status,
    last_checkpoint: tracking.lastEvent || null,
    checkpoints: tracking.origin_info?.trackinfo || [],
    raw: tracking,
  });
}
