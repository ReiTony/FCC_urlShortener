require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();
const bodyParser = require("body-parser");
const util = require("util");
const dnsPromisify = util.promisify(dns.lookup);
const connectDB = require("./connect.js");

const URLModel = require("./models/urlSchema.js");

// Basic Configuration
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// API endpoints
app.get("/api/shorturl/:short_url", async (req, res) => {
  const shortURL = req.params.short_url;

  try {
    // Find the original URL based on the short URL
    const urlEntry = await URLModel.findOne({ short_url: shortURL });
    if (!urlEntry) {
      return res.json({ error: "short url not found" });
    }

    // Redirect to original URL
    return res.redirect(urlEntry.original_url);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST endpoint for creating short URLs
app.post("/api/shorturl", async (req, res) => {
  const originalURL = req.body.url;

  // Validate the URL format
  const isValidURL = /^(http|https):\/\/[^ "]+$/.test(originalURL);
  if (!isValidURL) {
    return res.json({ error: "invalid url" });
  }

  try {
    // Check if the domain exists using dns.lookup
    const urlParts = new URL(originalURL);
    const hostname = urlParts.hostname;

    dns.lookup(hostname, async (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      // Check if URL exists in the database
      const existingURL = await URLModel.findOne({ original_url: originalURL });
      if (existingURL) {
        return res.json({
          original_url: existingURL.original_url,
          short_url: existingURL.short_url,
        });
      }

      // Create a new short URL
      const newURL = new URLModel({ original_url: originalURL });
      await newURL.save();

      return res.json({
        original_url: newURL.original_url,
        short_url: newURL.short_url,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening to ${port}....`));
  } catch (error) {
    console.log(error);
  }
};

start();
