const Url = require("../models/Url");
const crypto = require("crypto");
const mongoose = require("mongoose");

const nanoid = (size = 6) => {
  return crypto.randomBytes(size).toString("hex").slice(0, size);
};

// 🔗 Create short URL
exports.createShortUrl = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        details:
          "Database not connected. Please check your MongoDB connection string or IP whitelist.",
      });
    }

    let { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        details: "Original URL is required.",
      });
    }

    // ✅ Add http:// if missing
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = "http://" + originalUrl;
    }

    const shortId = nanoid(6);

    const newUrl = new Url({
      originalUrl,
      shortId,
      user: req.user ? req.user.id : null,
    });

    await newUrl.save();

    // ✅ Dynamic URL (works on Wi-Fi + Hotspot)
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    res.json({
      shortUrl: `${baseUrl}/${shortId}`,
    });

  } catch (err) {
    console.error("Create URL Error:", err);

    res.status(500).json({
      details: err.message,
    });
  }
};

// 🔁 Redirect + increase clicks
exports.redirectUrl = async (req, res) => {
  try {
    const { shortId } = req.params;

    if (shortId === "stats" || shortId === "urls") {
      return res.status(404).send("Not found");
    }

    console.log("Redirect hit:", shortId);

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).send(`
        <html>
          <body style="font-family:sans-serif;text-align:center;padding:40px;">
            <h2>❌ Short link not found</h2>
            <p>This link may have been deleted or never existed.</p>
          </body>
        </html>
      `);
    }

    // ✅ Increase clicks
    await Url.updateOne(
      { shortId },
      { $inc: { clicks: 1 } }
    );

    const dest = url.originalUrl;

    console.log("Redirecting to:", dest);

    // ✅ Mobile-friendly redirect
    return res.send(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=${dest}">
    <title>Redirecting...</title>

    <script>
      window.location.replace("${dest}");
    </script>

    <style>
      body {
        font-family: sans-serif;
        text-align: center;
        padding: 60px;
        background: #0f172a;
        color: white;
      }

      a {
        color: #818cf8;
        font-size: 18px;
      }
    </style>
  </head>

  <body>
    <p>Redirecting you to your destination...</p>

    <p>
      If you are not redirected,
      <a href="${dest}">click here</a>.
    </p>
  </body>
</html>
    `);

  } catch (err) {
    console.error("Redirect Error:", err);

    res.status(500).json({
      details: err.message,
    });
  }
};

// 📊 Get stats
exports.getStats = async (req, res) => {
  try {
    const { shortId } = req.params;

    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).send("Not found");
    }

    res.json(url);

  } catch (err) {
    console.error("Stats Error:", err);

    res.status(500).json({
      details: err.message,
    });
  }
};

// 📋 Get all user URLs
exports.getAllUrls = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        details: "Not authorized",
      });
    }

    const urls = await Url.find({
      user: req.user.id,
    }).sort({ _id: -1 });

    res.json(urls);

  } catch (err) {
    console.error("Get All URLs Error:", err);

    res.status(500).json({
      details: err.message,
    });
  }
};

// 🗑️ Delete URL
exports.deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        details: "URL not found",
      });
    }

    // ✅ Check ownership
    if (url.user.toString() !== req.user.id) {
      return res.status(401).json({
        details: "Not authorized to delete this URL",
      });
    }

    await url.deleteOne();

    res.json({
      details: "URL removed",
    });

  } catch (err) {
    console.error("Delete URL Error:", err);

    res.status(500).json({
      details: err.message,
    });
  }
};