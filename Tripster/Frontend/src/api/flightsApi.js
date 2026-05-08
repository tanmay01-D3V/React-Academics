const GEO_SEARCH = (name) => `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`

const toRad = (value) => (value * Math.PI) / 180
const distanceKm = (a, b) => {
	const dLat = toRad(b.latitude - a.latitude)
	const dLon = toRad(b.longitude - a.longitude)
	const lat1 = toRad(a.latitude)
	const lat2 = toRad(b.latitude)
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
	return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}

export async function getCoords(placeName) {
	if (!placeName) return null
	try {
		const res = await fetch(GEO_SEARCH(placeName)).then((r) => r.json())
		return res.results?.[0] || null
	} catch (err) {
		return null
	}
}

export async function fetchFlightPriceByCoords(origin, destination, travelers = 1) {
	if (!origin || !destination) return null

	// Try external API if configured
	const apiUrl = import.meta.env.VITE_FLIGHT_API_URL
	const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY
	const rapidHost = import.meta.env.VITE_RAPIDAPI_HOST

	if (apiUrl) {
		try {
			const params = new URLSearchParams({
				orig_lat: String(origin.latitude),
				orig_lon: String(origin.longitude),
				dest_lat: String(destination.latitude),
				dest_lon: String(destination.longitude),
				travelers: String(travelers || 1),
			})

			const headers = { 'Content-Type': 'application/json' }
			if (rapidKey) headers['x-rapidapi-key'] = rapidKey
			if (rapidHost) headers['x-rapidapi-host'] = rapidHost

			const res = await fetch(`${apiUrl}?${params.toString()}`, { headers })
			if (res.ok) {
				const data = await res.json()
				// Expecting { price: number, currency: 'USD' } or similar from upstream API.
				if (data && typeof data.price === 'number') {
					// Convert returned currency to INR so the app is India-first.
					let priceInINR = data.price
					const returnedCurrency = (data.currency || 'USD').toUpperCase()
					if (returnedCurrency !== 'INR') {
						try {
							// Best-effort conversion via public currency API
							const code = returnedCurrency.toLowerCase()
							const urls = [
								`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.json`,
								`https://latest.currency-api.pages.dev/v1/currencies/${code}.json`,
							]
							for (const url of urls) {
								try {
									const d = await fetch(url).then((r) => r.json())
									if (d[code]?.inr) {
										priceInINR = data.price * d[code].inr
										break
									}
								} catch {
									// try next
								}
							}
						// if conversion failed, leave priceInINR as original price
						priceInINR = Math.round(priceInINR)
					} catch (e) {
						// ignore conversion errors
					}
					}
					return { price: data.price, currency: returnedCurrency, priceInINR, source: 'api' }
				}
			}
		} catch (err) {
			// Fall through to estimate
		}
	}

	// Fallback: deterministic estimate based on great-circle distance
	const km = distanceKm(origin, destination)
	// Simple estimate: base per-traveler fare scales with distance
	const price = Math.max(Math.round(km * 12), 1500)
	return { price, currency: 'INR', priceInINR: price, source: 'estimate' }
}

export default {
	getCoords,
	fetchFlightPriceByCoords,
}