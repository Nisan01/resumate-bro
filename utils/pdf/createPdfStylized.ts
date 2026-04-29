

import { PDFDocument, rgb, PDFPage, PDFFont, RGB } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const hex = (h: string): RGB => {
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
};

const C = {
  bg:     hex('#0a0d1a'),
  card:   hex('#12162a'),
  border: hex('#1e2440'),
  header: hex('#0d1228'),
  purple: hex('#c4b0ff'),
  cyan:   hex('#7ee8fa'),
  pink:   hex('#ff9de2'),
  white:  hex('#f0eeff'),
  muted:  hex('#7a7599'),
  good:   hex('#4ade80'),
  warn:   hex('#facc15'),
  bad:    hex('#f87171'),
  danger: hex('#ff6b6b'),
  stripe: hex('#0f1325'),
};

type Status = 'good' | 'ok' | 'missing' | 'needs improvement' | string;

const statusColor = (s: Status): RGB => {
  if (s === 'good') return C.good;
  if (s === 'ok')   return C.warn;
  return C.bad;
};

const statusLabel = (s: Status): string => {
  if (s === 'good')              return '● GOOD';
  if (s === 'ok')                return '● OK';
  if (s === 'missing')           return '● MISSING';
  if (s === 'needs improvement') return '● NEEDS WORK';
  return `● ${s.toUpperCase()}`;
};

const scoreColor = (score: number): RGB =>
  score >= 7 ? C.good : score >= 5 ? C.warn : C.bad;

const PAGE_W    = 595;
const PAGE_H    = 842;
const MARGIN    = 44;
const CONTENT_W = PAGE_W - MARGIN * 2;

class PdfRenderer {
  doc:      PDFDocument;
  page:     PDFPage;
  font:     PDFFont;
  boldFont: PDFFont;
  y:        number;

  constructor(doc: PDFDocument, page: PDFPage, font: PDFFont, boldFont: PDFFont) {
    this.doc      = doc;
    this.page     = page;
    this.font     = font;
    this.boldFont = boldFont;
    this.y        = PAGE_H - 40;
  }

  need(space: number) { if (this.y - space < 44) this.newPage(); }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.y    = PAGE_H - 40;
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.bg });
  }

  gap(h = 8) { this.y -= h; }

  text(str: string, opts: { x?: number; size?: number; color?: RGB; bold?: boolean; maxWidth?: number } = {}) {
    const { x = MARGIN, size = 9, color = C.white, bold = false, maxWidth = CONTENT_W } = opts;
    const f = bold ? this.boldFont : this.font;
    let safe = str ?? '';
    while (safe.length > 1 && f.widthOfTextAtSize(safe, size) > maxWidth)
      safe = safe.slice(0, -4) + '…';
    this.page.drawText(safe, { x, y: this.y, size, font: f, color });
    this.y -= size + 5;
    this.need(0);
  }

  para(str: string, opts: { x?: number; size?: number; color?: RGB; bold?: boolean; maxWidth?: number; lineH?: number } = {}) {
    const { x = MARGIN, size = 9, color = C.white, bold = false, maxWidth = CONTENT_W, lineH = size + 5 } = opts;
    const f     = bold ? this.boldFont : this.font;
    const words = (str ?? '').split(' ');
    let line    = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
        this.need(lineH + 4);
        this.page.drawText(line, { x, y: this.y, size, font: f, color });
        this.y -= lineH;
        line = word;
      } else { line = test; }
    }
    if (line) {
      this.need(lineH + 4);
      this.page.drawText(line, { x, y: this.y, size, font: f, color });
      this.y -= lineH;
    }
  }

  rule(color = C.border, thickness = 0.5) {
    this.page.drawLine({ start: { x: MARGIN, y: this.y + 4 }, end: { x: PAGE_W - MARGIN, y: this.y + 4 }, thickness, color });
    this.y -= 6;
  }

  sectionHeader(num: string, title: string) {
    this.need(40);
    this.gap(14);
    const hh = 24;
    const ty = this.y - hh + 7;
    this.page.drawRectangle({ x: MARGIN,     y: ty, width: 3,  height: hh, color: C.purple });
    this.page.drawRectangle({ x: MARGIN + 8, y: ty, width: 22, height: hh, color: C.card   });
    this.page.drawText(num,   { x: MARGIN + 12, y: ty + 8, size: 8,  font: this.boldFont, color: C.purple });
    this.page.drawText(title, { x: MARGIN + 36, y: ty + 7, size: 13, font: this.boldFont, color: C.white  });
    this.y -= hh + 4;
    this.rule(C.purple, 0.6);
  }

  statusPill(status: Status, x: number, y: number) {
    const label = statusLabel(status);
    const c     = statusColor(status);
    const sz    = 7;
    const pw    = this.font.widthOfTextAtSize(label, sz) + 10;
    const ph    = sz + 6;
    this.page.drawRectangle({ x, y: y - ph + 4, width: pw, height: ph, color: C.card });
    this.page.drawText(label, { x: x + 5, y: y - ph + 8, size: sz, font: this.font, color: c });
    return pw;
  }

  kvRow(key: string, value: string, valueColor = C.white, bold = false, last = false) {
    this.need(18);
    const rowH = 18;
    const rowY = this.y - rowH + 6;
    this.page.drawRectangle({ x: MARGIN, y: rowY, width: CONTENT_W, height: rowH, color: C.card });
    if (!last) this.page.drawLine({ start: { x: MARGIN, y: rowY }, end: { x: MARGIN + CONTENT_W, y: rowY }, thickness: 0.3, color: C.border });
    this.page.drawText(key, { x: MARGIN + 8, y: rowY + 5, size: 8, font: this.boldFont, color: C.muted });
    const f = bold ? this.boldFont : this.font;
    let val = value ?? '';
    while (val.length > 1 && f.widthOfTextAtSize(val, 8) > CONTENT_W * 0.65) val = val.slice(0, -4) + '…';
    this.page.drawText(val, { x: MARGIN + CONTENT_W * 0.32, y: rowY + 5, size: 8, font: f, color: valueColor });
    this.y -= rowH;
  }
}

