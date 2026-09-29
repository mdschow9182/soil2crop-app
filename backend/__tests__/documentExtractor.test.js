jest.mock('../services/pdfExtractor', () => ({
  textFromPdf: jest.fn(), renderPdfPages: jest.fn()
}));
jest.mock('../services/ocrService', () => ({ recognize: jest.fn() }));

const pdf = require('../services/pdfExtractor');
const ocr = require('../services/ocrService');
const { extractDocument } = require('../services/documentExtractor');

describe('document extraction flow', () => {
  beforeEach(() => jest.clearAllMocks());

  test('uses selectable PDF text directly', async () => {
    pdf.textFromPdf.mockResolvedValue({ text: 'Soil pH: 6.4\nAvailable N: 250 kg/ha', pageCount: 1 });
    const result = await extractDocument({ buffer: Buffer.from('pdf'), mimeType: 'application/pdf' });
    expect(result.parameters.ph.value).toBe(6.4);
    expect(result.parameters.nitrogen.value).toBe(250);
    expect(ocr.recognize).not.toHaveBeenCalled();
  });

  test('renders scanned PDFs and sends page images to OCR', async () => {
    pdf.textFromPdf.mockResolvedValue({ text: '', pageCount: 1 });
    pdf.renderPdfPages.mockResolvedValue({ pages: [Buffer.from('page')], pageCount: 1, truncated: false });
    ocr.recognize.mockResolvedValue({ text: 'pH: 6.8', confidence: 82 });
    const result = await extractDocument({ buffer: Buffer.from('pdf'), mimeType: 'application/pdf' });
    expect(result.extractionMethod).toBe('ocr');
    expect(result.parameters.ph.value).toBe(6.8);
  });

  test.each(['image/jpeg', 'image/png'])('sends %s to OCR', async (mimeType) => {
    ocr.recognize.mockResolvedValue({ text: 'Zn: 0.8 ppm', confidence: 91 });
    const result = await extractDocument({ buffer: Buffer.from('image'), mimeType });
    expect(result.parameters.zinc.value).toBe(0.8);
    expect(ocr.recognize).toHaveBeenCalledWith(expect.any(Buffer));
  });

  test('returns missing values with a manual-entry note for unreadable input', async () => {
    ocr.recognize.mockResolvedValue({ text: '', confidence: 0 });
    const result = await extractDocument({ buffer: Buffer.from('image'), mimeType: 'image/png' });
    expect(result.status).toBe('failed');
    expect(result.parameters.ph.value).toBeNull();
    expect(result.notes.join(' ')).toMatch(/manually/);
  });
});
