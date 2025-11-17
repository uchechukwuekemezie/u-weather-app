const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "af757cfe3235b4cef0b949e4b6e9afb0";

const createWeatherCard = (cityName, weatherItem, index) => {
  const temp = (weatherItem.main.temp - 273.15).toFixed(1);
  const icon = weatherItem.weather[0].icon;
  const desc = weatherItem.weather[0].description;
  const date = weatherItem.dt_txt.split(" ")[0];

  if (index === 0) {
    return `
      <div class="details">
        <h2 class="city-name">${cityName} (${date})</h2>
        <h4 class="temp">${temp}°C</h4>
        <h4 class="wind">Wind: ${weatherItem.wind.speed} m/s</h4>
        <h4 class="humidity">Humidity: ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
        <h4 class="condition">${desc}</h4>
      </div>`;
  } else {
    return `
      <div class="card">
        <h3>${date}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
        <h6>Temp: ${temp}°C</h6>
        <h6>Wind: ${weatherItem.wind.speed} m/s</h6>
        <h6>Humidity: ${weatherItem.main.humidity}%</h6>
      </div>`;
  }
};

const getWeatherDetails = (cityName, lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const uniqueDays = [];
      const fiveDays = data.list.filter((forecast) => {
        const date = new Date(forecast.dt_txt).getDate();
        if (!uniqueDays.includes(date) && uniqueDays.length < 6) {
          uniqueDays.push(date);
          return true;
        }
        return false;
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDays.forEach((item, i) => {
        const card = createWeatherCard(cityName, item, i);
        if (i === 0) {
          currentWeatherDiv.innerHTML = card;
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", card);
        }
      });
    })
    .catch(() => alert("Error fetching weather data!"));
};

const getCityCoords = () => {
  const city = cityInput.value.trim();
  if (!city) return;

  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
  fetch(geoUrl)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No city found: ${city}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert("Error finding city!"));
};

const getUserLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const reverseUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(reverseUrl)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        });
    },
    () => alert("Location access denied!")
  );
};

searchButton.addEventListener("click", getCityCoords);
locationButton.addEventListener("click", getUserLocation);
cityInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && getCityCoords()
);
