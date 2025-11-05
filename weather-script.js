// OpenWeatherMap API Key - FREE (Sign up at openweathermap.org)
const API_KEY = '444409c63aadd11d7259d992ed3378a7'; // Replace with your API key
const API_BASE = 'https://api.openweathermap.org/data/2.5/weather';

// Handle Enter key press in city input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        getWeatherByCity();
    }
}

// Get weather by city name
async function getWeatherByCity() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        const url = `${API_BASE}?q=${encodeURIComponent(city)},IN&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling.');
            } else if (response.status === 401) {
                throw new Error('API key invalid. Please set up your API key.');
            } else {
                throw new Error('Failed to fetch weather data');
            }
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Weather fetch error:', error);
    }
}

// Get weather by current location (GPS)
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const url = `${API_BASE}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch weather data');
                }
                
                const data = await response.json();
                displayWeather(data);
                
            } catch (error) {
                hideLoading();
                showError(error.message);
                console.error('Weather fetch error:', error);
            }
        },
        (error) => {
            hideLoading();
            let errorMsg = 'Unable to get your location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg += 'Location request timed out.';
                    break;
                default:
                    errorMsg += 'Unknown error occurred.';
            }
            
            showError(errorMsg);
        }
    );
}

// Display weather data
function displayWeather(data) {
    hideLoading();
    
    // Hide location section, show weather section
    document.getElementById('locationSection').style.display = 'none';
    document.getElementById('weatherSection').style.display = 'block';
    
    // City name and date
    document.getElementById('cityName').innerHTML = 
        `<i class="fas fa-map-marker-alt"></i> ${data.name}, ${data.sys.country}`;
    
    const date = new Date();
    document.getElementById('weatherDate').textContent = 
        date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Weather icon
    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = 
        `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    // Temperature and description
    document.getElementById('currentTemp').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    
    // Weather stats
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('windSpeed').textContent = Math.round(data.wind.speed * 3.6) + ' km/h';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    document.getElementById('visibility').textContent = (data.visibility / 1000).toFixed(1) + ' km';
    
    // Sunrise and sunset
    document.getElementById('sunrise').textContent = formatTime(data.sys.sunrise);
    document.getElementById('sunset').textContent = formatTime(data.sys.sunset);
    
    // Min and max temperature
    document.getElementById('tempMax').textContent = Math.round(data.main.temp_max) + '°C';
    document.getElementById('tempMin').textContent = Math.round(data.main.temp_min) + '°C';
    
    // Generate farming tips
    generateFarmingTips(data);
}

// Format Unix timestamp to time
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// Generate farming tips based on weather
function generateFarmingTips(data) {
    const tipsContainer = document.getElementById('farmingTips');
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const weather = data.weather[0].main.toLowerCase();
    const windSpeed = data.wind.speed;
    
    let tips = [];
    
    // Temperature-based tips
    if (temp > 35) {
        tips.push('🌡️ Very hot day! Ensure adequate irrigation. Water crops early morning or evening.');
        tips.push('🌾 Avoid transplanting or heavy field work during peak afternoon hours.');
    } else if (temp > 28) {
        tips.push('☀️ Warm weather is good for most crops. Maintain regular watering schedule.');
    } else if (temp < 15) {
        tips.push('❄️ Cool weather! Protect sensitive crops from cold. Consider frost protection measures.');
    }
    
    // Weather condition tips
    if (weather.includes('rain')) {
        tips.push('🌧️ Rainy conditions! Postpone spraying pesticides and fertilizers.');
        tips.push('💧 Check for waterlogging in fields. Ensure proper drainage.');
    } else if (weather.includes('clear') || weather.includes('sun')) {
        tips.push('☀️ Clear weather is ideal for harvesting and drying produce.');
        tips.push('🚜 Good day for field operations and equipment maintenance.');
    } else if (weather.includes('cloud')) {
        tips.push('☁️ Cloudy conditions reduce water loss. Good for transplanting.');
    }
    
    // Humidity-based tips
    if (humidity > 80) {
        tips.push('💨 High humidity! Monitor crops for fungal diseases. Improve air circulation.');
    } else if (humidity < 40) {
        tips.push('🌵 Low humidity! Increase watering frequency to prevent crop stress.');
    }
    
    // Wind-based tips
    if (windSpeed > 10) {
        tips.push('💨 Windy conditions! Postpone spraying operations. Secure loose items.');
    }
    
    // General tips
    tips.push('📱 Check weather forecast regularly to plan farm activities.');
    
    // Display tips
    if (tips.length === 0) {
        tips.push('🌾 Normal weather conditions. Continue with regular farming activities.');
    }
    
    tipsContainer.innerHTML = tips.map(tip => 
        `<div class="tip-item">${tip}</div>`
    ).join('');
}

// Change location
function changeLocation() {
    document.getElementById('locationSection').style.display = 'block';
    document.getElementById('weatherSection').style.display = 'none';
    document.getElementById('cityInput').value = '';
    document.getElementById('locationError').textContent = '';
}

// Show loading state
function showLoading() {
    document.getElementById('locationSection').style.display = 'none';
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('weatherSection').style.display = 'none';
    document.getElementById('locationError').textContent = '';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

// Show error message
function showError(message) {
    document.getElementById('locationError').textContent = message;
    document.getElementById('locationSection').style.display = 'block';
    document.getElementById('weatherSection').style.display = 'none';
}
