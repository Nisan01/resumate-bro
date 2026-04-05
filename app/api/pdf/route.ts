// app/api/pdf/route.ts
import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';

export async function GET() {
  try {
    const res = await fetch('https://bitcoin.org/bitcoin.pdf');
    const buffer = await res.arrayBuffer();

    const { text } = await extractText(new Uint8Array(buffer));
    const fullText = Array.isArray(text) ? text.join('\n') : text;

    return NextResponse.json({ text: fullText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}