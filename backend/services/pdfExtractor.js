const { createCanvas } = require('@napi-rs/canvas');

const loadPdfJs = async () => import('pdfjs-dist/legacy/build/pdf.mjs');

const textFromPdf = async (buffer) => {
  const pdfjs = await loadPdfJs();
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false
  }).promise;

  try {
    const pageTexts = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map((item) => `${item.str || ''}${item.hasEOL ? '\n' : ' '}`).join('').trim());
    }
    return { text: pageTexts.filter(Boolean).join('\n'), pageCount: document.numPages };
  } finally {
    await document.destroy();
  }
};

const renderPdfPages = async (buffer, { maxPages = 8, scale = 1.8 } = {}) => {
  const pdfjs = await loadPdfJs();
  const document = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false
  }).promise;

  try {
    const rendered = [];
    const pageCount = Math.min(document.numPages, maxPages);
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      const context = canvas.getContext('2d');
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      rendered.push(canvas.toBuffer('image/png'));
    }
    return { pages: rendered, pageCount: document.numPages, truncated: document.numPages > maxPages };
  } finally {
    await document.destroy();
  }
};

module.exports = { textFromPdf, renderPdfPages };
