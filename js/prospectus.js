/**
 * The National School & College (TNS) - Digital Prospectus Modal & Download Generator
 * Parkview Campus
 */

document.addEventListener('DOMContentLoaded', () => {
  initProspectusTriggers();
});

function initProspectusTriggers() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.trigger-prospectus');
    if (btn) {
      e.preventDefault();
      openProspectusModal();
    }
  });
}

function openProspectusModal() {
  const existingModal = document.getElementById('prospectusModal');
  if (existingModal) {
    existingModal.classList.remove('hidden');
    return;
  }

  const modalHtml = `
    <div id="prospectusModal" class="hidden">
      <div class="modal-backdrop animate-fadeIn" role="presentation">
        <div class="modal-card max-w-2xl" role="dialog" aria-modal="true" aria-label="Official prospectus 2026-2027">

          <div class="modal-header">
            <div class="flex items-center gap-3">
              <img src="assets/logo.jpg" alt="The National School & College crest" class="brand-logo" style="width: 48px; height: 48px;">
              <div>
                <h3 class="modal-title">The National School &amp; College <span class="text-sm font-bold" style="color: var(--gold-deep);">(Parkview Campus)</span></h3>
                <p class="text-xs" style="color: var(--muted);">Vision Education System — رَبِّ زِدْنِي عِلْمًا</p>
              </div>
            </div>
            <button type="button" class="modal-close" onclick="closeProspectusModal()" aria-label="Close prospectus dialog">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="band-navy">
              <span class="kicker">Official Brochure 2026-2027</span>
              <h4>Parkview Campus A-Level Prospectus</h4>
              <p>Vision Education System — Cambridge International Pathway</p>
            </div>

            <h5 class="font-bold text-lg mt-6 mb-2" style="color: var(--navy);">
              <i class="fa-solid fa-star text-gold mr-2" aria-hidden="true"></i>Parkview Campus Overview
            </h5>
            <p class="text-sm leading-relaxed" style="color: var(--muted);">
              The National School &amp; College (Parkview Campus) provides a Cambridge O &amp; A Level education that
              pairs rigorous academics with modern labs and individualised career counselling.
            </p>

            <div class="grid grid-cols-2 gap-3 mt-4">
              <div class="key-fact">
                <span class="k">Monthly Tuition Fee</span>
                <span class="v">PKR 38,000/-</span>
              </div>
              <div class="key-fact">
                <span class="k">Scholarship Track</span>
                <span class="v">Up to 100% (Points 48 Matrix)</span>
              </div>
            </div>

            <h5 class="font-bold text-base mt-6 mb-3" style="color: var(--navy);">Prospectus Highlights:</h5>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <li class="toc-item"><i class="fa-solid fa-angle-right" aria-hidden="true"></i> 1. Fee Structure &amp; Concessions</li>
              <li class="toc-item"><i class="fa-solid fa-angle-right" aria-hidden="true"></i> 2. O-Level Grade Point Matrix (48 Pts)</li>
              <li class="toc-item"><i class="fa-solid fa-angle-right" aria-hidden="true"></i> 3. Sciences: Physics, Chem, Math, Bio</li>
              <li class="toc-item"><i class="fa-solid fa-angle-right" aria-hidden="true"></i> 4. Social Sciences: Econ, Biz, Law, Psych, Soc, Urdu</li>
              <li class="toc-item"><i class="fa-solid fa-angle-right" aria-hidden="true"></i> 5. Salient Campus Features &amp; Labs</li>
              <li class="toc-item"><i class="fa-solid fa-angle-right" aria-hidden="true"></i> 6. Admissions Criteria &amp; Assessment</li>
            </ul>
          </div>

          <div class="modal-footer">
            <span class="text-xs" style="color: var(--muted);">File Format: PDF (Digital Edition 2026)</span>
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" onclick="closeProspectusModal()" class="btn btn-outline btn-sm">Close</button>
              <button type="button" onclick="downloadProspectusPDF()" class="btn btn-navy btn-sm">
                <i class="fa-solid fa-file-arrow-down text-gold" aria-hidden="true"></i>
                Download Prospectus (PDF)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.id = 'prospectusModalWrapper';
  wrapper.innerHTML = modalHtml;
  document.body.appendChild(wrapper);
}

window.closeProspectusModal = function() {
  const inlineModal = document.getElementById('prospectusModal');
  if (inlineModal) {
    inlineModal.classList.add('hidden');
  }
  const dynamicWrapper = document.getElementById('prospectusModalWrapper');
  if (dynamicWrapper) {
    dynamicWrapper.remove();
  }
};

/* ==========================================================================
   Prospectus PDF generation (vanilla JS, A4, no external libraries)
   ========================================================================== */
const PDF_PAGE_W = 595.28;
const PDF_PAGE_H = 841.89;
const PDF_MARGIN = 64;
const PDF_CONTENT_W = PDF_PAGE_W - PDF_MARGIN * 2;

function pdfEsc(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .split('')
    .map(c => c.charCodeAt(0) > 255 ? '?' : c)
    .join('');
}

function pdfWrap(text, size) {
  const maxChars = Math.floor(PDF_CONTENT_W / (size * 0.5));
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    const next = (current + ' ' + word).trim();
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function buildPdfContent() {
  const blocks = [];
  const add = (size, bold, text, gap) => blocks.push({ size, bold, text, gap: gap || 0 });

  add(15, true, 'THE NATIONAL SCHOOL & COLLEGE', 0);
  add(10, false, '(Parkview Campus)', 2);
  add(9, false, 'Vision Education System - Official Prospectus 2026-2027', 4);
  add(10, true, 'Cambridge Assessment International Education (CAIE) - Registered School PK-892', 10);
  add(10, false, 'A focused O & A Level programme taught by experienced, qualified faculty.', 8);

  add(12, true, 'Welcome from the Principal', 8);
  add(10, false, 'The National School & College goes beyond examination scores. We guide students to value the pursuit of knowledge, and we build analytical minds, strong ethics and resilient leadership.', 8);

  add(12, true, 'Fee Structure (Parkview Campus)', 8);
  add(10, false, 'Admission Fee: PKR 10,000 | Security (Refundable): PKR 10,000 | Monthly Tuition: PKR 38,000.', 3);
  add(10, false, 'Special concession: 50% off monthly tuition for teachers children.', 8);

  add(12, true, 'O-Level Merit Scholarships', 8);
  add(10, false, '48 points: 100% waiver. 45 points: 95% waiver. 40 points: 80% waiver. 30 points: 60% waiver. 25 points: 50% waiver. 20 points: 40% waiver.', 3);
  add(10, false, 'Point matrix per subject: A* = 6, A = 5, B = 4, C = 3, D = 2, E = 1. Total across 8 subjects = 48 points.', 8);

  add(12, true, 'O-Level (IGCSE) Subjects', 8);
  add(10, false, 'Compulsory Core: Mathematics, English Language, Urdu, Islamiyat, Pakistan Studies.', 3);
  add(10, false, 'Sciences: Physics (5054), Chemistry (5070), Biology (5090), Computer Science (0478).', 3);
  add(10, false, 'Commerce: Business Studies (0450), Economics (0455), Commerce (7100), Environmental Management (0680).', 8);

  add(12, true, 'A-Level (AS & A2) Subjects', 8);
  add(10, false, 'Sciences: Physics (9702), Chemistry (9701), Biology (9700), Mathematics (9709).', 3);
  add(10, false, 'Commerce: Economics (9708), Business (9609), Accounting (9706).', 3);
  add(10, false, 'Humanities: Law (9084), Psychology (9990), Sociology (9699), Urdu (9686).', 8);

  add(12, true, 'Salient Campus Features', 8);
  add(10, false, 'Well-equipped laboratories, wide subject range, affordable fees with up to 100% merit scholarships, secure campus with 24/7 CCTV, air-conditioned classrooms, and career counselling services.', 8);

  add(12, true, 'Admissions Roadmap', 8);
  add(10, false, '1. Submit the online inquiry form for entry test dates.', 3);
  add(10, false, '2. Sit the assessment in Math & English, followed by a counselling interview.', 3);
  add(10, false, '3. Merit scholarships are confirmed with the offer of admission.', 8);

  add(12, true, 'Contact Us', 8);
  add(10, false, 'Main Campus: The National School & College, Gulberg Academic Campus, Lahore, Pakistan.', 3);
  add(10, false, 'Phone: +92 (42) 3578-9000 | Email: info@tnsc.edu.pk', 8);

  return blocks;
}

function pdfPaginate(blocks) {
  const pages = [];
  let y = PDF_PAGE_H - PDF_MARGIN - 20;
  let current = [];

  function push(line, extra) {
    const lineHeight = line.size * 1.45;
    if (y - lineHeight < 70) {
      pages.push(current);
      current = [];
      y = PDF_PAGE_H - PDF_MARGIN - 20;
    }
    current.push({ text: line.text, size: line.size, bold: line.bold, y });
    y -= lineHeight + (extra || 0);
  }

  blocks.forEach(block => {
    const gap = block.gap || 0;
    const lines = pdfWrap(block.text, block.size);
    lines.forEach((line, i) => {
      push({ text: line, size: block.size, bold: block.bold }, i === lines.length - 1 ? gap : 0);
    });
  });

  if (current.length) pages.push(current);
  return pages;
}

window.downloadProspectusPDF = function() {
  const pages = pdfPaginate(buildPdfContent());
  const total = pages.length;
  const objCount = 4 + total * 2;

  let body = '%PDF-1.4\n';
  const offsets = [0];
  let objNum = 1;

  function emitObject(content) {
    offsets.push(body.length);
    body += objNum + ' 0 obj\n' + content + '\nendobj\n';
    objNum++;
  }

  emitObject('<< /Type /Catalog /Pages 2 0 R >>');
  emitObject('<< /Type /Pages /Kids [' + pages.map((p, i) => 5 + i * 2).join(' ') + '] /Count ' + total + ' >>');
  emitObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  emitObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

  pages.forEach((lines, index) => {
    let stream = '';
    lines.forEach(line => {
      stream += 'BT /F' + (line.bold ? 1 : 2) + ' ' + line.size + ' Tf ' + PDF_MARGIN + ' ' +
        Math.round(line.y) + ' Td (' + pdfEsc(line.text) + ') Tj ET\n';
    });
    stream += 'BT /F2 8 Tf ' + PDF_MARGIN + ' 40 Td (' +
      pdfEsc('The National School & College - Prospectus 2026-2027 - Page ' + (index + 1) + ' of ' + total) +
      ') Tj ET\n';

    const pageObj = 5 + index * 2;
    const contentObj = pageObj + 1;
    emitObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PDF_PAGE_W + ' ' + PDF_PAGE_H + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + contentObj + ' 0 R >>');
    emitObject('<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream');
  });

  const xrefOffset = body.length;
  let xref = 'xref\n0 ' + (objCount + 1) + '\n0000000000 65535 f \n';
  for (let i = 1; i <= objCount; i++) {
    xref += String(offsets[i] !== undefined ? offsets[i] : body.length).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = 'trailer\n<< /Size ' + (objCount + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';

  const blob = new Blob([body + xref + trailer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'TNS_Parkview_Campus_Official_Prospectus_2026-2027.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('Download started: TNS_Parkview_Campus_Official_Prospectus_2026-2027.pdf', 'info');
  }
};
