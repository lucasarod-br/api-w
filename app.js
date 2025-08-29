const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { createClient } = require("redis");

const app = express();

const BASE_URL =
  process.env.BASE_API_URL + "[location]?key=" + process.env.API_KEY;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 1 minute",
});

const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.on("error", (err) => console.error("❌ Redis error:", err));

(async () => {
    try {
        await redis.connect();
        console.log("✅ Redis connected!");
    } catch (err) {
        console.error("Error connecting to Redis:", err);
    }
})();

async function getWeatherData(location) {
  const url = BASE_URL.replace("[location]", location);
  const response = await axios.get(url);

  const currentConditions = response.data.currentConditions;
  return {
    location: response.data.resolvedAddress,
    temperature: currentConditions.temp,
    description: currentConditions.conditions,
  };
}

async function getFromCache(location) {
  try {
    const cacheResult = await redis.get(location);
    return cacheResult ? JSON.parse(cacheResult) : null;
  } catch (err) {
    console.error("Erro ao ler cache:", err);
    return null;
  }
}

async function cacheWeatherData(location, data) {
  try {
    await redis.setEx(location, 60, JSON.stringify(data));
  } catch (err) {
    console.error("Erro ao salvar no cache:", err);
  }
}

app.use(limiter);
app.get("/weather", async (req, res) => {
  const location = req.query.location || "New York";

  try {
    const cached = await getFromCache(location);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const data = await getWeatherData(location);

    await cacheWeatherData(location, data);

    return res.json({ ...data, cached: false });
  } catch (err) {
    console.error("Erro na rota /weather:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000);