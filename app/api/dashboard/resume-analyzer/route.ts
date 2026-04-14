// app/api/dashboard/resume-analyzer/route.ts

import { NextRequest } from 'next/server';
import { extractText as unpdfExtract } from 'unpdf';
import { analyzeProfilePrompt, analyzeDeepPrompt, analyzeRecruiterPrompt } from '@/lib/aiprompts/resume-analyzer/FullAnalysis';
import atsPractices from '@/lib/aiprompts/resume-analyzer/AtsPractices.json';

async function extractText(buffer: ArrayBuffer): Promise<string> {
  const { text } = await unpdfExtract(new Uint8Array(buffer));
  return Array.isArray(text) ? text.join('\n') : text;
}

function emit(controller: ReadableStreamDefaultController, section: string, data: any) {
  console.log(`✅ Emitting section: ${section}`);
  controller.enqueue(new TextEncoder().encode(JSON.stringify({ section, data }) + '\n'));
}

async function fetchWithRetry(url: string, options: RequestInit, section: string, retries = 3): Promise<Response | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, options);
    if (res.status === 429) {
      const wait = Math.min(1000 * Math.pow(2, attempt + 1) + Math.random() * 1000, 30000);
      console.warn(`[${section}] 429 — retrying in ${Math.round(wait)}ms...`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    return res;
  }
  console.error(`[${section}] All retries exhausted`);
  return null;
}

// Tries JSON.parse, then attempts to salvage truncated output
function safeParseJSON(raw: string): any | null {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Truncated mid-JSON — find last complete top-level field
    try {
      const lastComma = cleaned.lastIndexOf(',"');
      const truncated = cleaned.slice(0, lastComma) + '\n}';
      return JSON.parse(truncated);
    } catch {
      console.error('❌ JSON unrecoverable');
      return null;
    }
  }
}

function groqBody(model: string, content: string) {
  return JSON.stringify({
    model,
    max_tokens: 4096,  // explicit ceiling — Groq default is often lower
    messages: [{ role: 'user', content }],
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetRole = (formData.get('targetRole') as string) || 'Software Engineer';

    if (!file) return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });

    const buffer = await file.arrayBuffer();
    const text = await extractText(buffer);
    console.log('📄 Extracted text length:', text.length);

    const atsRulesJSON = JSON.stringify(atsPractices);

    const stream = new ReadableStream({
      async start(controller) {
        let tokens1 = 0, tokens2 = 0, tokens3 = 0;

        try {
          // ── CALL 1: Profile (header, contactInfo, summary, skills) ──────────
          console.log('🚀 Call 1: Profile analysis...');
          const res1 = await fetchWithRetry(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY_V2}`, 'Content-Type': 'application/json' },
              body: groqBody('llama-3.1-8b-instant', analyzeProfilePrompt(text, targetRole)),
            },
            'Call1-Profile'
          );

          if (res1?.ok) {
            const d1 = await res1.json();
            tokens1 = d1.usage?.total_tokens ?? 0;
            const parsed1 = safeParseJSON(d1.choices[0].message.content);

            emit(controller, 'header',      { ...(parsed1?.header ?? {}), targetRole });
            emit(controller, 'contactInfo', parsed1?.contactInfo ?? {});
            emit(controller, 'summary',     parsed1?.summary ?? {});
            emit(controller, 'skills',      parsed1?.skills ?? {});
            console.log(`🪙 Call 1 tokens: ${tokens1}`);
          } else {
            console.error('❌ Call 1 failed');
            emit(controller, 'header',      { name: '', currentRole: '', targetRole });
            emit(controller, 'contactInfo', {});
            emit(controller, 'summary',     {});
            emit(controller, 'skills',      {});
          }

          await new Promise(r => setTimeout(r, 2000));

          // ── CALL 2A: Work experience + certifications ─────────────────────
          console.log('🚀 Call 2A: Work experience + certifications...');
          const res2 = await fetchWithRetry(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY_V2}`, 'Content-Type': 'application/json' },
              body: groqBody('llama-3.3-70b-versatile', analyzeDeepPrompt(text, targetRole)),
            },
            'Call2A-WorkCerts'
          );

          if (res2?.ok) {
            const d2 = await res2.json();
            tokens2 = d2.usage?.total_tokens ?? 0;
            const parsed2 = safeParseJSON(d2.choices[0].message.content);

            emit(controller, 'workExperience',  parsed2?.workExperience  ?? {});
            emit(controller, 'certifications',  parsed2?.certifications  ?? {});
            console.log(`🪙 Call 2A tokens: ${tokens2}`);
          } else {
            console.error('❌ Call 2A failed');
            emit(controller, 'workExperience',  {});
            emit(controller, 'certifications',  {});
          }

          await new Promise(r => setTimeout(r, 1000));

          // ── CALL 2B: ATS evaluation + recruiter eye ───────────────────────
          console.log('🚀 Call 2B: ATS + recruiter...');
          const res3 = await fetchWithRetry(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY_V2}`, 'Content-Type': 'application/json' },
              body: groqBody('llama-3.3-70b-versatile', analyzeRecruiterPrompt(text, targetRole, atsRulesJSON)),
            },
            'Call2B-ATSRecruiter'
          );

          if (res3?.ok) {
            const d3 = await res3.json();
            tokens3 = d3.usage?.total_tokens ?? 0;
            const parsed3 = safeParseJSON(d3.choices[0].message.content);

            emit(controller, 'atsEvaluation', parsed3?.atsEvaluation ?? {});
            emit(controller, 'recruiterEye',  parsed3?.recruiterEye  ?? {});
            console.log(`🪙 Call 2B tokens: ${tokens3}`);
          } else {
            console.error('❌ Call 2B failed');
            emit(controller, 'atsEvaluation', {});
            emit(controller, 'recruiterEye',  {});
          }

          const totalTokensUsed = tokens1 + tokens2 + tokens3;
          console.log(`🪙 Total tokens: ${totalTokensUsed}`);
          emit(controller, 'totalTokensUsed', { count: totalTokensUsed });

        } catch (err) {
          console.error('💥 Stream error:', err);
          emit(controller, 'error', { message: 'Something went wrong processing your resume' });
        } finally {
          console.log('✅ Closing stream');
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });

  } catch (err) {
    console.error('❌ POST handler failed:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}