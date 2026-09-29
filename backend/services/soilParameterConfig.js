const PARAMETERS = {
  ph: {
    label: 'pH',
    aliases: ['Soil pH', 'pH value', 'Reaction', 'pH'],
    range: [0, 14],
    typicalRange: [3.5, 10],
    units: [''],
    unitRequired: false
  },
  electricalConductivity: {
    label: 'Electrical Conductivity',
    aliases: ['Electrical Conductivity', 'Conductivity', 'E.C.', 'EC'],
    range: [0, 100],
    typicalRange: [0, 20],
    units: ['ds/m', 'ms/cm', 'us/cm', 'mmhos/cm'],
    unitRequired: true
  },
  organicCarbon: {
    label: 'Organic Carbon',
    aliases: ['Organic Carbon', 'Organic C', 'O.C.', 'OC'],
    range: [0, 100],
    typicalRange: [0, 10],
    units: ['%', 'g/kg'],
    unitRequired: true
  },
  nitrogen: {
    label: 'Nitrogen',
    aliases: ['Available Nitrogen', 'Available N', 'Nitrogen', 'N'],
    range: [0, 10000],
    typicalRange: [0, 2000],
    units: ['kg/ha', 'mg/kg', 'ppm'],
    unitRequired: true
  },
  phosphorus: {
    label: 'Phosphorus',
    aliases: ['Available Phosphorus', 'Available P', 'Phosphorus', 'P2O5', 'P'],
    range: [0, 10000],
    typicalRange: [0, 2000],
    units: ['kg/ha', 'mg/kg', 'ppm'],
    unitRequired: true
  },
  potassium: {
    label: 'Potassium',
    aliases: ['Available Potassium', 'Available K', 'Potassium', 'K2O', 'K'],
    range: [0, 10000],
    typicalRange: [0, 3000],
    units: ['kg/ha', 'mg/kg', 'ppm'],
    unitRequired: true
  },
  sulphur: {
    label: 'Sulphur',
    aliases: ['Sulphur', 'Sulfur', 'Available S', 'S'],
    range: [0, 10000],
    typicalRange: [0, 2000],
    units: ['kg/ha', 'mg/kg', 'ppm'],
    unitRequired: true
  },
  zinc: {
    label: 'Zinc',
    aliases: ['Zinc', 'Zn'],
    range: [0, 10000],
    typicalRange: [0, 1000],
    units: ['mg/kg', 'ppm'],
    unitRequired: true
  },
  iron: {
    label: 'Iron',
    aliases: ['Iron', 'Fe'],
    range: [0, 10000],
    typicalRange: [0, 2000],
    units: ['mg/kg', 'ppm'],
    unitRequired: true
  },
  manganese: {
    label: 'Manganese',
    aliases: ['Manganese', 'Mn'],
    range: [0, 10000],
    typicalRange: [0, 2000],
    units: ['mg/kg', 'ppm'],
    unitRequired: true
  },
  copper: {
    label: 'Copper',
    aliases: ['Copper', 'Cu'],
    range: [0, 10000],
    typicalRange: [0, 1000],
    units: ['mg/kg', 'ppm'],
    unitRequired: true
  },
  boron: {
    label: 'Boron',
    aliases: ['Boron', 'B'],
    range: [0, 10000],
    typicalRange: [0, 1000],
    units: ['mg/kg', 'ppm'],
    unitRequired: true
  }
};

const CONFIDENCE_THRESHOLDS = {
  high: 0.9,
  moderate: 0.7
};

module.exports = { PARAMETERS, CONFIDENCE_THRESHOLDS };
