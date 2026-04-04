const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const status = document.getElementById("status");
const results = document.getElementById("results");

searchBtn.addEventListener("click", runSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

async function runSearch() {
  const term = searchInput.value.trim();
  if (!term) {
    status.textContent = "Please enter a search term.";
    results.innerHTML = "";
    return;
  }

  status.textContent = "Loading...";
  results.innerHTML = "";

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=10&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      status.textContent = "No results found. Please try a different city.";
      return;
    }

    const city = geoData.results[0];
    
    const lat = city.latitude;
    const lon = city.longitude;
    const name = city.name;
    const country = city.country;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability&temperature_unit=fahrenheit&timezone=auto&forecast_hours=6`;
    
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    
    status.textContent = `Showing forecast for ${name}, ${country || ''}`;

    const h = weatherData.hourly;

    let cardHTML = `
      <div class="card">
        <h3>${name} Weather</h3>
        <p><em>Local Hourly Forecast</em></p>
        <ul class="forecast-list">
    `;

    for (let i = 0; i < h.time.length; i++) {
      const date = new Date(h.time[i]);
      const label = (i === 0) ? "Right Now" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      cardHTML += `
        <li>
          <strong>${label}</strong>: ${h.temperature_2m[i]}°F 
          <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">
            <span>Feels like: ${h.apparent_temperature[i]}°F</span> | 
            <span>Humidity: ${h.relative_humidity_2m[i]}%</span> | 
            <span>Rain: ${h.precipitation_probability[i]}%</span>
          </div>
        </li>`;
    }

    cardHTML += `</ul></div>`;
    results.innerHTML = cardHTML;

  } catch (error) {
    status.textContent = "Something went wrong. Please try again.";
    console.error(error);
  }
}
