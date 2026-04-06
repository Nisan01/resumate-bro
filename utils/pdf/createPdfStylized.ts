// utils/createStylizedPdf.ts

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

export async function generateStylizedPdf(
  data: any,
  fileName: string
) {
  if (!data) throw new Error('No data provided');

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load fonts
  const [fontBytes, emojiFontBytes] = await Promise.all([
    fetch('/fonts/NotoSans-Regular.ttf').then(res => res.arrayBuffer()),
    fetch('/fonts/NotoSansSymbols2-Regular.ttf').then(res => res.arrayBuffer()),
  ]);

  const font = await pdfDoc.embedFont(fontBytes);
  const emojiFont = await pdfDoc.embedFont(emojiFontBytes);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  let y = height - 40;
  const margin = 50;
  const lineHeight = 16;

  // 🧠 Add new page if needed
  const checkPage = () => {
    if (y < 50) {
      page = pdfDoc.addPage();
      y = height - 40;
    }
  };

  // 🧠 Emoji-aware text renderer
  const drawTextWithEmoji = (
    text: string,
    options?: { bold?: boolean; size?: number }
  ) => {
    const size = options?.size || 12;
    let x = margin;

    for (const char of text) {
      const isEmoji = /\p{Extended_Pictographic}/u.test(char);
      const currentFont = isEmoji ? emojiFont : font;

      page.drawText(char, {
        x,
        y,
        size,
        font: currentFont,
        color: rgb(0, 0, 0),
      });

      x += currentFont.widthOfTextAtSize(char, size);
    }

    y -= lineHeight;
    checkPage();
  };

  const drawSectionTitle = (title: string) => {
    drawTextWithEmoji(title, { size: 16 });
    y -= 5;
  };

  // ===== HEADER =====
  drawTextWithEmoji(`User Report: ${data.name}`, { size: 18 });
  drawTextWithEmoji(`Email: ${data.email}`);
  drawTextWithEmoji(`ID: ${data.id}`);
  y -= 10;

  // ===== PROJECTS =====
  drawSectionTitle('Projects');

  (data.projects || []).forEach((proj: any, index: number) => {
    drawTextWithEmoji(
      `${index + 1}. ${proj.emoji || ''} ${proj.name} (${proj.status})`
    );

    drawTextWithEmoji(`   Description: ${proj.description || 'N/A'}`);
    drawTextWithEmoji(
      `   Technologies: ${(proj.techTags || []).join(', ')}`
    );
    drawTextWithEmoji(`   Progress: ${proj.progress ?? 0}%`);
    drawTextWithEmoji(`   Steps:`);

    (proj.steps || []).forEach((step: string) => {
      drawTextWithEmoji(`     - ${step}`);
    });

    y -= 5;
    checkPage();
  });

  y -= 10;

  // ===== RESUMES =====
  drawSectionTitle('Resumes');

  (data.resumes || []).forEach((resume: any, index: number) => {
    drawTextWithEmoji(
      `${index + 1}. Applicant: ${resume.applicantName || 'Unknown'}`
    );
    drawTextWithEmoji(`   File: ${resume.fileName || 'N/A'}`);

    if (resume.extractedSkills?.skills?.length) {
      drawTextWithEmoji(`   Skills:`);
      resume.extractedSkills.skills.forEach((skill: any) => {
        drawTextWithEmoji(
          `     - ${skill.name} (${skill.level || 'N/A'})`
        );
      });
    }

    if (resume.extractedProjects?.length) {
      drawTextWithEmoji(`   Projects:`);
      resume.extractedProjects.forEach((proj: any) => {
        drawTextWithEmoji(
          `     - ${proj.name}: ${proj.description}`
        );
      });
    }

    y -= 5;
    checkPage();
  });

  // ===== SAVE & DOWNLOAD =====
  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);

  link.download = fileName;
  link.click();
}