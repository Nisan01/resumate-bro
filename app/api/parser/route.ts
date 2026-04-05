// app/api/parse/parse-resume/route.ts
import { NextRequest } from 'next/server';
import { analyzeContactInfoPrompt } from '@/lib/aiprompts/resume-analyzer/ContactInfoPrompt';
import { analyzeSummaryPrompt } from '@/lib/aiprompts/resume-analyzer/ProfessionalSummary';
import { analyzeWorkExperiencePrompt } from '@/lib/aiprompts/resume-analyzer/WorkExperiencePrompt';
import { analyzeSkillsPrompt } from '@/lib/aiprompts/resume-analyzer/Skills';
import { generateCertificationsProjectsPrompt } from '@/lib/aiprompts/resume-analyzer/CertificationProjectPrompt';
import { analyzeATSPrompt } from '@/lib/aiprompts/resume-analyzer/ATSEvaluation';
import atsPractices from '@/lib/aiprompts/resume-analyzer/AtsPractices.json';

async function extractText(buffer: ArrayBuffer): Promise<string> {
  // Lazy import so Next.js doesn't bundle it at module level
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  // Disable worker entirely for Node.js server-side
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    verbosity: 0,
  });

  const pdf = await loadingTask.promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return text;
}

function emit(controller: ReadableStreamDefaultController, section: string, data: any) {
  console.log(`✅ Emitting section: ${section}`, data);
  controller.enqueue(new TextEncoder().encode(JSON.stringify({ section, data }) + '\n'));
}

async function askAI(section: string, prompt: string, controller: ReadableStreamDefaultController) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'stepfun/step-3.5-flash:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;

  console.log(`[${section}] status:`, res.status);
  console.log(`[${section}] raw:`, raw);

  if (!raw) {
    console.error(`[${section}] no content. Error:`, data.error);
    emit(controller, section, {});
    return;
  }

  try {
    emit(controller, section, JSON.parse(raw.replace(/```json|```/g, '').trim()));
  } catch {
    console.error(`[${section}] JSON parse failed. Raw:`, raw.slice(0, 300));
    emit(controller, section, {});
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const targetRole = (formData.get('targetRole') as string) || 'Software Engineer';

  if (!file) return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });

  const buffer = await file.arrayBuffer();
  const text = await extractText(buffer);

  console.log('📄 Extracted text length:', text.length);
  console.log('📄 First 500 chars:', text.slice(0, 500));

  const atsRulesJSON = JSON.stringify(atsPractices);

  const stream = new ReadableStream({
    async start(controller) {
      console.log('🚀 Fetching header info...');
      const headerRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'stepfun/step-3.5-flash:free',
          messages: [{
            role: 'user',
            content: `Extract from this resume:
- "name": candidate full name
- "currentRole": current job title (empty string if student or none)
- "targetRole": role they are targeting based on skills and projects

JSON only. No explanation.

Resume:
${text.slice(0, 2000)}`,
          }],
        }),
      });

      const headerData = await headerRes.json();
      const headerRaw = headerData.choices?.[0]?.message?.content ?? '{}';
      console.log('🧠 Header raw:', headerRaw);

      try {
        const header = JSON.parse(headerRaw.replace(/```json|```/g, '').trim());
        emit(controller, 'header', { ...header, targetRole });
      } catch {
        emit(controller, 'header', { name: '', currentRole: '', targetRole });
      }

      console.log('🚀 Starting all analysis sections...');
      await Promise.all([
        askAI('contactInfo',    analyzeContactInfoPrompt(text),               controller),
        askAI('summary',        analyzeSummaryPrompt(text, targetRole),        controller),
        askAI('workExperience', analyzeWorkExperiencePrompt(text, targetRole), controller),
        askAI('skills',         analyzeSkillsPrompt(text, targetRole),         controller),
        askAI('certifications', generateCertificationsProjectsPrompt(text),    controller),
        askAI('atsEvaluation',  analyzeATSPrompt(text, atsRulesJSON),          controller),
      ]);

      console.log('✅ All done. Closing stream.');
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  });
}