export async function generateStylizedPdf(data: any, fileName: string) {
  if (!data) throw new Error('No data provided');

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontBytes = await fetch('/fonts/NotoSans-VariableFont_wdth,wght.ttf')
  .then(r => r.arrayBuffer());

const font     = await pdfDoc.embedFont(fontBytes);
const boldFont = font; 

  

  const firstPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
  firstPage.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.bg });

  const R = new PdfRenderer(pdfDoc, firstPage, font, boldFont);

  const firstResume = (data.resumes ?? [])[0];
  const analyses: any = firstResume?.analyses?.[0]?.analysisResult ?? {};

  const displayName: string = data.name ?? analyses?.header?.name ?? 'Resume Report';
  const targetRole           = analyses?.header?.targetRole  ?? '—';
  const currentRole          = analyses?.header?.currentRole ?? '—';
  const tokensUsed: number   = analyses?.totalTokensUsed?.count ?? 0;

  const headerH = 100;
  const headerY = PAGE_H - 40 - headerH;

  R.page.drawRectangle({ x: MARGIN, y: headerY, width: CONTENT_W, height: headerH, color: C.header });
  R.page.drawRectangle({ x: MARGIN, y: headerY, width: CONTENT_W, height: headerH, borderWidth: 0.8, borderColor: C.purple, color: C.header });
  R.page.drawRectangle({ x: MARGIN, y: headerY, width: 4,          height: headerH, color: C.purple });

  let nameStr = displayName;
  while (nameStr.length > 1 && boldFont.widthOfTextAtSize(nameStr, 22) > CONTENT_W * 0.52)
    nameStr = nameStr.slice(0, -4) + '…';

  R.page.drawText(nameStr,                     { x: MARGIN + 16, y: headerY + 68, size: 22, font: boldFont, color: C.white });
  R.page.drawText(currentRole,                 { x: MARGIN + 16, y: headerY + 50, size: 10, font,           color: C.muted });
  R.page.drawText(`Target: ${targetRole}`,     { x: MARGIN + 16, y: headerY + 34, size: 9,  font: boldFont, color: C.cyan  });
  R.page.drawText(`Email: ${data.email ?? '—'}`, { x: MARGIN + 16, y: headerY + 18, size: 8, font,           color: C.muted });

  const scoreItems = [
    { label: 'ATS',     val: analyses?.atsEvaluation?.overallATSScore                     },
    { label: 'Summary', val: analyses?.summary?.overall_score ?? analyses?.summary?.score },
    { label: 'Skills',  val: analyses?.skills?.overall_score                              },
    { label: 'Work',    val: analyses?.workExperience?.overall_score                      },
    { label: 'Contact', val: analyses?.contactInfo?.overall_score                         },
    { label: 'Certs',   val: analyses?.certifications?.overall_score                      },
  ];
  const boxW   = 44;
  const boxH   = 38;
  const startX = MARGIN + CONTENT_W - scoreItems.length * (boxW + 4) + 4;

  scoreItems.forEach((item, i) => {
    const bx = startX + i * (boxW + 4);
    const by = headerY + (headerH - boxH) / 2;
    const sc = typeof item.val === 'number' ? item.val : -1;
    const c  = sc >= 0 ? scoreColor(sc) : C.muted;

    R.page.drawRectangle({ x: bx, y: by, width: boxW, height: boxH, color: C.stripe });
    R.page.drawRectangle({ x: bx, y: by, width: boxW, height: boxH, borderWidth: 0.4, borderColor: C.border, color: C.stripe });

    const scoreStr = sc >= 0 ? `${sc}/10` : '—';
    R.page.drawText(scoreStr,   { x: bx + (boxW - boldFont.widthOfTextAtSize(scoreStr, 11)) / 2,    y: by + 18, size: 11, font: boldFont, color: c      });
    R.page.drawText(item.label, { x: bx + (boxW - font.widthOfTextAtSize(item.label, 7))   / 2,    y: by + 6,  size: 7,  font,           color: C.muted });
  });

  R.y = headerY - 10;

  R.gap(4);
  R.text(`Account ID: ${data.id ?? '—'}`, { size: 7, color: C.muted });
  R.text(
    `File: ${firstResume?.fileName ?? '—'}   |   Tokens used: ${tokensUsed > 0 ? tokensUsed.toLocaleString() : '—'}`,
    { size: 7, color: C.muted }
  );

  const hasAnalysis = firstResume && analyses && Object.keys(analyses).length > 0;

  if (hasAnalysis) {

    R.sectionHeader('01', 'Contact Information');
    const contact = analyses.contactInfo ?? {};

    (contact.contact_fields ?? []).forEach((field: any) => {
      R.need(20);
      const rowH = 20;
      const rowY = R.y - rowH + 8;
      R.page.drawRectangle({ x: MARGIN, y: rowY, width: CONTENT_W, height: rowH, color: C.card });
      R.page.drawLine({ start: { x: MARGIN, y: rowY }, end: { x: MARGIN + CONTENT_W, y: rowY }, thickness: 0.3, color: C.border });

      R.page.drawText(field.label ?? '', { x: MARGIN + 8, y: rowY + 6, size: 8, font: boldFont, color: C.muted });
      let val = field.value ?? '—';
      while (val.length > 1 && font.widthOfTextAtSize(val, 8) > 160) val = val.slice(0, -4) + '…';
      R.page.drawText(val, { x: MARGIN + 115, y: rowY + 6, size: 8, font, color: C.white });

      const sc   = field.score ?? 0;
      const bx   = MARGIN + 290;
      const bw   = 70;
      const fill = Math.round((sc / 10) * bw);
      R.page.drawRectangle({ x: bx, y: rowY + 4, width: bw, height: 6, color: C.border });
      if (fill > 0) R.page.drawRectangle({ x: bx, y: rowY + 4, width: fill, height: 6, color: scoreColor(sc) });
      R.page.drawText(`${sc}/10`, { x: bx + bw + 5, y: rowY + 5, size: 7, font: boldFont, color: scoreColor(sc) });
      R.statusPill(field.status, MARGIN + 380, rowY + 12);
      R.y -= rowH;
    });

    R.gap(6);
    R.text(`Overall: ${contact.overall_score ?? '—'}/10`, { size: 8, bold: true, color: scoreColor(contact.overall_score ?? 0) });
    (contact.suggestions ?? []).forEach((s: string) => R.para(`→ ${s}`, { size: 8, color: C.cyan, maxWidth: CONTENT_W }));

    R.sectionHeader('02', 'Professional Summary');
    const summary = analyses.summary ?? {};

    R.kvRow('Status', statusLabel(summary.status ?? ''), statusColor(summary.status ?? ''), true);
    R.kvRow('Score',  `${summary.overall_score ?? summary.score ?? '—'}/10`);
    R.gap(4);
    R.text('Current Summary:',  { size: 8, bold: true, color: C.muted });
    R.para(summary.summary  ?? '—', { size: 8, color: C.white, maxWidth: CONTENT_W });
    R.gap(4);
    R.text('Feedback:',         { size: 8, bold: true, color: C.muted });
    R.para(summary.feedback ?? '—', { size: 8, color: C.warn,  maxWidth: CONTENT_W });
    R.gap(4);
    R.text('Improved Version:', { size: 8, bold: true, color: C.muted });
    R.para(summary.improved ?? '—', { size: 8, color: C.cyan,  maxWidth: CONTENT_W });
    R.gap(4);
    (summary.suggestions ?? []).forEach((s: string) => R.para(`→ ${s}`, { size: 8, color: C.muted, maxWidth: CONTENT_W }));

    R.sectionHeader('03', 'Skills Analysis');
    const skillsData    = analyses.skills ?? {};
    const skills: any[] = skillsData.skills ?? [];

    R.need(18);
    const tHY = R.y - 18 + 8;
    R.page.drawRectangle({ x: MARGIN, y: tHY, width: CONTENT_W, height: 18, color: C.stripe });
    ['SKILL', 'LEVEL', 'SCORE', 'STATUS'].forEach((label, i) => {
      const xs = [MARGIN + 8, MARGIN + 120, MARGIN + 220, MARGIN + 340];
      R.page.drawText(label, { x: xs[i], y: tHY + 5, size: 7, font: boldFont, color: C.muted });
    });
    R.y -= 18;

    skills.forEach((sk: any, i: number) => {
      R.need(20);
      const rH = 20; const rY = R.y - rH + 8;
      R.page.drawRectangle({ x: MARGIN, y: rY, width: CONTENT_W, height: rH, color: i % 2 === 0 ? C.card : C.stripe });
      R.page.drawText(sk.name  ?? '',  { x: MARGIN + 8,   y: rY + 6, size: 8, font: boldFont, color: C.white });
      R.page.drawText(sk.level ?? '—', { x: MARGIN + 120,  y: rY + 6, size: 8, font,           color: C.muted });
      const sc = sk.score ?? 0; const bx = MARGIN + 220; const bw = 70;
      const fill = Math.round((sc / 10) * bw);
      R.page.drawRectangle({ x: bx, y: rY + 5, width: bw, height: 6, color: C.border });
      if (fill > 0) R.page.drawRectangle({ x: bx, y: rY + 5, width: fill, height: 6, color: scoreColor(sc) });
      R.page.drawText(`${sc}/10`, { x: bx + bw + 5, y: rY + 5, size: 7, font: boldFont, color: scoreColor(sc) });
      R.statusPill(sk.status, MARGIN + 340, rY + 14);
      R.y -= rH;
    });

    R.gap(6);
    R.text(`Overall Skills Score: ${skillsData.overall_score ?? '—'}/10`, { size: 8, bold: true, color: scoreColor(skillsData.overall_score ?? 0) });
    (skillsData.suggestions ?? []).forEach((s: string) => R.para(`→ ${s}`, { size: 8, color: C.cyan, maxWidth: CONTENT_W }));

    R.sectionHeader('04', 'Work Experience');
    const workData    = analyses.workExperience ?? {};
    const jobs: any[] = workData.work_experience ?? [];

    jobs.forEach((job: any) => {
      R.need(26);
      const jH = 26; const jY = R.y - jH + 8;
      R.page.drawRectangle({ x: MARGIN, y: jY, width: CONTENT_W, height: jH, color: C.stripe });
      R.page.drawRectangle({ x: MARGIN, y: jY, width: 3,          height: jH, color: C.cyan   });
      R.page.drawText(job.title ?? '—', { x: MARGIN + 10, y: jY + 13, size: 10, font: boldFont, color: C.white });
      R.page.drawText(`${job.company ?? '—'}  ·  ${job.period ?? '—'}`, { x: MARGIN + 10, y: jY + 3, size: 8, font, color: C.muted });
      R.page.drawText(`Score: ${job.score ?? '—'}/10`, { x: MARGIN + CONTENT_W - 60, y: jY + 8, size: 8, font: boldFont, color: scoreColor(job.score ?? 0) });
      R.y -= jH;

      (job.bullets ?? []).forEach((b: any) => {
        R.need(14);
        const bText   = typeof b === 'string' ? b : (b.text ?? '');
        const bStatus = typeof b === 'object'  ? b.status : undefined;
        R.page.drawText('●', { x: MARGIN + 8, y: R.y, size: 7, font, color: bStatus ? statusColor(bStatus) : C.warn });
        R.para(bText, { x: MARGIN + 20, size: 8, color: C.white, maxWidth: CONTENT_W - 22 });
      });

      R.gap(3);
      R.para(`Feedback: ${job.feedback ?? '—'}`, { size: 8, color: C.muted, maxWidth: CONTENT_W });
      R.gap(6);
    });

    R.text(`Overall Work Experience Score: ${workData.overall_score ?? '—'}/10`, { size: 8, bold: true, color: scoreColor(workData.overall_score ?? 0) });
    (workData.suggestions ?? []).forEach((s: string) => R.para(`→ ${s}`, { size: 8, color: C.cyan, maxWidth: CONTENT_W }));

    R.sectionHeader('05', 'ATS Evaluation');
    const ats = analyses.atsEvaluation ?? {};

    R.text(`Overall ATS Score: ${ats.overallATSScore ?? '—'}/10`, { size: 10, bold: true, color: scoreColor(ats.overallATSScore ?? 0) });
    R.gap(6);

    (ats.categories ?? []).forEach((cat: any) => {
      R.need(22);
      const cH = 22; const cY = R.y - cH + 8;
      R.page.drawRectangle({ x: MARGIN, y: cY, width: CONTENT_W, height: cH, color: C.stripe });
      R.page.drawText(cat.label ?? '', { x: MARGIN + 8, y: cY + 7, size: 9, font: boldFont, color: C.purple });
      const sc = cat.score ?? 0; const bw = 60; const bx = MARGIN + CONTENT_W - bw - 45;
      const fill = Math.round((sc / 10) * bw);
      R.page.drawRectangle({ x: bx, y: cY + 7, width: bw, height: 6, color: C.border });
      if (fill > 0) R.page.drawRectangle({ x: bx, y: cY + 7, width: fill, height: 6, color: scoreColor(sc) });
      R.page.drawText(`${sc}/10`, { x: bx + bw + 5, y: cY + 7, size: 8, font: boldFont, color: scoreColor(sc) });
      R.y -= cH;

      (cat.rules ?? []).forEach((rule: any, ri: number) => {
        R.need(18);
        const rH = 18; const rY = R.y - rH + 8;
        R.page.drawRectangle({ x: MARGIN, y: rY, width: CONTENT_W, height: rH, color: ri % 2 === 0 ? C.card : C.stripe });
        const sym = rule.status === 'good' ? '✓' : rule.status === 'ok' ? '!' : '✗';
        R.page.drawText(sym, { x: MARGIN + 8, y: rY + 5, size: 8, font: boldFont, color: statusColor(rule.status) });
        R.page.drawText(rule.rule ?? '', { x: MARGIN + 20, y: rY + 5, size: 7.5, font, color: C.white });
        let fb = rule.feedback ?? '';
        while (fb.length > 1 && font.widthOfTextAtSize(fb, 7) > CONTENT_W * 0.38) fb = fb.slice(0, -4) + '…';
        R.page.drawText(fb, { x: MARGIN + CONTENT_W * 0.52, y: rY + 5, size: 7, font, color: C.muted });
        R.y -= rH;
      });
      R.gap(4);
    });

    R.gap(4);
    R.text('ATS Suggestions:', { size: 8, bold: true, color: C.muted });
    (ats.suggestions ?? []).forEach((s: string) => R.para(`→ ${s}`, { size: 8, color: C.cyan, maxWidth: CONTENT_W }));

    R.sectionHeader('06', "Recruiter's Eye View");
    const rec     = analyses.recruiterEye ?? {};
    const verdict = rec.recruiterVerdict ?? {};

    R.kvRow('Overall Signal', verdict.overallSignal      ?? '—', C.warn, true);
    R.kvRow('Seniority',      verdict.estimatedSeniority ?? '—');
    R.gap(4);
    R.text('6-Second Summary:', { size: 8, bold: true, color: C.muted });
    R.para(verdict.sixSecondSummary ?? '—', { size: 8, color: C.white, maxWidth: CONTENT_W });

    R.gap(6);
    R.text('High Signal Observations:', { size: 8, bold: true, color: C.muted });
    (rec.highSignalSignals ?? []).forEach((sig: any) => {
      R.need(40);
      R.text(`${sig.type ?? ''} — Strength: ${sig.strength ?? '—'}/10`, { size: 8, bold: true, color: C.cyan });
      R.para(sig.observation ?? '',                    { size: 8, color: C.white, maxWidth: CONTENT_W });
      R.para(`Why it matters: ${sig.whyItMatters ?? ''}`, { size: 8, color: C.muted, maxWidth: CONTENT_W });
      R.gap(4);
    });

    R.gap(4);
    R.text('Red Flags:', { size: 8, bold: true, color: C.muted });
    (rec.redFlags ?? []).forEach((rf: any) => {
      R.text(`[${rf.severity ?? '?'}] ${rf.issue ?? ''}`, { size: 8, bold: true, color: rf.severity === 'High' ? C.bad : C.warn });
      R.para(`Fix: ${rf.fix ?? ''}`, { size: 8, color: C.muted, maxWidth: CONTENT_W });
      R.gap(3);
    });

    const vo = rec.visualOptimization ?? {};
    R.gap(4);
    R.text('Visual Optimization:', { size: 8, bold: true, color: C.muted });
    R.para(`Narrative gap: ${vo.narrativeGap ?? '—'}`, { size: 8, color: C.white, maxWidth: CONTENT_W });
    if ((vo.anchorKeywords ?? []).length)
      R.text(`Anchor keywords: ${(vo.anchorKeywords ?? []).join(', ')}`, { size: 8, color: C.purple });

    R.sectionHeader('07', 'Certifications & Projects');
    const certData      = analyses.certifications ?? {};
    const certs: any[]  = certData.certifications ?? [];
    const projItems: any[] = certData.projects    ?? [];

    if (certs.length) {
      R.text('Certifications:', { size: 9, bold: true, color: C.purple });
      R.gap(2);
      R.need(16);
      const chY = R.y - 16 + 8;
      R.page.drawRectangle({ x: MARGIN, y: chY, width: CONTENT_W, height: 16, color: C.stripe });
      R.page.drawText('NAME',   { x: MARGIN + 8,   y: chY + 4, size: 7, font: boldFont, color: C.muted });
      R.page.drawText('DATE',   { x: MARGIN + 230,  y: chY + 4, size: 7, font: boldFont, color: C.muted });
      R.page.drawText('IMPACT', { x: MARGIN + 290,  y: chY + 4, size: 7, font: boldFont, color: C.muted });
      R.y -= 16;

      certs.forEach((cert: any, i: number) => {
        R.need(20);
        const rH = 20; const rY = R.y - rH + 8;
        R.page.drawRectangle({ x: MARGIN, y: rY, width: CONTENT_W, height: rH, color: i % 2 === 0 ? C.card : C.stripe });
        R.page.drawText(cert.name ?? '—', { x: MARGIN + 8,   y: rY + 6, size: 8,   font: boldFont, color: C.white });
        R.page.drawText(cert.date || '—', { x: MARGIN + 230,  y: rY + 6, size: 8,   font,           color: C.muted });
        let imp = cert.impact ?? '—';
        while (imp.length > 1 && font.widthOfTextAtSize(imp, 7.5) > CONTENT_W * 0.38) imp = imp.slice(0, -4) + '…';
        R.page.drawText(imp, { x: MARGIN + 290, y: rY + 6, size: 7.5, font, color: C.muted });
        R.y -= rH;
      });
      R.gap(8);
    }

    if (projItems.length) {
      R.text('Projects:', { size: 9, bold: true, color: C.cyan });
      R.gap(4);
      projItems.forEach((proj: any) => {
        R.need(48);
        const pH = 48; const pY = R.y - pH + 8;
        R.page.drawRectangle({ x: MARGIN, y: pY, width: CONTENT_W, height: pH, color: C.card   });
        R.page.drawRectangle({ x: MARGIN, y: pY, width: 3,          height: pH, color: C.cyan   });
        R.page.drawRectangle({ x: MARGIN, y: pY, width: CONTENT_W, height: pH, borderWidth: 0.4, borderColor: C.border, color: C.card });
        R.page.drawText(proj.name ?? '—', { x: MARGIN + 12, y: pY + 33, size: 9, font: boldFont, color: C.white });
        let desc = proj.description ?? '—';
        while (desc.length > 1 && font.widthOfTextAtSize(desc, 7.5) > CONTENT_W - 24) desc = desc.slice(0, -4) + '…';
        R.page.drawText(desc, { x: MARGIN + 12, y: pY + 20, size: 7.5, font, color: C.muted });
        R.page.drawText(`Impact: ${proj.impact ?? '—'}`, { x: MARGIN + 12, y: pY + 7, size: 7.5, font, color: C.pink });
        R.y -= pH;
        R.gap(4);
      });
    }

    R.gap(4);
    R.text(`Overall Certifications Score: ${certData.overall_score ?? '—'}/10`, { size: 8, bold: true, color: scoreColor(certData.overall_score ?? 0) });
    (certData.suggestions ?? []).forEach((s: string) => R.para(`→ ${s}`, { size: 8, color: C.cyan, maxWidth: CONTENT_W }));

  }

  const userProjects: any[] = data.projects ?? [];
  if (userProjects.length > 0) {
    R.sectionHeader('08', 'Saved Projects');
    userProjects.forEach((proj: any, index: number) => {
      R.need(54);
      const pH = 54; const pY = R.y - pH + 8;
      R.page.drawRectangle({ x: MARGIN, y: pY, width: CONTENT_W, height: pH, color: C.card   });
      R.page.drawRectangle({ x: MARGIN, y: pY, width: 3,          height: pH, color: C.purple });
      R.page.drawText(`${index + 1}. ${proj.name ?? '—'}`, { x: MARGIN + 12, y: pY + 40, size: 9, font: boldFont, color: C.white });
      R.page.drawText(`Status: ${proj.status ?? '—'}   Progress: ${proj.progress ?? 0}%`, { x: MARGIN + 12, y: pY + 28, size: 8, font, color: C.muted });
      let desc = proj.description ?? '—';
      while (desc.length > 1 && font.widthOfTextAtSize(desc, 7.5) > CONTENT_W - 20) desc = desc.slice(0, -4) + '…';
      R.page.drawText(desc, { x: MARGIN + 12, y: pY + 17, size: 7.5, font, color: C.muted });
      R.page.drawText(`Tech: ${(proj.techTags ?? []).join(', ') || '—'}`, { x: MARGIN + 12, y: pY + 6, size: 7.5, font, color: C.cyan });
      R.y -= pH;
      R.gap(4);
    });
  }

  R.gap(16);
  R.rule(C.border);
  const footerText = `Generated by Resumate  ·  ${displayName}  ·  ${new Date().toLocaleDateString()}`;
  R.text(footerText, {
    size:  7,
    color: C.muted,
    x:     MARGIN + (CONTENT_W - font.widthOfTextAtSize(footerText, 7)) / 2,
  });

  const pdfBytes = await pdfDoc.save();
  const blob     = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const link     = document.createElement('a');
  link.href      = URL.createObjectURL(blob);
  link.download  = fileName;
  link.click();
}