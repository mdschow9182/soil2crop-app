// Software weights only; these are not agronomic requirements or yield probabilities.
const recommendationConfig = {
  weights: { ph: 0.4, nitrogen: 0.1, phosphorus: 0.1, potassium: 0.1, soilType: 0.15, electricalConductivity: 0.075, organicCarbon: 0.075 },
  minimumEvaluatedFactors: 1,
  limit: 5
};

module.exports = recommendationConfig;
