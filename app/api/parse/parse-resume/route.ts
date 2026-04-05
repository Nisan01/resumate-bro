// app/api/parse/parse-resume/route.ts

import { NextRequest } from 'next/server';
import { extractText as unpdfExtract } from 'unpdf';

import { analyzeContactInfoPrompt } from '@/lib/aiprompts/resume-analyzer/ContactInfoPrompt';
import { analyzeSummaryPrompt } from '@/lib/aiprompts/resume-analyzer/ProfessionalSummary';
import { analyzeWorkExperiencePrompt } from '@/lib/aiprompts/resume-analyzer/WorkExperiencePrompt';
import { analyzeSkillsPrompt } from '@/lib/aiprompts/resume-analyzer/Skills';
import { generateCertificationsProjectsPrompt } from '@/lib/aiprompts/resume-analyzer/CertificationProjectPrompt';
import { analyzeATSPrompt } from '@/lib/aiprompts/resume-analyzer/ATSEvaluation';
import { analyzeRecruiterEyePrompt } from '@/lib/aiprompts/resume-analyzer/RecruitersEye';

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

async function askAI(
  section: string,
  prompt: string,
  controller: ReadableStreamDefaultController
) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'stepfun/step-3.5-flash:free',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.error(`[${section}] HTTP error:`, res.status);
      emit(controller, section, { error: 'API error' });
      return;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      console.error(`[${section}] Empty response`);
      emit(controller, section, {});
      return;
    }

    try {
      const parsed = JSON.parse(
        raw.replace(/```json|```/g, '').trim()
      );
      emit(controller, section, parsed);
    } catch (err) {
      console.error(`[${section}] JSON parse failed`);
      emit(controller, section, {});
    }

  } catch (err) {
    console.error(`[${section}] fetch failed:`, err);
    emit(controller, section, { error: 'Network failure' });
  }
}

export async function POST(req: NextRequest) {    
  try {
    const formData = await req.formData();  
    const file = formData.get('file') as File;
    const targetRole =
      (formData.get('targetRole') as string) || 'Software Engineer';

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
          // =========================
          // 1. HEADER FETCH (SAFE)
          // =========================

          let header = {
            name: '',
            currentRole: '',
            targetRole,
          };

          try {
            console.log('🚀 Fetching header info...');

            const headerRes = await fetch(
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
                      content: `Extract from this resume:
- "name": candidate full name
- "currentRole": current job title (empty string if student or none)
- "targetRole": role they are targeting based on skills and projects

JSON only. No explanation.

Resume:
${text.slice(0, 2000)}`,
                    },
                  ],
                }),
              }
            );

            if (!headerRes.ok) {
              throw new Error(`Header API failed: ${headerRes.status}`);
            }

            const headerData = await headerRes.json();
            const headerRaw =
              headerData.choices?.[0]?.message?.content ?? '{}';

            header = JSON.parse(
              headerRaw.replace(/```json|```/g, '').trim()
            );

          } catch (err) {
            console.error('❌ Header fetch failed:', err);
          }

          emit(controller, 'header', { ...header, targetRole });

          // =========================
          // 2. PARALLEL SECTIONS (SAFE)
          // =========================

          console.log('🚀 Starting all analysis sections...');

          await Promise.allSettled([
            askAI('contactInfo', analyzeContactInfoPrompt(text), controller),
            askAI('summary', analyzeSummaryPrompt(text, targetRole), controller),
            askAI(
              'workExperience',
              analyzeWorkExperiencePrompt(text, targetRole),
              controller
            ),
            askAI('skills', analyzeSkillsPrompt(text, targetRole), controller),
            askAI(
              'certifications',
              generateCertificationsProjectsPrompt(text),
              controller
            ),
            askAI(
              'recruiterEye',
              analyzeRecruiterEyePrompt(text, targetRole),
              controller
            ),
            askAI(
              'atsEvaluation',
              analyzeATSPrompt(text, atsRulesJSON),
              controller
            ),
          ]);

        } catch (err) {
          console.error('💥 Stream fatal error:', err);
          emit(controller, 'error', {
            message: 'Something went wrong while processing resume',
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