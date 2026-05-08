// Small weather helper using Open-Meteo current_weather (no API key required)
const WEATHER_URL = (lat, lon) => `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`

const weatherCodeToText = (code) => {
  // Open-Meteo weather codes: simplified descriptions
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }
  return map[Number(code)] || 'Unknown'
}

export async function fetchWeatherByCoords(place) {
  if (!place || !place.latitude || !place.longitude) return null
  try {
    const res = await fetch(WEATHER_URL(place.latitude, place.longitude))
    if (!res.ok) return null
    const data = await res.json()
    const cw = data.current_weather
    if (!cw) return null
    return {
      tempC: cw.temperature,
      windKmph: cw.windspeed,
      weathercode: cw.weathercode,
      description: weatherCodeToText(cw.weathercode),
      source: 'open-meteo',
      fetchedAt: Date.now(),
    }
  } catch (e) {
    return null
  }
}

export default { fetchWeatherByCoords }
