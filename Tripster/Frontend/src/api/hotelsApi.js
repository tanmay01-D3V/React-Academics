import { distanceKm, toINR } from './core.js'


const dateAfter = (daysFromToday) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

const bboxFor = (place, span = 0.18) => {
  const lat = Number(place.latitude)
  const lon = Number(place.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return [
    (lat - span).toFixed(6),
    (lat + span).toFixed(6),
    (lon - span).toFixed(6),
    (lon + span).toFixed(6),
  ].join(',')
}

const numericPrice = (value) => {
  if (typeof value === 'number') return value > 0 ? value : null
  if (typeof value !== 'string') return null

  const parsed = Number(value.replace(/[^0-9.]/g, ''))
  return parsed > 0 ? parsed : null
}

const collectPrices = (value, prices = []) => {
  if (!value || typeof value !== 'object') return prices

  if (Array.isArray(value)) {
    value.forEach((item) => collectPrices(item, prices))
    return prices
  }

  Object.entries(value).forEach(([key, entry]) => {
    const normalizedKey = key.toLowerCase()
    const looksLikePrice =
      /price|amount|total|gross|net|all_inclusive|min_total/.test(normalizedKey) &&
      !/tax|fee|discount|score|rating|review|distance/.test(normalizedKey)

    if (looksLikePrice) {
      const price = numericPrice(entry)
      if (price) prices.push(price)
    }

    if (entry && typeof entry === 'object') collectPrices(entry, prices)
  })

  return prices
}

export async function fetchHotelPriceByCoords(origin, destination, days = 1, rooms = 1, guests = 1) {
  if (!origin || !destination) return null

  const nights = Math.max(Number(days) || 1, 1)
  const apiUrl = import.meta.env.VITE_HOTEL_API_URL || DEFAULT_HOTEL_API_URL
  if (apiUrl) {
    try {
      const bbox = bboxFor(destination)
      if (!bbox) throw new Error('Missing destination coordinates')

      const params = new URLSearchParams({
        arrival_date: import.meta.env.VITE_HOTEL_ARRIVAL_DATE || dateAfter(1),
        departure_date: import.meta.env.VITE_HOTEL_DEPARTURE_DATE || dateAfter(nights + 1),
        room_qty: String(rooms || 1),
        guest_qty: String(Math.max(Number(guests) || 1, 1)),
        bbox,
        search_id: 'none',
        price_filter_currencycode: 'USD',
        categories_filter: 'class::1,class::2,class::3',
        languagecode: 'en-us',
        travel_purpose: 'leisure',
        order_by: 'popularity',
        offset: '0',
      })

      const headers = { 'Content-Type': 'application/json' }
      const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY
      const rapidHost = import.meta.env.VITE_HOTEL_RAPIDAPI_HOST || DEFAULT_HOTEL_API_HOST
      if (rapidKey) headers['x-rapidapi-key'] = rapidKey
      if (rapidHost) headers['x-rapidapi-host'] = rapidHost

      if (!rapidKey) throw new Error('Missing RapidAPI key')

      const res = await fetch(`${apiUrl}?${params.toString()}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const prices = collectPrices(data).filter((price) => price > 5)
        const totalStayPrice = prices.length ? Math.min(...prices) : null

        if (totalStayPrice) {
          const pricePerNight = totalStayPrice / nights
          const pricePerNightInINR = await toINR(pricePerNight, 'USD')
          return { pricePerNight, currency: 'USD', pricePerNightInINR, source: 'api' }
        }
      }
    } catch { /* fall through to estimate */ }
  }

  // ─── Fallback estimate ───────────────────────────────────────────────────
  const km = distanceKm(origin, destination)
  const isIndia = ['IN', 'IND', 'INDIA'].includes(
    (destination.country_code || destination.country || '').toUpperCase()
  )
  const pricePerNightInINR = Math.max(km * (isIndia ? 8 : 30), isIndia ? 800 : 2000)
  return { pricePerNight: pricePerNightInINR, currency: 'INR', pricePerNightInINR, source: 'estimate' }
}
