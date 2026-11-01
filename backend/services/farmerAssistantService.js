const Crop = require('../models/Crop');
const { generateCropAdvice, evaluateCrop, getSoilSummary } = require('./cropAdviceEngine');
const cropCalendar = require('../routes/cropCalendar').calendarData;

const confirmedStatuses = new Set(['verified', 'manually_entered']);

const isTelugu = (language) => language === 'te';
const hasAny = (text, terms) => terms.some((term) => text.includes(term));

const detectIntent = (query) => {
  const text = query.toLocaleLowerCase();
  if (hasAny(text, ['planting season', 'sowing season', 'sowing time', 'planting time', 'when to plant', 'best time to plant', 'season for', 'which season', 'seasons', 'season', 'విత్తే సమయం', 'నాటే సమయం', 'ఎప్పుడు వేయాలి', 'ఎప్పుడు నాటాలి', 'ఏ సీజన్', 'ఏ కాలంలో', 'పంటకాలం', 'ఖరీఫ్', 'రబీ', 'యాసంగి'])) return 'season';
  if (hasAny(text, ['ph', 'పిహెచ్', 'ఆమ్ల', 'క్షార'])) return 'ph';
  if (hasAny(text, ['npk', 'nitrogen', 'నైట్రోజన్', 'నత్రజని', 'phosphorus', 'ఫాస్ఫరస్', 'భాస్వరం', 'potassium', 'పొటాషియం'])) return 'npk';
  if (hasAny(text, ['fertilizer', 'fertiliser', 'manure', 'ఎరువు', 'ఎరువులు'])) return 'fertilizer';
  if (hasAny(text, ['irrigation', 'watering', 'water', 'నీటిపారుదల', 'సాగునీరు', 'నీరు'])) return 'irrigation';
  if (hasAny(text, ['suitable', 'suitability', 'compatible', 'can i grow', 'grow in my soil', 'fit for my soil', 'అనుకూల', 'సరిపోతుందా'])) return 'crop';
  if (hasAny(text, ['rice', 'paddy', 'maize', 'corn', 'groundnut', 'peanut', 'millet', 'pulses', 'వరి', 'మొక్కజొన్న', 'వేరుశనగ', 'చిరుధాన్య', 'పప్పు'])) return 'crop';
  if (hasAny(text, ['crop', 'crops', 'grow', 'plant', 'పంట', 'సాగు'])) return 'crop';
  if (hasAny(text, ['soil', 'మట్టి', 'నేల'])) return 'soil';
  if (hasAny(text, ['hello', 'hi', 'నమస్కారం', 'నమస్తే'])) return 'greeting';
  return 'unknown';
};

const reportValue = (report, key) => {
  const parameter = report?.soilParameters?.[key];
  if (confirmedStatuses.has(parameter?.status) && Number.isFinite(parameter?.value)) {
    return { value: parameter.value, unit: parameter.unit || '' };
  }
  return null;
};

const reportSummary = (report, telugu) => {
  if (!report) return telugu
    ? 'మీ ఖాతాలో ఇంకా మట్టి పరీక్ష నివేదిక లేదు. నివేదికను జోడిస్తే, అందులో నిర్ధారించిన వివరాల ఆధారంగా సహాయం చేస్తాను.'
    : 'There is no soil report on your account yet. Add a report and I can use its confirmed readings.';

  const labels = telugu
    ? [['ph', 'pH'], ['nitrogen', 'నైట్రోజన్'], ['phosphorus', 'ఫాస్ఫరస్'], ['potassium', 'పొటాషియం']]
    : [['ph', 'pH'], ['nitrogen', 'nitrogen'], ['phosphorus', 'phosphorus'], ['potassium', 'potassium']];
  const values = labels.flatMap(([key, label]) => {
    const reading = reportValue(report, key);
    return reading ? [`${label}: ${reading.value}${reading.unit ? ` ${reading.unit}` : ''}`] : [];
  });
  const soilType = report.soilType && report.soilType !== 'Unknown' ? report.soilType : null;
  if (soilType) values.push(`${telugu ? 'మట్టి రకం' : 'soil type'}: ${soilType}`);
  if (!values.length) return telugu
    ? 'మీ తాజా మట్టి నివేదికలో ఇంకా నిర్ధారించిన కొలతలు లేవు. దయచేసి నివేదికను సమీక్షించి నిర్ధారించండి.'
    : 'Your latest soil report has no confirmed readings yet. Please review and confirm its values.';
  const date = report.reportDate ? new Date(report.reportDate).toLocaleDateString(telugu ? 'te-IN' : 'en-IN') : '';
  return telugu
    ? `మీ తాజా మట్టి నివేదిక${date ? ` (${date})` : ''}లో నిర్ధారించిన వివరాలు: ${values.join('; ')}. ఇవి మాత్రమే అందుబాటులో ఉన్నాయి; మొత్తం మట్టి ఆరోగ్యాన్ని నిర్ణయించడానికి మరిన్ని పరీక్షా వివరాలు అవసరం.`
    : `Confirmed readings in your latest soil report${date ? ` (${date})` : ''}: ${values.join('; ')}. These are the only confirmed values available; more test results are needed for a complete soil-health assessment.`;
};

