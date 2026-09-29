const pdfExtractor = require('./pdfExtractor');
const ocrService = require('./ocrService');
const { extractSoilParameters } = require('./soilParameterExtractor');

const MIN_SELECTABLE_TEXT_LENGTH = 24;

const extractDocument = async ({ buffer, mimeType }) => {
  const notes = [];
  let text = '';
  let extractionMethod = 'pdf_text';
  let ocrConfidence = null;

  if (mimeType === 'application/pdf') {
    const pdfText = await pdfExtractor.textFromPdf(buffer);
    text = pdfText.text;
    if (text.replace(/\s/g, '').length < MIN_SELECTABLE_TEXT_LENGTH) {
      const rendered = await pdfExtractor.renderPdfPages(buffer);
      const pageResults = await Promise.all(rendered.pages.map((page) => ocrService.recognize(page)));
      text = pageResults.map((page) => page.text).filter(Boolean).join('\n');
      ocrConfidence = pageResults.length
        ? pageResults.reduce((sum, page) => sum + page.confidence, 0) / pageResults.length
        : 0;
      extractionMethod = 'ocr';
      if (rendered.truncated) notes.push('Only the first 8 pages were processed');
    }
  } else if (mimeType.startsWith('image/')) {
    const result = await ocrService.recognize(buffer);
    text = result.text;
    ocrConfidence = result.confidence;
    extractionMethod = 'ocr';
  } else {
    throw new Error('Unsupported report format');
  }

  const extraction = extractSoilParameters(text, { extractionMethod, ocrConfidence });
  extraction.notes = [...notes, ...extraction.notes];
  if (!text.trim()) {
    extraction.status = 'failed';
    extraction.notes.unshift('No readable text was found. Enter soil values manually.');
  }
  if (extraction.status === 'failed' && text.trim()) {
    extraction.notes.unshift('No soil parameters were detected. Enter values manually.');
  }
  return extraction;
};

module.exports = { extractDocument, MIN_SELECTABLE_TEXT_LENGTH };
