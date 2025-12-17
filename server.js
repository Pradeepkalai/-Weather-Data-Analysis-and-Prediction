const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/weather_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected!"));

// Weather Data Schema
const WeatherSchema = new mongoose.Schema({
    city: String,
    temp: Number,
    description: String,
    date: { type: Date, default: Date.now }
});
const Weather = mongoose.model('Weather', WeatherSchema);

// API to save weather
app.post('/api/save-weather', async (req, res) => {
    const newWeather = new Weather(req.body);
    await newWeather.save();
    res.json({ message: "Data Saved to MongoDB!" });
});

app.listen(5000, () => console.log("Server running on port 5000"));