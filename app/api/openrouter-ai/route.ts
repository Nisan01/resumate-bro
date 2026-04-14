import { NextResponse } from 'next/server';
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function GET() {
  try {
    const completion = await openRouter.chat.send({
      chatRequest: {
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          {
            role: 'user',
            content: 'What is the meaning of life?',
          },
        ],
      },
    });

    return NextResponse.json(completion);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}