import { NextRequest, NextResponse } from 'next/server';

// API key authentication middleware
function authenticate(req: NextRequest): boolean {
  const apiKey = process.env.API_KEY || '';
  const clientKey = req.headers.get('x-api-key');
  return clientKey === apiKey;
}

export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tracking_number, courier } = await req.json();
  if (!tracking_number) {
    return NextResponse.json({ error: 'Missing tracking_number' }, { status: 400 });
  }

  // Placeholder for AfterShip integration
  // TODO: Integrate AfterShip API here

  return NextResponse.json({
    status: 'pending',
    tracking_number,
    courier: courier || 'auto-detect',
    checkpoints: [],
    message: 'Tracking integration not yet implemented.'
  });
}
