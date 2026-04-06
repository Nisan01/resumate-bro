import { NextRequest, NextResponse } from 'next/server';
import { analyzeProjectPrompt } from '../../../dashboard/projects/_components/aiprompt/AiPrompts';

export async function POST(req: NextRequest) {
  try {
    const { project, projectContext } = await req.json();

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_PROJECTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'stepfun/step-3.5-flash:free',
        messages: [{ role: 'user', content: analyzeProjectPrompt(project, projectContext) }],
      }),
    });

    

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
console.log("AI raw response:", data);
console.log("Raw content extracted:", rawContent);
    // Clean markdown and parse
    const cleanedJson = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
    console.log("Cleaned JSON:", cleanedJson);
    return NextResponse.json(cleanedJson);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}