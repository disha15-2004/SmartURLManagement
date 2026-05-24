const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

const {
  createShortUrl,
  redirectUrl,
  getStats,
  getAllUrls,
  deleteUrl
} = require("../controllers/urlController");

// 🔗 Create short URL (optional auth)
router.post("/shorten", optionalAuth, createShortUrl);

// 📋 Get user URLs (required auth)
router.get("/urls", auth, getAllUrls);

// 🗑️ Delete URL
router.delete("/:id", auth, deleteUrl);

// 📊 Get stats
router.get("/stats/:shortId", (req, res, next) => {
  next();
}, getStats);

// 🔁 Redirect (ONLY if NOT stats or urls)
router.get("/:shortId", (req, res, next) => {
  if (req.params.shortId === "stats" || req.params.shortId === "urls") {
    return res.status(404).send("Not found");
  }
  next();
}, redirectUrl);

module.exports = router;