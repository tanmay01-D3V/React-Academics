import { distanceKm, toINR } from './core.js'

const airportByCity = {
  abu_dhabi: 'AUH',amsterdam: 'AMS',bangkok: 'BKK',barcelona: 'BCN',beijing: 'PEK',belgium: 'BRU',bengaluru: 'BLR',berlin: 'BER',brussels: 'BRU',
  chennai: 'MAA',delhi: 'DEL',dubai: 'DXB',frankfurt: 'FRA',goa: 'GOI',hong_kong: 'HKG',jaipur: 'JAI',jakarta: 'CGK',kuala_lumpur: 'KUL',
  london: 'LHR',os_angeles: 'LAX',madrid: 'MAD',mandalay: 'MDL',mumbai: 'BOM',myanmar: 'RGN',new_delhi: 'DEL',new_york: 'JFK',paris: 'CDG',
  pattaya: 'BKK',rome: 'FCO',singapore: 'SIN',sydney: 'SYD',tokyo: 'HND',yangon: 'RGN',
}

const airportByCountry = {AE: 'DXB',BE: 'BRU',GB: 'LHR',IN: 'DEL',MM: 'RGN',SG: 'SIN',TH: 'BKK',US: 'JFK',FR: 'CDG',DE: 'FRA',ES: 'MAD',IT: 'FCO',NL: 'AMS',CN: 'PEK',AU: 'SYD'}

const normalizeKey = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const getAirportCode = (place) => {
  const candidates = [
    place?.iata,
    place?.iata_code,
    place?.airportCode,
    airportByCity[normalizeKey(place?.name)],
    airportByCity[normalizeKey(place?.admin1)],
    airportByCity[normalizeKey(place?.country)],
    airportByCountry[(place?.country_code || '').toUpperCase()],
  ]

  return candidates.find((code) => typeof code === 'string' && /^[A-Z]{3}$/.test(code)) || null
}

const nextTravelDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

const findPrices = (value, prices = []) => {
  if (!value || typeof value !== 'object') return prices

  if (Array.isArray(value)) {
    value.forEach((item) => findPrices(item, prices))
    return prices
  }

  Object.entries(value).forEach(([key, entry]) => {
    const normalizedKey = key.toLowerCase()
    const isPriceKey = /price|fare|amount|total|cost/.test(normalizedKey)

    if (isPriceKey) {
      if (typeof entry === 'number') prices.push(entry)
      if (typeof entry === 'string') {
        const parsed = Number(entry.replace(/[^0-9.]/g, ''))
        if (parsed) prices.push(parsed)
      }
    }

    if (entry && typeof entry === 'object') findPrices(entry, prices)
  })

  return prices
}

export async function fetchFlightPriceByCoords(origin, destination, travelers = 1) {
  if (!origin || !destination) return null

  const apiUrl = import.meta.env.VITE_FLIGHT_API_URL
  const from = getAirportCode(origin)
  const to = getAirportCode(destination)

  if (apiUrl) {
    try {
      const params = new URLSearchParams({
        from: from || '',
        to: to || '',
        date: import.meta.env.VITE_FLIGHT_DEPARTURE_DATE || nextTravelDate(),
        adult: String(travelers || 1),
        child: '0',
        infant: '0',
        type: 'economy',
        currency: 'INR',
      })

      const headers = { 'Content-Type': 'application/json' }
      const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY
      const rapidHost = import.meta.env.VITE_RAPIDAPI_HOST
      if (rapidKey) headers['x-rapidapi-key'] = rapidKey
      if (rapidHost) headers['x-rapidapi-host'] = rapidHost

      if (apiUrl && rapidKey && rapidHost && from && toz) {
        const res = await fetch(`${apiUrl}?${params}`, { headers })
        if (!res.ok) throw new Error('Flight fare API request failed')

        const data = await res.json()
        if (typeof data?.price === 'number') {
          const currency = (data.currency || 'USD').toUpperCase()
          const oneWayPriceInINR = await toINR(data.price, currency)
          const priceInINR = oneWayPriceInINR * 2
          return { price: data.price * 2, currency, priceInINR, source: 'api round trip' }
        }

        const prices = findPrices(data).filter((price) => price > 0)
        const oneWayPrice = prices.length ? Math.min(...prices) : null
        if (oneWayPrice) {
          const priceInINR = Math.round(oneWayPrice * 2)
          return { price: priceInINR, currency: 'INR', priceInINR, source: 'api round trip' }
        }
      }
    } catch {
      // Fall through to route-based estimate.
    }
  }

  const km = distanceKm(origin, destination)
  const domestic = Boolean(
    origin.country_code &&
    destination.country_code &&
    origin.country_code === destination.country_code
  )
  const oneWayEstimate = Math.max(km * (domestic ? 5 : 7), domestic ? 2500 : 12000)
  const priceInINR = Math.round(oneWayEstimate * 2)
  return { price: priceInINR, currency: 'INR', priceInINR, source: 'round trip estimate' }
}
