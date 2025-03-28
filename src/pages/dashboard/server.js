const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const puppeteer = require("puppeteer");
require("dotenv").config();
const { db } = require("./firebase"); // Firestore connection using Firebase Client SDK
const { collection, getDocs, query, where } = require("firebase/firestore"); // Firestore methods
const { calculateSimilarity } = require("../../utils/tfidfService.js"); // TF-IDF recommendation logic

const app = express();
app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Payment Route
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Math.random()}`,
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Payment Verification Route
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid payment" });
  }
});

// ✅ Event Recommendation API (User Preference Based)
app.post("/recommend-events", async (req, res) => {
  try {
    const { userEmail, eventPreferences } = req.body;

    if (!userEmail || !eventPreferences) {
      return res.status(400).json({ error: "User email and preferences required" });
    }

    // Fetch all events from Firestore
    const eventsCollection = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsCollection);
    const allEvents = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      description: doc.data().eventName.toLowerCase(),
    }));

    // Fetch past registered events (Fix for nested `registeredUsers` array)
    const pastEvents = eventsSnapshot.docs
      .filter(doc => {
        const registeredUsers = doc.data().registeredUsers || [];
        return registeredUsers.some(user => user.email === userEmail);
      })
      .map(doc => ({
        name: doc.data().eventName,
        category: doc.data().eventCategory,
      }));

    // Extract user's past event categories
    const pastCategories = [...new Set(pastEvents.map(e => e.category))];

    // Filter only events matching past categories
    const filteredEvents = allEvents.filter(event =>
      pastCategories.includes(event.eventCategory)
    );

    // Calculate recommended events using TF-IDF similarity
    let recommendedEvents = calculateSimilarity(eventPreferences, pastEvents, filteredEvents);

    // Limit to 5 recommended events
    recommendedEvents = recommendedEvents.slice(0, 5);

    res.json(recommendedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch recommended events" });
  }
});

// ✅ Web Crawling Route
app.post("/crawl", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: "Invalid URLs" });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    let contents = [];

    for (const url of urls) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const content = await page.evaluate(() => document.documentElement.innerHTML);
      contents.push(content);
    }

    await browser.close();
    res.json({ contents });
  } catch (error) {
    console.error("Crawling failed:", error);
    res.status(500).json({ error: "Failed to crawl websites" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
