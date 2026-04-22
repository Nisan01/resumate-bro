import { NextRequest } from 'next/server';
import { extractText as unpdfExtract } from 'unpdf';

import {
  analyzeProfilePrompt,
  analyzeDeepPrompt,
} from '@/lib/aiprompts/resume-analyzer/FullAnalysis';

import atsPractices from '@/lib/aiprompts/resume-analyzer/AtsPractices.json';

async function extractText(buffer: ArrayBuffer): Promise<string> {
  const { text } = await unpdfExtract(new Uint8Array(buffer));
  return Array.isArray(text) ? text.join('\n') : text;
}

function emit(
  controller: ReadableStreamDefaultController,
  section: string,
  data: any
) {
  console.log(`✅ Emitting section: ${section}`);
  controller.enqueue(
    new TextEncoder().encode(JSON.stringify({ section, data }) + '\n')
  );
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  section: string,
  retries = 3
): Promise<Response | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429) {
      const wait = Math.min(1000 * Math.pow(2, attempt + 1) + Math.random() * 1000, 30000);
      console.warn(`[${section}] 429 rate limit — retrying in ${Math.round(wait)}ms...`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    return res;
  }

  console.error(`[${section}] All retries exhausted`);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetRole = (formData.get('targetRole') as string) || 'Software Engineer';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const text = await extractText(buffer);

    console.log('📄 Extracted text length:', text.length);

    const atsRulesJSON = JSON.stringify(atsPractices);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          
          console.log('🚀 Call 1: Profile analysis...');

          const res1 = await fetchWithRetry(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemma-4-31b-it:free',
                messages: [
                  {
                    role: 'user',
                    content: analyzeProfilePrompt(text, targetRole),
                  },
                ],
              }),
            },
            'Call1-Profile'
          );

          let tokens1 = 0;

          if (res1 && res1.ok) {
            const d1 = await res1.json();
            tokens1 = d1.usage?.total_tokens ?? 0;

            try {
              const parsed1 = JSON.parse(
                d1.choices[0].message.content.replace(/```json|```/g, '').trim()
              );

              emit(controller, 'header', {
                ...(parsed1.header ?? {}),
                targetRole,
              });
              emit(controller, 'contactInfo', parsed1.contactInfo ?? {});
              emit(controller, 'summary', parsed1.summary ?? {});
              emit(controller, 'skills', parsed1.skills ?? {});

              console.log(`🪙 Call 1 tokens: ${tokens1}`);
            } catch (parseErr) {
              console.error('❌ Call 1 JSON parse error:', parseErr);
              emit(controller, 'header', { name: '', currentRole: '', targetRole });
              emit(controller, 'contactInfo', {});
              emit(controller, 'summary', {});
              emit(controller, 'skills', {});
            }
          } else {
            console.error('❌ Call 1 failed or null response');
            emit(controller, 'header', { name: '', currentRole: '', targetRole });
            emit(controller, 'contactInfo', {});
            emit(controller, 'summary', {});
            emit(controller, 'skills', {});
          }

          
          await new Promise(r => setTimeout(r, 2000));

          
          console.log('🚀 Call 2: Deep analysis...');

          const res2 = await fetchWithRetry(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'stepfun/step-3.5-flash:free',
                messages: [
                  {
                    role: 'user',
                    content: analyzeDeepPrompt(text, targetRole, atsRulesJSON),
                  },
                ],
              }),
            },
            'Call2-Deep'
          );

          let tokens2 = 0;

          if (res2 && res2.ok) {
            const d2 = await res2.json();
            tokens2 = d2.usage?.total_tokens ?? 0;

            try {
              const parsed2 = JSON.parse(
                d2.choices[0].message.content.replace(/```json|```/g, '').trim()
              );

              emit(controller, 'workExperience', parsed2.workExperience ?? {});
              emit(controller, 'certifications', parsed2.certifications ?? {});
              emit(controller, 'atsEvaluation', parsed2.atsEvaluation ?? {});
              emit(controller, 'recruiterEye', parsed2.recruiterEye ?? {});

              console.log(`🪙 Call 2 tokens: ${tokens2}`);
            } catch (parseErr) {
              console.error('❌ Call 2 JSON parse error:', parseErr);
              emit(controller, 'workExperience', {});
              emit(controller, 'certifications', {});
              emit(controller, 'atsEvaluation', {});
              emit(controller, 'recruiterEye', {});
            }
          } else {
            console.error('❌ Call 2 failed or null response');
            emit(controller, 'workExperience', {});
            emit(controller, 'certifications', {});
            emit(controller, 'atsEvaluation', {});
            emit(controller, 'recruiterEye', {});
          }

          
          const totalTokensUsed = tokens1 + tokens2;
          console.log(`🪙 Total tokens used: ${totalTokensUsed}`);
          emit(controller, 'totalTokensUsed', { count: totalTokensUsed });

        } catch (err) {
          console.error('💥 Stream fatal error:', err);
          emit(controller, 'error', {
            message: 'Something went wrong while processing your resume',
          });
        } finally {
          console.log('✅ Closing stream');
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
      },
    });

  } catch (err) {
    console.error('❌ POST handler failed:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
