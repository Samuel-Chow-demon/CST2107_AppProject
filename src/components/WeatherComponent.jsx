import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS styles for the app

const App = () => {
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
    <div className="app">
      {/* Toggle Button */}
      <button className="toggle-weather-button" onClick={toggleWeather}>
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

      {/* Other app components */}
      <div className="main-content">
        <h1>Welcome, Zacharie</h1>
        <p>Manage your projects and tasks efficiently with SimpleWork.</p>
        {/* Add your Trello-like app components here */}
      </div>
    </div>
  );
};

export default App;
