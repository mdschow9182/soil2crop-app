const express = require("express");
const router = express.Router();

const marketPriceDB = {

  Rice: {
    currentPrice: 2280,
    trend: "increasing",
    trendPercent: "8.57",
    recommendation: "Prices trending upward",
    location: "Guntur",
    prices: [
      { day: "Day 1", price: 2100 },
      { day: "Day 5", price: 2150 },
      { day: "Day 10", price: 2200 },
      { day: "Day 15", price: 2180 },
      { day: "Day 20", price: 2250 },
      { day: "Day 25", price: 2300 },
      { day: "Day 30", price: 2280 }
    ]
  },

  Wheat: {
    currentPrice: 2300,
    trend: "stable",
    trendPercent: "0.00",
    recommendation: "Prices stable",
    location: "Guntur",
    prices: [
      { day: "Day 1", price: 2300 },
      { day: "Day 10", price: 2300 },
      { day: "Day 20", price: 2300 },
      { day: "Day 30", price: 2300 }
    ]
  },

  Maize: {
    currentPrice: 1950,
    trend: "increasing",
    trendPercent: "8.33",
    recommendation: "Good demand",
    location: "Guntur",
    prices: [
      { day: "Day 1", price: 1800 },
      { day: "Day 10", price: 1850 },
      { day: "Day 20", price: 1900 },
      { day: "Day 30", price: 1950 }
    ]
  }

};

router.get("/", (req, res) => {

  try {

    let crop =
      req.query.crop || "Rice";

    console.log(
      "Requested crop:",
      crop
    );

    // Normalize crop name
    const matchedCrop =
      Object.keys(marketPriceDB).find(
        key =>
          key.toLowerCase() ===
          crop.toLowerCase()
      );

    console.log(
      "Matched crop:",
      matchedCrop
    );

    if (!matchedCrop) {

      return res.json({
        success: true,
        data: marketPriceDB["Rice"]
      });

    }

    const priceData =
      marketPriceDB[matchedCrop];

    res.json({
      success: true,
      data: priceData
    });

  } catch (error) {

    console.error(
      "Market route error:",
      error
    );

    res.status(500).json({
      success: false
    });

  }

});

module.exports = router;