const apiKey = "aaac33c86c58cca3f54b7b6d5e5f1da4";

// ENTER KEY SEARCH
document.getElementById("cityInput").addEventListener("keypress", e => {
    if (e.key === "Enter") getWeather();
});

// LOAD HISTORY
window.onload = loadHistory;

// 🌍 MAIN WEATHER FUNCTION (ALL INDIA)
function getWeather(cityName) {
    const city = (cityName || document.getElementById("cityInput").value).trim();
    if (!city) return;

    document.getElementById("loading").innerText = "Searching location...";

    // STEP 1: GEOCODING (CITY → LAT/LON)
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${apiKey}`)
        .then(res => res.json())
        .then(loc => {
            if (loc.length === 0) {
                document.getElementById("loading").innerText = "City not found in India ❌";
                return;
            }

            const { lat, lon, name, state } = loc[0];
            document.getElementById("loading").innerText = `Weather: ${name}, ${state}`;

            // STEP 2: WEATHER DATA
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
                .then(res => res.json())
                .then(data => {
                    document.getElementById("loading").innerText = "";

                    document.getElementById("temp").innerText = `${data.main.temp} °C`;
                    document.getElementById("desc").innerText = data.weather[0].description;
                    document.getElementById("feels").innerText = `${data.main.feels_like} °C`;
                    document.getElementById("humidity").innerText = `${data.main.humidity}%`;
                    document.getElementById("wind").innerText = `${data.wind.speed} km/h`;

                    const icon = document.getElementById("icon");
                    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                    icon.style.display = "block";

                    changeBackground(data.weather[0].main);
                    getForecastByCoords(lat, lon);
                    saveHistory(name);
                });
        });
}

// 📅 FORECAST
function getForecastByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            const forecast = document.getElementById("forecast");
            forecast.innerHTML = "";

            for (let i = 0; i < data.list.length; i += 8) {
                const d = data.list[i];
                const div = document.createElement("div");
                div.className = "day";
                div.innerHTML = `
                    <p>${d.dt_txt.split(" ")[0]}</p>
                    <p>${d.main.temp}°C</p>
                `;
                forecast.appendChild(div);
            }
        });
}

// 📍 AUTO LOCATION
function getLocation() {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        getForecastByCoords(latitude, longitude);

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("temp").innerText = `${data.main.temp} °C`;
                document.getElementById("desc").innerText = data.weather[0].description;
            });
    });
}

// 🎨 BACKGROUND CHANGE
function changeBackground(weather) {
    weather = weather.toLowerCase();
    if (weather.includes("cloud"))
        document.body.style.background = "linear-gradient(135deg,#bdc3c7,#2c3e50)";
    else if (weather.includes("rain"))
        document.body.style.background = "linear-gradient(135deg,#4b79a1,#283e51)";
    else
        document.body.style.background = "linear-gradient(135deg,#74ebd5,#9face6)";
}

// 💾 HISTORY
function saveHistory(city) {
    let history = JSON.parse(localStorage.getItem("cities")) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("cities", JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const list = document.getElementById("history");
    list.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("cities")) || [];

    history.forEach(city => {
        const li = document.createElement("li");
        li.innerText = city;
        li.onclick = () => getWeather(city);
        list.appendChild(li);
    });
}
