const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ MongoDB Connection
const MONGO_URI =
  "mongodb+srv://dishaskanavi_db_user:Jrbezkk69J4s9LbI@cluster0.gvvm6pb.mongodb.net/?appName=Cluster";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("🚀 MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// ✅ Test Route
app.get("/test", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/", urlRoutes);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

// ✅ Server Start
const PORT = 5001;

// IMPORTANT CHANGE FOR HOTSPOT/WIFI ACCESS
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://192.168.137.45:${PORT}`);
});