const answerSeasonQuestion = (query, telugu) => {
  const text = query.toLocaleLowerCase();
  const aliases = {
    Rice: ['rice', 'paddy', 'వరి'],
    Millets: ['millet', 'millets', 'సజ్జ', 'చిరుధాన్య'],
    Groundnut: ['groundnut', 'peanut', 'వేరుశనగ'],
    Pulses: ['pulse', 'pulses', 'పప్పు'],
    Maize: ['maize', 'corn', 'మొక్కజొన్న'],
  };
  const cropName = Object.keys(cropCalendar).find((name) => aliases[name]?.some((alias) => text.includes(alias)));
  const stateNames = [...new Set(Object.values(cropCalendar).flatMap((states) => Object.keys(states)))];
  const stateName = stateNames.find((name) => text.includes(name.toLocaleLowerCase()));
  const unavailableStates = ['telangana', 'karnataka', 'tamil nadu', 'kerala', 'maharashtra', 'odisha', 'తెలంగాణ', 'కర్ణాటక', 'తమిళనాడు', 'కేరళ', 'మహారాష్ట్ర', 'ఒడిశా'];
  const requestedUnavailableState = unavailableStates.some((name) => text.includes(name));
  const calendarRows = cropName ? [[cropName, cropCalendar[cropName]]] : Object.entries(cropCalendar);
  const entries = requestedUnavailableState ? [] : calendarRows.flatMap(([name, states]) => Object.entries(states)
    .filter(([state]) => !stateName || state.toLocaleLowerCase() === stateName.toLocaleLowerCase())
    .map(([state, entry]) => ({ name, state, timing: entry.data?.sowing_time?.display_text }))
    .filter((entry) => entry.timing));

  if (!entries.length) return {
    response: telugu
      ? `ఈ పంట/ప్రాంతానికి క్యాలెండర్‌లో విత్తే సమయం అందుబాటులో లేదు. పంట పేరు మరియు రాష్ట్రం చెప్పండి. ప్రస్తుతం క్యాలెండర్‌లో ఉన్న రాష్ట్రాలు: ${stateNames.join(', ')}.`
      : `The project calendar has no sowing-time entry for that crop and location. Please provide the crop and state. Calendar states currently configured: ${stateNames.join(', ')}.`,
    confidence: 0.45,
  };

  const teluguCropNames = { Rice: 'వరి', Millets: 'చిరుధాన్యాలు', Groundnut: 'వేరుశనగ', Pulses: 'పప్పుధాన్యాలు', Maize: 'మొక్కజొన్న' };
  const teluguMonths = { June: 'జూన్', July: 'జూలై', August: 'ఆగస్టు', September: 'సెప్టెంబర్', October: 'అక్టోబర్', November: 'నవంబర్', December: 'డిసెంబర్', May: 'మే' };
  const lines = entries.map(({ name, state, timing }) => {
    const localizedTiming = telugu ? timing.replace(/June|July|August|September|October|November|December|May/g, (month) => teluguMonths[month]) : timing;
    return `${telugu ? teluguCropNames[name] || name : name} (${telugu && state === 'Andhra Pradesh' ? 'ఆంధ్రప్రదేశ్' : state}): ${localizedTiming}`;
  });
  return {
    response: telugu
      ? `ప్రాజెక్ట్ పంట క్యాలెండర్‌లో ఉన్న విత్తే సమయం:\n${lines.join('\n') }\nఇది క్యాలెండర్‌లోని సమాచారం మాత్రమే; మీ ప్రాంతానికి సరిపోతుందో స్థానిక వ్యవసాయ అధికారితో నిర్ధారించండి.`
      : `Sowing windows listed in the project crop calendar:\n${lines.join('\n')}\nThis is the calendar data currently configured in the app; confirm local timing with your agricultural extension office.`,
    confidence: 0.8,
  };
};

