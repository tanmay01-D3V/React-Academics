// ─── Constants ───────────────────────────────────────────────────────────────
const GEO_URL = (name) =>
  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`

const CURRENCY_URLS = (code) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.json`,
  `https://latest.currency-api.pages.dev/v1/currencies/${code}.json`,
]

// ─── Geocoding ────────────────────────────────────────────────────────────────
export async function getCoords(placeName) {
  if (!placeName) return null
  try {
    const res = await fetch(GEO_URL(placeName)).then((r) => r.json())
    return res.results?.[0] ?? null
  } catch {
    return null
  }
}

// core.js — add this alongside getCoords
export async function searchPlaces(query, count = 5) {
  if (!query) return []
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`
    ).then((r) => r.json())
    return res.results || []
  } catch {
    return []
  }
}

// ─── Distance ─────────────────────────────────────────────────────────────────
export function distanceKm(a, b) {
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}

// ─── Currency ─────────────────────────────────────────────────────────────────
export async function fetchCurrencyRate(from = 'INR', to = 'INR') {
  const f = from.toLowerCase()
  const t = to.toLowerCase()
  if (!f || !t || f === t) return f === t ? 1 : null

  for (const url of CURRENCY_URLS(f)) {
    try {
      const data = await fetch(url).then((r) => r.json())
      if (data[f]?.[t]) return data[f][t]
    } catch { /* try next */ }
  }
  return null
}

export async function toINR(amount, currency = 'INR') {
  if (!amount) return 0
  if (currency.toUpperCase() === 'INR') return Math.round(amount)
  const rate = await fetchCurrencyRate(currency, 'INR')
  return Math.round(amount * (rate ?? 90)) // 90 as last-resort fallback
}