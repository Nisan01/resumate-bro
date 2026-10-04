import { NextRequest, NextResponse } from 'next/server';
import { analyzeProjectPrompt } from '../../../dashboard/projects/_components/aiprompt/AiPrompts';

export async function POST(req: NextRequest) {
  try {
    const { project, projectContext } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: analyzeProjectPrompt(project, projectContext) }],
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Project analysis AI error:', res.status, errorText);
      return NextResponse.json(
        { error: 'AI project analysis is temporarily unavailable. Please try again later.' },
        { status: res.status === 429 ? 429 : 502 }
      );
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: 'AI returned an empty analysis. Please try again.' }, { status: 502 });
    }
    
    const cleanedJson = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
    if (
      !Array.isArray(cleanedJson?.analysis?.good) ||
      !Array.isArray(cleanedJson?.follow_up) ||
      typeof cleanedJson?.summary !== 'string' ||
      typeof cleanedJson?.overall_feedback !== 'string'
    ) {
      return NextResponse.json({ error: 'AI returned an invalid analysis. Please try again.' }, { status: 502 });
    }

    return NextResponse.json(cleanedJson);

  } catch (error) {
    console.error('Project analysis failed:', error);
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}