const describeCropReasons = (crop, telugu) => {
  const labels = telugu
    ? { ph: 'pH', soilType: 'మట్టి రకం', nitrogen: 'నైట్రోజన్', phosphorus: 'ఫాస్ఫరస్', potassium: 'పొటాషియం', electricalConductivity: 'విద్యుత్ వాహకత', organicCarbon: 'సేంద్రీయ కార్బన్' }
    : { ph: 'pH', soilType: 'soil type', nitrogen: 'nitrogen', phosphorus: 'phosphorus', potassium: 'potassium', electricalConductivity: 'electrical conductivity', organicCarbon: 'organic carbon' };
  const describe = (key) => {
    const match = key.match(/^(ph|soilType|nitrogen|phosphorus|potassium|electricalConductivity|organicCarbon)_(match|outside_range|missing|needs_review)$/);
    if (!match) return null;
    const [, field, result] = match;
    if (telugu) {
      const outcome = { match: 'ప్రాజెక్ట్‌లోని పోలిక నియమానికి సరిపోయింది', outside_range: 'ప్రాజెక్ట్ పోలిక పరిధి వెలుపల ఉంది', missing: 'సమాచారం లేదు; పరిశీలించలేదు', needs_review: 'సమీక్ష అవసరం; పరిశీలించలేదు' }[result];
      return `${labels[field]} ${outcome}`;
    }
    const outcome = { match: 'matches the configured project comparison', outside_range: 'is outside the configured comparison range', missing: 'is missing and was not evaluated', needs_review: 'needs review and was not evaluated' }[result];
    return `${labels[field]} ${outcome}`;
  };
  const matched = (crop.matchedFactorKeys || []).map(describe).filter(Boolean);
  const limiting = (crop.limitingFactorKeys || []).map(describe).filter(Boolean);
  return { matched, limiting };
};

const displayCropName = (crop, telugu) => telugu
  ? ({ rice: 'వరి', wheat: 'గోధుమ', maize: 'మొక్కజొన్న', cotton: 'పత్తి', groundnut: 'వేరుశనగ', soybean: 'సోయాబీన్', chickpea: 'శనగ', millets: 'చిరుధాన్యాలు', pulses: 'పప్పుధాన్యాలు' }[String(crop.cropId || '').toLowerCase()] || crop.cropName)
  : crop.cropName;

