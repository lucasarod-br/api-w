const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();

const BASE_URL = process.env.BASE_API_URL + '[location]?key=' + process.env.API_KEY;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 1 minute",
});

app.use(limiter);


app.get('/weather', (req, res) => {
    const location = req.query.location || 'New York';

    const url = BASE_URL.replace('[location]', location);

    axios.get(url)
        .then(response => {
            const currentConditions = response.data.currentConditions;
            const result = {
                location: response.data.resolvedAddress,
                temperature: currentConditions.temp,
                description: currentConditions.conditions,
            }
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
