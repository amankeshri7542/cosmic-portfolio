import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    // Block oversized payloads before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 400 });
    }

    const { name, location } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 100);

    // Validate name characters (includes Devanagari for Hindi names)
    const nameRegex = /^[a-zA-Z\u0900-\u097F\s\-'.]{2,100}$/;
    if (!nameRegex.test(cleanName)) {
      return NextResponse.json({ error: 'Invalid name format' }, { status: 400 });
    }

    const cleanLocation = location ? String(location).trim().slice(0, 100) : 'Unknown';

    await sql`
      INSERT INTO visitors (name, location)
      VALUES (${cleanName}, ${cleanLocation})
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Non-fatal: don't error out users if DB fails
    console.error('Visitor log error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
