import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import cors from "cors";


const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(bodyParser.json());

const PORT = 8000;
const HOSTNAME = "http://localhost";

const urlStore = new Map();

function generateShortCode(length = 6) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/shorturls", async (req, res) => {
  console.log("recieved");
  try {
    let { url, validity, shortcode } = req.body;

    if (!url || !isValidUrl(url)) {
      console.log("invalid or missing url");
      return;
    }

    validity = validity && Number.isInteger(validity) ? validity : 30;

    if (!shortcode) {
      do {
        shortcode = generateShortCode();
      } while (urlStore.has(shortcode));
    } else {
      if (urlStore.has(shortcode)) {
        console.log("Shortcode already exists");
        return;
      }
    }

    const createdAt = new Date();
    const expiry = new Date(createdAt.getTime() + validity * 60000);

    urlStore.set(shortcode, {
      url,
      createdAt,
      expiry,
      clicks: 0,
    });

    res.json({
      shortlink: `${HOSTNAME}:${PORT}/${shortcode}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    console.log("Unexpected error in POST /shorturls");
    return;
  }
});

app.get("/shorturls/:shortcode", async (req, res) => {
  console.log("recieved");

  try {
    const { shortcode } = req.params;
    console.log(shortcode)
    const entry = urlStore.get(shortcode);

    if (!entry) {
      console.log("Shortcode not found");
      return;
    }

    res.json({
      shortcode,
      originalUrl: entry.url,
      createdAt: entry.createdAt.toISOString(),
      expiry: entry.expiry.toISOString(),
      totalClicks: entry.clicks,
    });
  } catch (err) {
    console.log("Unexpected error in GET /shorturls/:shortcode");
    return;
  }
});

app.get("/:shortcode", async (req, res) => {
  console.log("recieved");

  try {
    const { shortcode } = req.params;
    const entry = urlStore.get(shortcode);

    if (!entry) {
      console.log("Shortcode not found");
      return;
    }

    const now = new Date();
    if (now > entry.expiry) {
      console.log("Shortlink expired");
      return;
    }

    entry.clicks += 1;
    res.redirect(entry.url);
  } catch (err) {
    console.log("Unexpected error in redirect handler");
    return;
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
