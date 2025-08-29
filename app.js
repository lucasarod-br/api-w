const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

const app = express();

const BASE_URL = process.env.BASE_API_URL + '[location]?key=' + process.env.API_KEY;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 1 minute",
});

const redis = createClient({
  url: process.env.REDIS_URL
});

app.use(limiter);


app.get('/weather', async (req, res) => {
    const location = req.query.location || 'New York';
    
    await redis.connect().catch(console.error);

    const cacheResult = await redis.get(location);
    if (cacheResult) {
        return res.json(JSON.parse(cacheResult));
    }

    const url = BASE_URL.replace('[location]', location);
    await axios.get(url)
        .then(response => {
            const currentConditions = response.data.currentConditions;
            const result = {
                location: response.data.resolvedAddress,
                temperature: currentConditions.temp,
                description: currentConditions.conditions,
            }
            redis.setEx(location, 60, JSON.stringify(result));
            res.json(result);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch weather data' });
        });
});

app.listen(3000, () => {
    console.log('Weather API is running on http://localhost:3000');
});
