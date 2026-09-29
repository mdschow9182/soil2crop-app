const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/farmers/:id - Get farmer by ID (auto-create if not found)
router.get("/:id", async (req, res) => {

  try {

    const farmerId = req.params.id;

    console.log("Fetching farmer:", farmerId);

    let farmer = await User.findById(farmerId);

    // 🔥 AUTO CREATE FARMER IF NOT FOUND
    if (!farmer) {

      console.log("Farmer not found — creating default farmer");

      farmer = new User({

        _id: farmerId,

        name: "Default Farmer",

        mobile: "9999999999",

        district: "Guntur",

        language: "en"

      });

      await farmer.save();

      console.log("Default farmer created:", farmerId);

    }

    res.json({

      success: true,

      data: farmer

    });

  }

  catch (error) {

    console.error("Farmer route error:", error);

    res.status(500).json({

      success: false,

      message: "Server error"

    });

  }

});

module.exports = router;
