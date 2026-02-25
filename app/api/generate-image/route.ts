import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_URL });
const LEONARDO_API_KEY = process.env.LEONARDO_URL;
const LEONARDO_BASE = 'https://cloud.leonardo.ai/api/rest/v1';

// Simple in-memory rate limiter (1 generation per IP)
const generatedIPs = new Set<string>();

const SPECIAL_CASES: Record<string, { message: string; image: string }> = {
  'manoj kumar': {
    message:
      'Ram Ram Papa, You don\'t need an AI generated message. "You are my world to me, My everything. You are My Ram for me in this world." Thank you for everything. Love you DAD 🦁',
    image: '/Ram.png',
  },
  'arti devi': {
    message:
      'Hello Mata Jii, Pranam kaise ho? Kaisa laga project? Love you MOM... I don\'t have words for you. Hm kuch bhi likh de kam hai. ❤️',
    image: '/mom.png',
  },
};

const NAME_ARTIST_SYSTEM_PROMPT = `You are a Master Environment Artist specializing in "Name Art" — creating breathtaking landscapes where natural elements visually form a person's name.

INSTRUCTIONS:
1. Research the given name's spiritual meaning.
2. Design a photorealistic landscape where natural elements (rivers, mountain ridges, cloud formations, tree lines, aurora trails, canyons, or light rays) are arranged so they subtly spell out or visually resemble the letters of the given name. The name should be organically woven into the environment, not as text overlay but as shapes formed by nature itself.
3. ANTIGRAVITY ELEMENTS: Integrate localized zero-gravity phenomena — suspended geological formations, levitating water droplets, or floating bioluminescent flora that also contribute to forming the name's silhouette.
4. The overall scene mood and color palette should reflect the name's meaning.
5. CRITICAL: The name must appear as natural formations (e.g., a river bending into the letter "A", mountain peaks forming "M", aurora lights tracing letters). It should NOT look like digital typography — it should look like nature coincidentally formed those shapes.

OUTPUT FORMAT (JSON ONLY):
{
  "short_meaning": "A 1-2 sentence poetic explanation of the name's meaning.",
  "image_prompt": "A breathtaking photorealistic landscape where natural elements visually form the name [NAME]. [DESCRIBE HOW SPECIFIC LETTERS ARE FORMED BY RIVERS/MOUNTAINS/CLOUDS/LIGHT]. The scene reflects the meaning: [MEANING-BASED MOOD]. Surreal antigravity elements: [FLOATING ELEMENTS CONTRIBUTING TO NAME SHAPE]. Cinematic golden hour lighting, volumetric fog, aerial perspective, Unreal Engine 5 render, 8k resolution, masterpiece. --no digital text, watermark, typography"
}`;

// Helper: poll Leonardo until generation completes or times out
async function pollLeonardo(generationId: string, maxAttempts = 10): Promise<string | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000)); // wait 3s between polls (~30s total)

    const res = await fetch(`${LEONARDO_BASE}/generations/${generationId}`, {
      headers: {
        Authorization: `Bearer ${LEONARDO_API_KEY}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) continue;

    const data = await res.json();
    const gen = data?.generations_by_pk;

    if (gen?.status === 'COMPLETE' && gen?.generated_images?.length > 0) {
      return gen.generated_images[0].url;
    }

    if (gen?.status === 'FAILED') {
      throw new Error('Leonardo image generation failed');
    }
  }

  throw new Error('Leonardo generation timed out');
}

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid name.' }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 80);
    const normalizedName = cleanName.toLowerCase().replace(/\s+/g, ' ');

    // Check special cases first — no rate limiting, no API calls
    const special = SPECIAL_CASES[normalizedName];
    if (special) {
      return NextResponse.json({
        meaning: special.message,
        imageUrl: special.image,
        isSpecial: true,
      });
    }

    // Rate limit for AI generation
    if (generatedIPs.has(ip)) {
      return NextResponse.json(
        { error: 'You have already received your cosmic image in this session.' },
        { status: 429 }
      );
    }

    // Extract first name only for image generation
    const firstName = cleanName.split(/\s+/)[0];

    // Step 1: GPT-4o-mini to interpret the first name & create image prompt
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: NAME_ARTIST_SYSTEM_PROMPT },
        { role: 'user', content: `Research and interpret the first name: "${firstName}"` },
      ],
      temperature: 0.85,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const rawContent = gptResponse.choices[0]?.message?.content ?? '{}';
    let nameData: { short_meaning?: string; image_prompt?: string } = {};
    try {
      nameData = JSON.parse(rawContent);
    } catch {
      nameData = {
        short_meaning: `${firstName} — a name that carries beauty and grace.`,
        image_prompt: `A sprawling, photorealistic landscape of floating mountain islands above a serene crystal lake at golden hour. Surreal antigravity elements: levitating boulders with waterfalls pouring upward, glowing bioluminescent moss on suspended rock formations. Cinematic lighting, volumetric fog, Unreal Engine 5 render, 8k resolution, masterpiece. --no text, watermark, letters, typography`,
      };
    }

    const meaning = nameData.short_meaning || `${firstName} — a name that carries beauty and grace.`;
    const imagePrompt =
      nameData.image_prompt ||
      `A breathtaking photorealistic landscape of a twilight forest with floating crystalline rock formations and levitating water droplets catching the last rays of sunlight. Volumetric fog, cinematic lighting, Unreal Engine 5 render, 8k resolution, masterpiece. --no text, watermark, letters, typography`;

    // Step 2: Leonardo AI image generation (async: start → poll → get URL)
    const startRes = await fetch(`${LEONARDO_BASE}/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LEONARDO_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        modelId: 'e316348f-7773-490e-adcd-46757c738eb7', // Leonardo SDXL
        width: 1024,
        height: 1024,
        num_images: 1,
      }),
    });

    if (!startRes.ok) {
      const errBody = await startRes.text();
      console.error('Leonardo start error:', startRes.status, errBody);
      throw new Error(`Leonardo API error: ${startRes.status}`);
    }

    const startData = await startRes.json();
    const generationId = startData?.sdGenerationJob?.generationId;

    if (!generationId) {
      console.error('Leonardo response missing generationId:', startData);
      throw new Error('No generationId returned from Leonardo');
    }

    // Poll until the image is ready (up to ~30 seconds)
    const imageUrl = await pollLeonardo(generationId);
    if (!imageUrl) {
      throw new Error('Failed to get image URL from Leonardo');
    }

    // Mark IP as used
    generatedIPs.add(ip);

    return NextResponse.json({ meaning, imageUrl, isSpecial: false });
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json(
      { error: 'Failed to generate your cosmic image. Please try again.' },
      { status: 500 }
    );
  }
}
