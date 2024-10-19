const apiKey = 'ca72bdc62664c1fcdbe44d3e85e345b0';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

searchBtn.addEventListener('click', getWeather);

async function getWeather() {
    const city = cityInput.value;
    if (!city) return;

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (data.cod === '404') {
            alert('City not found. Please try again.');
            return;
        }

        cityName.textContent = data.name;
        temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
        description.textContent = `Weather: ${data.weather[0].description}`;
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred. Please try again.');
    }
}
