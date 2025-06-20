// Clean Weather App - Google Style
class WeatherApp {
  constructor() {
    this.apiKey = "ca72bdc62664c1fcdbe44d3e85e345b0";
    this.isMetric = true;
    this.currentCity = "";
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateDateTime();
    this.loadDefaultWeather();

    // Update time every minute
    setInterval(() => this.updateDateTime(), 60000);
  }

  bindEvents() {
    // Search
    const searchBtn = document.querySelector(".search-box");
    const cityInput = document.getElementById("city-input");
    const clearBtn = document.getElementById("clear-btn");

    cityInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    cityInput.addEventListener("input", (e) => {
      clearBtn.classList.toggle("show", e.target.value.length > 0);
    });

    clearBtn.addEventListener("click", () => {
      cityInput.value = "";
      clearBtn.classList.remove("show");
      cityInput.focus();
    });

    // Unit toggle
    document.getElementById("unit-toggle").addEventListener("click", () => {
      this.toggleUnits();
    });

    // Location
    document.getElementById("location-btn").addEventListener("click", () => {
      this.getCurrentLocation();
    });
  }

  async handleSearch() {
    const city = document.getElementById("city-input").value.trim();
    if (!city) return;

    this.showLoading();
    try {
      await this.getWeatherData(city);
      this.currentCity = city;
    } catch (error) {
      this.showError("City not found. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  async getWeatherData(city) {
    const units = this.isMetric ? "metric" : "imperial";

    try {
      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=${units}`,
      );

      if (!currentResponse.ok) {
        throw new Error("Weather data not found");
      }

      const currentData = await currentResponse.json();

      // Forecast data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=${units}`,
      );

      const forecastData = await forecastResponse.json();

      this.updateDisplay(currentData, forecastData);
      this.updateBackground(currentData.weather[0].main.toLowerCase());
    } catch (error) {
      throw error;
    }
  }

  updateDisplay(current, forecast) {
    // Current weather
    document.getElementById("city-name").textContent = current.name;
    document.getElementById("country").textContent = current.sys.country;

    const temp = Math.round(current.main.temp);
    document.getElementById("temperature").textContent = temp;
    document.getElementById("feels-like").textContent =
      `${Math.round(current.main.feels_like)}°`;
    document.getElementById("description").textContent =
      current.weather[0].description;

    // Weather icon
    this.updateWeatherIcon(current.weather[0].main);

    // Metrics
    document.getElementById("humidity").textContent =
      `${current.main.humidity}%`;
    document.getElementById("wind-speed").textContent =
      `${Math.round(current.wind.speed)} ${this.isMetric ? "km/h" : "mph"}`;
    document.getElementById("pressure").textContent =
      `${current.main.pressure} hPa`;
    document.getElementById("visibility").textContent =
      `${(current.visibility / 1000).toFixed(1)} km`;

    // Sun times
    const sunrise = new Date(current.sys.sunrise * 1000).toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" },
    );
    const sunset = new Date(current.sys.sunset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    document.getElementById("sunrise").textContent = sunrise;
    document.getElementById("sunset").textContent = sunset;

    // Forecasts
    this.updateHourlyForecast(forecast.list.slice(0, 8));
    this.updateWeeklyForecast(this.processWeeklyForecast(forecast.list));

    // Mock air quality data
    this.updateAirQuality();
  }

  updateWeatherIcon(weatherMain) {
    const iconElement = document.querySelector("#weather-icon .material-icons");
    const iconMap = {
      Clear: "wb_sunny",
      Clouds: "cloud",
      Rain: "rainy",
      Drizzle: "grain",
      Thunderstorm: "thunderstorm",
      Snow: "ac_unit",
      Mist: "foggy",
      Fog: "foggy",
      Haze: "foggy",
    };

    iconElement.textContent = iconMap[weatherMain] || "wb_sunny";
  }

  updateHourlyForecast(hourlyData) {
    const container = document.getElementById("hourly-forecast");
    container.innerHTML = "";

    hourlyData.forEach((item) => {
      const time = new Date(item.dt * 1000).toLocaleTimeString([], {
        hour: "numeric",
      });
      const temp = Math.round(item.main.temp);
      const icon = this.getWeatherIcon(item.weather[0].main);

      const hourlyItem = document.createElement("div");
      hourlyItem.className = "hourly-item";
      hourlyItem.innerHTML = `
                <div class="hourly-time">${time}</div>
                <div class="hourly-icon">
                    <span class="material-icons">${icon}</span>
                </div>
                <div class="hourly-temp">${temp}°</div>
            `;
      container.appendChild(hourlyItem);
    });
  }

  processWeeklyForecast(forecastList) {
    const dailyData = {};

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          weather: item.weather[0],
          date: item.dt,
        };
      }
      dailyData[date].temps.push(item.main.temp);
    });

    return Object.values(dailyData)
      .slice(0, 7)
      .map((day) => ({
        date: day.date,
        weather: day.weather,
        maxTemp: Math.round(Math.max(...day.temps)),
        minTemp: Math.round(Math.min(...day.temps)),
      }));
  }

  updateWeeklyForecast(weeklyData) {
    const container = document.getElementById("weekly-forecast");
    container.innerHTML = "";

    weeklyData.forEach((day, index) => {
      const date = new Date(day.date * 1000);
      const dayName =
        index === 0
          ? "Today"
          : index === 1
            ? "Tomorrow"
            : date.toLocaleDateString([], { weekday: "long" });
      const icon = this.getWeatherIcon(day.weather.main);

      const weeklyItem = document.createElement("div");
      weeklyItem.className = "weekly-item";
      weeklyItem.innerHTML = `
                <div class="weekly-day">${dayName}</div>
                <div class="weekly-icon">
                    <span class="material-icons">${icon}</span>
                </div>
                <div class="weekly-temps">
                    <span class="weekly-high">${day.maxTemp}°</span>
                    <span class="weekly-low">${day.minTemp}°</span>
                </div>
            `;
      container.appendChild(weeklyItem);
    });
  }

  getWeatherIcon(weatherMain) {
    const iconMap = {
      Clear: "wb_sunny",
      Clouds: "cloud",
      Rain: "rainy",
      Drizzle: "grain",
      Thunderstorm: "thunderstorm",
      Snow: "ac_unit",
      Mist: "foggy",
      Fog: "foggy",
      Haze: "foggy",
    };
    return iconMap[weatherMain] || "wb_sunny";
  }

  updateAirQuality() {
    // Mock air quality data
    const aqi = Math.floor(Math.random() * 100) + 1;
    document.getElementById("aqi-value").textContent = aqi;

    const label = document.getElementById("aqi-label");
    if (aqi <= 50) {
      label.textContent = "Good";
      label.className = "aqi-label";
    } else if (aqi <= 100) {
      label.textContent = "Moderate";
      label.className = "aqi-label moderate";
    } else {
      label.textContent = "Unhealthy";
      label.className = "aqi-label unhealthy";
    }
  }

  updateBackground(weatherType) {
    document.body.className = weatherType;
  }

  toggleUnits() {
    this.isMetric = !this.isMetric;
    const unitText = document.querySelector(".unit-text");
    unitText.textContent = this.isMetric ? "°C" : "°F";

    if (this.currentCity) {
      this.getWeatherData(this.currentCity);
    }
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showError("Geolocation is not supported");
      return;
    }

    this.showLoading();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const units = this.isMetric ? "metric" : "imperial";

          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=${units}`,
          );

          const data = await response.json();
          document.getElementById("city-input").value = data.name;
          await this.getWeatherData(data.name);
          this.currentCity = data.name;
        } catch (error) {
          this.showError("Unable to get weather for your location");
        } finally {
          this.hideLoading();
        }
      },
      () => {
        this.hideLoading();
        this.showError("Unable to access your location");
      },
    );
  }

  updateDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    };
    document.getElementById("date-time").textContent = now.toLocaleDateString(
      "en-US",
      options,
    );
  }

  showLoading() {
    document.getElementById("loading").classList.add("show");
  }

  hideLoading() {
    document.getElementById("loading").classList.remove("show");
  }

  showError(message) {
    const toast = document.getElementById("error-toast");
    const messageEl = document.getElementById("error-message");

    messageEl.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  loadDefaultWeather() {
    this.getWeatherData("New York").catch(() => {
      console.log("Failed to load default weather");
    });
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
