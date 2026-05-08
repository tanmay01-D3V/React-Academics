const toRad = (value) => (value * Math.PI) / 180
const distanceKm = (a, b) => {
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}

const convertToINR = async (amount, currency) => {
  if (!amount || !currency) return amount
  if (currency.toUpperCase() === 'INR') return amount
  const code = currency.toLowerCase()
  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${code}.json`,
  ]
  for (const url of urls) {
    try {
      const d = await fetch(url).then((r) => r.json())
      if (d[code]?.inr) return Math.round(amount * d[code].inr)
    } catch {
      // try next
    }
  }
  return Math.round(amount * 90)
}

/**
 * Fetch hotel price near given coords. Tries configured API (VITE_HOTEL_API_URL)
 * with RapidAPI headers if available. Returns { pricePerNightInINR, currency, source }
 */
export async function fetchHotelPriceByCoords(origin, destination, days = 1, rooms = 1) {
  if (!origin || !destination) return null

  const apiUrl = import.meta.env.VITE_HOTEL_API_URL
  const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY
  const rapidHost = import.meta.env.VITE_RAPIDAPI_HOST

  // Prefer calling configured hotel API
  if (apiUrl) {
    try {
      const params = new URLSearchParams({
        orig_lat: String(origin.latitude),
        orig_lon: String(origin.longitude),
        dest_lat: String(destination.latitude),
        dest_lon: String(destination.longitude),
        nights: String(days || 1),
        rooms: String(rooms || 1),
      })

      const headers = { 'Content-Type': 'application/json' }
      if (rapidKey) headers['x-rapidapi-key'] = rapidKey
      if (rapidHost) headers['x-rapidapi-host'] = rapidHost

      const res = await fetch(`${apiUrl}?${params.toString()}`, { headers })
      if (res.ok) {
        const data = await res.json()
        // Expect data.pricePerNight and data.currency or similar
        if (data && (data.pricePerNight || data.price)) {
          const perNight = data.pricePerNight || data.price
          const currency = (data.currency || 'USD').toUpperCase()
          const pricePerNightInINR = await convertToINR(perNight, currency)
          return { pricePerNight: perNight, currency, pricePerNightInINR, source: 'api' }
        }
      }
    } catch (e) {
      // fallthrough to estimate
    }
  }

  // Fallback estimate: base per-night scales with distance between origin and dest
  const km = distanceKm(origin, destination)
  // Use India-first, more realistic fallbacks for INR when destination is in India
  const destCountryCode = (destination.country_code || (destination.country || '')).toString().toUpperCase()
  const inIndia = destCountryCode === 'IN' || destCountryCode === 'IND' || (destination.country || '').toLowerCase() === 'india'
  const multiplier = inIndia ? 8 : 30
  const minimum = inIndia ? 800 : 2000
  const base = Math.max(Math.round(km * multiplier), minimum)
  const pricePerNightInINR = base
  return { pricePerNight: pricePerNightInINR, currency: 'INR', pricePerNightInINR, source: 'estimate' }
}

export default { fetchHotelPriceByCoords }
