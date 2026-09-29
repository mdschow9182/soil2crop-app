const path = require('path');
const { createWorker } = require('tesseract.js');

let workerPromise;

const getWorker = () => {
  if (!workerPromise) {
    const languageData = require.resolve('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz');
    workerPromise = createWorker('eng', 1, {
      langPath: path.dirname(languageData),
      gzip: true,
      cacheMethod: 'none'
    });
  }
  return workerPromise;
};

const recognize = async (image) => {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  return { text: data.text || '', confidence: Number(data.confidence) || 0 };
};

const terminate = async () => {
  if (!workerPromise) return;
  const worker = await workerPromise;
  workerPromise = null;
  await worker.terminate();
};

module.exports = { recognize, terminate };