const answerQuestion = async ({ query, language, report }) => {
  const telugu = isTelugu(language);
  const intent = detectIntent(query);

  if (intent === 'season') return answerSeasonQuestion(query, telugu);

  if (intent === 'greeting') return {
    response: telugu
      ? 'నమస్కారం! మట్టి నివేదిక, pH, NPK, పంటలు, నీటిపారుదల లేదా ఎరువుల గురించి అడగండి.'
      : 'Hello! Ask me about your soil report, pH, NPK, crop suitability, irrigation, or fertilizer guidance.',
    confidence: 0.95,
  };

  if (intent === 'soil') return { response: reportSummary(report, telugu), confidence: report ? 0.82 : 0.72 };

  if (intent === 'ph') {
    const reading = reportValue(report, 'ph');
    if (!reading) return {
      response: telugu
        ? 'మీ తాజా నివేదికలో నిర్ధారించిన pH విలువ లేదు. పంటకు సరైన pH పంటపై ఆధారపడుతుంది; దయచేసి నివేదికలో pHను నిర్ధారించండి లేదా ఏ పంట గురించి అడుగుతున్నారో చెప్పండి.'
        : 'Your latest report has no confirmed pH value. Suitable pH depends on the crop; please confirm the report value or tell me which crop you are asking about.',
      confidence: 0.78,
    };
    return {
      response: telugu
        ? `మీ తాజా నివేదికలో pH ${reading.value}గా ఉంది. pH పోషకాలు మొక్కలకు అందుబాటులో ఉండటాన్ని ప్రభావితం చేస్తుంది; ఈ విలువ ఆ పంటకు సరిపోతుందో చెప్పడానికి పంట పేరు అవసరం.`
        : `Your latest report records pH ${reading.value}. Soil pH affects nutrient availability; I need the crop name to assess this value for that crop.`,
      confidence: 0.9,
    };
  }

  if (intent === 'npk') {
    const readings = ['nitrogen', 'phosphorus', 'potassium'].map((key) => [key, reportValue(report, key)]);
    const available = readings.filter(([, value]) => value);
    if (!available.length) return {
      response: telugu
        ? 'మీ తాజా నివేదికలో నిర్ధారించిన NPK విలువలు లేవు. మట్టి నివేదికను జోడించండి లేదా ఈ పోషకాల విలువలు, యూనిట్లను పంచుకోండి. పంట వివరాలు లేకుండా వాటిని తక్కువ లేదా ఎక్కువగా వర్గీకరించను.'
        : 'Your latest report has no confirmed NPK readings. Add a soil report or share the values and units. I will not label them low or high without crop-specific comparison data.',
      confidence: 0.78,
    };
    const names = telugu
      ? { nitrogen: 'నైట్రోజన్', phosphorus: 'ఫాస్ఫరస్', potassium: 'పొటాషియం' }
      : { nitrogen: 'Nitrogen', phosphorus: 'Phosphorus', potassium: 'Potassium' };
    const values = available.map(([key, item]) => `${names[key]} ${item.value}${item.unit ? ` ${item.unit}` : ''}`).join(', ');
    return {
      response: telugu
        ? `మీ తాజా నివేదికలో నిర్ధారించిన NPK వివరాలు: ${values}. పంట అవసరాలు, యూనిట్లు, స్థానిక సిఫార్సులతో పోల్చకుండా ఎరువు మోతాదును సూచించలేను.`
        : `Confirmed NPK readings in your latest report: ${values}. I cannot recommend fertilizer amounts without comparing these with the crop, units, and local recommendations.`,
      confidence: 0.9,
    };
  }

  if (intent === 'crop') {
    if (!report) return { response: telugu
      ? 'పంట ఎంపికను మట్టి వివరాలు, ప్రాంతం, సీజన్ ప్రభావితం చేస్తాయి. మీ తాజా మట్టి నివేదిక లేదు; దయచేసి నివేదికను జోడించి మీ జిల్లా, సీజన్‌ను తెలియజేయండి.'
      : 'Crop choice depends on soil, location, and season. There is no soil report on your account yet; add one and share your district and season.', confidence: 0.72 };
    const crops = await Crop.find({}).lean();
    const advice = generateCropAdvice({ report, crops });
    const text = query.toLocaleLowerCase();
    const cropAliases = { rice: ['paddy', 'వరి'], maize: ['corn', 'మొక్కజొన్న'], groundnut: ['peanut', 'వేరుశనగ'] };
    const requestedCrop = crops.find((crop) => {
      const name = crop.cropName.toLocaleLowerCase();
      const aliases = cropAliases[String(crop.cropId).toLocaleLowerCase()] || [];
      return text.includes(name) || aliases.some((alias) => text.includes(alias));
    });
    if (requestedCrop) {
      const evaluation = evaluateCrop(requestedCrop, report, getSoilSummary(report));
      const reasons = describeCropReasons(evaluation, telugu);
      const details = [...reasons.matched, ...reasons.limiting];
      const hasConfiguredMismatch = evaluation.limitingFactorKeys.some((key) =>
        /^(ph|soilType|nitrogen|phosphorus|potassium|organicCarbon|electricalConductivity)_(outside_range|mismatch)$/.test(key)
      );
      // Soil matches cannot establish suitability by themselves; this assistant
      // route has no location-specific rules and does not receive water context.
      const status = hasConfiguredMismatch ? 'unsuitable' : 'insufficient';
      const statusText = telugu
        ? (status === 'unsuitable' ? 'అననుకూలం (ప్రాజెక్ట్ మట్టి పోలిక ప్రకారం)' : 'తగిన సమాచారం లేదు')
        : (status === 'unsuitable' ? 'Unsuitable under configured soil comparisons' : 'Insufficient data');
      const confirmedReadings = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organicCarbon']
        .map((key) => [key, reportValue(report, key)])
        .filter(([, value]) => value)
        .map(([key, value]) => `${key === 'ph' ? 'pH' : key}: ${value.value}${value.unit ? ` ${value.unit}` : ''}`);
      const soilType = report?.soilType && report.soilType !== 'Unknown' ? report.soilType : null;
      if (soilType) confirmedReadings.push(`${telugu ? 'మట్టి రకం' : 'soil type'}: ${soilType}`);
      const unavailableReadings = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organicCarbon']
        .filter((key) => !reportValue(report, key))
        .map((key) => key === 'organicCarbon' ? (telugu ? 'సేంద్రీయ కార్బన్' : 'organic carbon') : key === 'ph' ? 'pH' : key);
      if (!soilType) unavailableReadings.push(telugu ? 'మట్టి రకం' : 'soil type');
      const reasonsText = details.length ? details.join('; ') : (telugu
        ? 'నిర్ధారించిన విలువలతో పోల్చగల ప్రాజెక్ట్ నియమం అందుబాటులో లేదు'
        : 'no configured comparison rule could be applied to confirmed readings');
      const readingText = confirmedReadings.length ? confirmedReadings.join(', ') : (telugu ? 'నిర్ధారించిన మట్టి రీడింగ్‌లు లేవు' : 'no confirmed soil readings');
      return { response: telugu
        ? `అనుకూలత: ${statusText}. ${displayCropName(requestedCrop, telugu)} — నిర్ధారించిన రీడింగ్‌లు: ${readingText}. కారణం: ${reasonsText}. ఇంకా అవసరం: ${unavailableReadings.length ? unavailableReadings.join(', ') + ', ' : ''}నీటి లభ్యత, మీ ప్రాంతం; ప్రాంతానుసార పంట నియమాలు ప్రస్తుతం లేవు. pH/NPK పోలిక మాత్రమే పంట అనుకూలతను నిర్ధారించదు.`
        : `Suitability: ${statusText}. ${requestedCrop.cropName} — confirmed readings: ${readingText}. Reasons: ${reasonsText}. Missing or unassessed: ${unavailableReadings.length ? unavailableReadings.join(', ') + ', ' : ''}water availability and location; crop-specific location rules are not configured. Soil pH/NPK comparison alone cannot establish suitability.`, confidence: hasConfiguredMismatch ? 0.68 : 0.55 };
    }
    if (!advice.recommendations.length) return { response: telugu
      ? 'మీ తాజా నివేదికలోని నిర్ధారించిన వివరాలు మరియు ప్రస్తుత పంట నియమాలతో సరిపోయే పంటను గుర్తించలేకపోయాను. దయచేసి నివేదికను నిర్ధారించండి, అలాగే జిల్లా మరియు సీజన్‌ను పంచుకోండి.'
      : 'I could not identify a crop match from the confirmed report values and the crop rules currently configured. Please confirm your report and share your district and season.', confidence: 0.58 };
    const lines = advice.recommendations.slice(0, 3).map((crop) => {
      const reasons = describeCropReasons(crop, telugu);
      const noFactors = telugu ? 'నిర్ధారించిన మట్టి వివరాలతో సరిపోలిక లేదు' : 'no configured soil factors matched';
      return `${displayCropName(crop, telugu)}: ${[...reasons.matched, ...reasons.limiting].join('; ') || noFactors}`;
    });
    return { response: telugu
      ? `ప్రాజెక్ట్ పంట నియమాల ప్రకారం మట్టి పోలికలు:\n${lines.join('\n')}\nఇవి పరిమిత పోలికలు మాత్రమే. వాతావరణం, ప్రాంతం, సీజన్‌కు సంబంధించిన నియమాలు అందుబాటులో లేవు; స్థానిక వ్యవసాయ అధికారితో ధృవీకరించండి.`
      : `Soil comparisons from the project's configured crop rules:\n${lines.join('\n')}\nThese are limited comparisons. Weather, geographic, and season rules are unavailable; confirm locally before choosing a crop.`, confidence: 0.76 };
  }

  if (intent === 'irrigation') return { response: telugu
    ? 'మీ మట్టి నివేదిక ఒక్కటితో నీటి పరిమాణం లేదా షెడ్యూల్‌ను నిర్ణయించలేను. పంట, పెరుగుదల దశ, నేల తేమ, ఇటీవలి వర్షపాతం వివరాలు అవసరం. ఈ వివరాలు మరియు మీ జిల్లా పంచుకుంటారా?'
    : 'A soil report alone is not enough to set an irrigation amount or schedule. I would need the crop, growth stage, current soil moisture, recent rainfall, and location. Please share those details.', confidence: 0.76 };

  if (intent === 'fertilizer') return { response: telugu
    ? 'మోతాదు లేదా ఎరువు రకాన్ని ఊహించి చెప్పను. సరైన సిఫార్సుకు నిర్ధారించిన మట్టి పరీక్ష, పంట, పెరుగుదల దశ, స్థానిక వ్యవసాయ మార్గదర్శకం అవసరం. ఏ పంట, ఏ దశలో ఉందో మరియు నివేదికను పంచుకోండి.'
    : 'I will not guess a fertilizer type or amount. A sound recommendation needs a confirmed soil test, crop, growth stage, and local agricultural guidance. Please share the crop, its growth stage, and your report.', confidence: 0.8 };

  return { response: telugu
    ? 'ఈ ప్రశ్నకు సరైన సమాధానం ఇవ్వడానికి మరింత సమాచారం అవసరం. మట్టి ఆరోగ్యం, pH, NPK, పంటల అనుకూలత, నీటిపారుదల లేదా ఎరువుల గురించి అడగండి.'
    : 'I need more information to answer that reliably. Please ask about soil health, pH, NPK, crop suitability, irrigation, or fertilizer guidance.', confidence: 0.3 };
};

module.exports = { answerQuestion, detectIntent, reportValue };
