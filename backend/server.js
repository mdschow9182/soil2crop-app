const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const useMemoryDB = process.env.USE_MEMORY_DB === "true";
const isProduction = process.env.NODE_ENV === "production";
if (isProduction && useMemoryDB) throw new Error('USE_MEMORY_DB=true is not allowed in production. Configure persistent MONGODB_URI.');
if (isProduction && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in production. Configure MongoDB Atlas before starting the API.');
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('JWT_SECRET is required in production and must contain at least 32 characters.');
const PORT = Number(process.env.PORT || (process.env.NODE_ENV === "test" ? 5000 : 5001));

const initializeAndStart = async () => {
  try {
    // Establish the database connection before loading routes or accepting requests.
    if (useMemoryDB) {
      console.log("Running with in-memory MongoDB");
      const { startMemoryDB } = require("./config/database");
      await startMemoryDB();
    } else {
      const { connectDB } = require("./config/database");
      await connectDB();
    }

    // Seed after either database mode has connected and before the API listens.
    // Only an empty collection is initialized; persisted crop records are kept.
    const { ensureCropCatalog } = require("./scripts/seedCrops");
    const cropCatalog = await ensureCropCatalog();
    if (cropCatalog.seeded) {
      console.log(`Empty crop catalog initialized with ${cropCatalog.count} existing project crop records.`);
    } else {
      console.log(`Existing crop catalog found (${cropCatalog.count} records); no seed changes made.`);
    }

    // Common middleware must precede route handlers.
    const configuredOrigins = (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
    const capacitorOrigins = ["capacitor://localhost", "http://localhost", "https://localhost"];
    const developmentOrigins = isProduction ? [] : [
      "http://localhost:8080",
      "http://localhost:8081",
      "http://localhost:8082",
      "http://localhost:3000",
      "http://localhost:5173"
    ];
    const allowedOrigins = new Set([...capacitorOrigins, ...developmentOrigins, ...configuredOrigins]);

    app.use(cors({
      origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV !== "production") {
      app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
        next();
      });
    }

    app.get("/health", (req, res) => {
      res.json({
        success: true,
        message: "Soil2Crop API Running",
        timestamp: new Date(),
        database: useMemoryDB ? "memory" : "mongodb"
      });
    });

    app.get("/", (req, res) => {
      res.json({
        message: "🌱 Soil2Crop API is running",
        version: "1.0",
        endpoints: ["/health", "/api/auth/login", "/api/farmers/:id", "/api/iot"]
      });
    });

    const apiRoutes = require("./routes/api");
    const iotRoutes = require("./routes/iotRoutes");
    const cropCalendarRoutes = require("./routes/cropCalendar");
    const marketPriceRoutes = require("./routes/marketPrices");

    // Mount specific routers before the broad /api router so its compatibility
    // placeholders cannot shadow the implemented market-price endpoint.
    app.use("/api/market-prices", marketPriceRoutes);
    app.use("/api/iot", iotRoutes);
    app.use("/api/crop-calendar", cropCalendarRoutes);
    app.use("/api", apiRoutes);

    // 404 and error handlers must be registered after all route handlers.
    app.use((req, res) => {
      console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        success: false,
        message: "Endpoint not found",
        path: req.originalUrl
      });
    });

    app.use((err, req, res, next) => {
      console.error("Server Error:", err);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message
      });
    });

    // There is one listener, created only after database and route initialization.
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n=================================");
      console.log("Soil2Crop API Server Running");
      console.log(`Selected Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Database Mode: ${useMemoryDB ? "In-Memory" : "MongoDB"}`);
      console.log("=================================\n");
    });

    server.on("error", (err) => {
      console.error(`Soil2Crop API failed to listen on port ${PORT}:`, err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to initialize Soil2Crop API:", err);
    process.exit(1);
  }
};

initializeAndStart();

module.exports = app;
