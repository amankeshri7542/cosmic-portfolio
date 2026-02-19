import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { name, location } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 255);
    const cleanLocation = location ? String(location).trim().slice(0, 255) : 'Unknown';

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
