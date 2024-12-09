import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApiComponentZach.css'

const WeatherComponent = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [showWeather, setShowWeather] = useState(false);

  // Fetch user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => setError('Unable to fetch location.')
    );
  }, []);

  // Fetch weather data
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const apiKey = '88fb18fef2fc838f632a26564d644422'; 
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;

      axios
        .get(url)
        .then((response) => setWeather(response.data))
        .catch((err) => setError('Unable to fetch weather data.'));
    }
  }, [location]);

  const toggleWeather = () => {
    setShowWeather((prev) => !prev);
  };

  return (
    <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
      {/* Toggle Button */}
      <button className="toggle-weather-button" style={{width: 'auto', height: 'auto'}} onClick={toggleWeather} onBlur={toggleWeather}>
        {showWeather ? 'Hide Weather' : 'Show Weather'}
      </button>

      {/* Weather Widget */}
      {showWeather && (
        <div className="weather-widget">
          {error ? (
            <div className="weather-widget error">{error}</div>
          ) : !weather ? (
            <div className="weather-widget loading">Loading weather...</div>
          ) : (
            <>
              <div className="weather-location">{weather.name}</div>
              <div className="weather-temp">{weather.main.temp}°C</div>
              <div className="weather-description">{weather.weather[0].description}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherComponent;
