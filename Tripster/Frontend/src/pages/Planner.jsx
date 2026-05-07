import { useEffect, useMemo, useState } from "react"
import airplane from "../assets/airplane-fill.svg"
import { searchImages } from "../api/imageSearchApi"

const tierRates = { Economy: 0.8, Premium: 1, Luxury: 1.45 }
const format = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`
const cityCosts = {
  mumbai: { flight: 0, stay: 5500, food: 650, image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1400&q=80' },
  thane: { flight: 0, stay: 4200, food: 550, image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1400&q=80' },
  paris: { flight: 55000, stay: 9000, food: 3500, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80' },
  london: { flight: 60000, stay: 11000, food: 4200, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80' },
  dubai: { flight: 28000, stay: 8000, food: 3000, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80' },
  singapore: { flight: 33000, stay: 8500, food: 3200, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80' },
  default: { flight: 45000, stay: 7000, food: 2800, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80' },
}
const weatherText = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Foggy', 61: 'Rainy', 63: 'Rainy', 80: 'Showers' }
const cityName = (value) => value.split(',')[0].trim()
const toRad = (value) => (value * Math.PI) / 180
const distanceKm = (a, b) => {
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}
const transportFor = (km) => {
  if (!km) return { mode: 'Checking route', text: 'Enter both cities to estimate distance.' }
  if (km < 120) return { mode: 'Car / Cab', text: 'Short route. Road travel should be quickest and flexible.' }
  if (km < 800) return { mode: 'Train / Road', text: 'Medium distance. Compare trains with a self-drive plan.' }
  return { mode: 'Flight', text: 'Long distance. Flight is likely the most efficient option.' }
}
const getRateToInr = async (currency) => {
  if (currency === 'INR') return 1
  const code = currency.toLowerCase()
  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${code}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${code}.json`,
  ]

  for (const url of urls) {
    try {
      const data = await fetch(url).then((res) => res.json())
      if (data[code]?.inr) return data[code].inr
    } catch {
      // Try the fallback URL.
    }
  }

  return 90.42
}
const getPlacePhoto = async (destination) => {
  const key = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
  if (!key || !destination) return null

  const search = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.photos.name',
    },
    body: JSON.stringify({ textQuery: destination }),
  }).then((res) => res.json())

  const photoName = search.places?.[0]?.photos?.[0]?.name
  return photoName ? `https://places.googleapis.com/v1/${photoName}/media?key=${key}&maxWidthPx=1400` : null
}

const Planner = () => {
  const [trip, setTrip] = useState({
    origin: 'New Delhi, India',
    destination: 'Paris, France',
    days: 10,
    travelers: 2,
    tier: 'Premium',
    insurance: true,
    gst: false,
  })
  const [live, setLive] = useState({ rate: 90.42, currency: 'EUR', weather: null, photoUrl: null, source: 'fallback' })
  const [route, setRoute] = useState({ km: null, domestic: false, loading: true })
  const [activeInput, setActiveInput] = useState(null)
  const [suggestions, setSuggestions] = useState({ origin: [], destination: [] })

  const setField = (field, value) => setTrip({ ...trip, [field]: value })

  useEffect(() => {
    if (!activeInput || trip[activeInput].trim().length < 3) return

    const timer = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip[activeInput])}&count=5&language=en&format=json`)
        .then((res) => res.json())
        .then((data) => setSuggestions((items) => ({ ...items, [activeInput]: data.results || [] })))
        .catch(() => setSuggestions((items) => ({ ...items, [activeInput]: [] })))
    }, 250)

    return () => clearTimeout(timer)
  }, [activeInput, trip])

  const choosePlace = (field, place) => {
    setField(field, `${place.name}, ${place.country}`)
    setActiveInput(null)
    setSuggestions((items) => ({ ...items, [field]: [] }))
  }

  const closeSuggestions = (field) => {
    setTimeout(() => {
      setActiveInput(null)
      setSuggestions((items) => ({ ...items, [field]: [] }))
    }, 120)
  }

  const handlePlaceInput = (field, value) => {
    setField(field, value)
    if (value.trim().length < 3) setSuggestions((items) => ({ ...items, [field]: [] }))
  }

  useEffect(() => {
    let active = true
    const origin = cityName(trip.origin)
    const destination = cityName(trip.destination)
    const geocode = (name) => fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`).then((res) => res.json())

    Promise.all([geocode(origin), geocode(destination)])
      .then(async ([originGeo, destinationGeo]) => {
        if (!active) return
        const originPlace = originGeo.results?.[0]
        const place = destinationGeo.results?.[0]
        const domestic = Boolean(originPlace?.country_code && place?.country_code && originPlace.country_code === place.country_code)
        let currency = 'EUR'
        let rate = 90.42

        if (place && !domestic) {
          const country = await fetch(`https://restcountries.com/v3.1/alpha/${place.country_code}?fields=currencies`).then((res) => res.json())
          currency = Object.keys(country.currencies || {})[0] || 'EUR'
          rate = await getRateToInr(currency)
        }

        setRoute({
          km: originPlace && place ? distanceKm(originPlace, place) : null,
          domestic,
          loading: false,
        })
        if (!place) return setLive({ rate, currency, weather: null, photoUrl: null, source: 'live' })

        const [weather, photoUrlFromPlaces, imageSearchUrl] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&timezone=auto`).then((res) => res.json()),
          getPlacePhoto(trip.destination).catch(() => null),
          // image search via RapidAPI (google-search-master-mega)
          searchImages(cityName(trip.destination)).catch(() => null),
        ])

        // Prefer image search result if available, otherwise fallback to Google Places photo
        const finalPhoto = imageSearchUrl || photoUrlFromPlaces || null
        if (active) setLive({ rate, currency, weather: weather.current, photoUrl: finalPhoto, source: 'live' })
      })
      .catch(() => {
        setLive((data) => ({ ...data, source: 'fallback' }))
        setRoute({ km: null, domestic: false, loading: false })
      })

    return () => {
      active = false
    }
  }, [trip.origin, trip.destination])

  const costs = useMemo(() => {
    const days = Number(trip.days) || 1
    const travelers = Number(trip.travelers) || 1
    const tier = tierRates[trip.tier]
    const city = cityCosts[cityName(trip.destination).toLowerCase()] || cityCosts.default
    const isLocal = route.domestic && route.km && route.km < 120
    const rooms = Math.ceil(travelers / 2)
    const flight = isLocal ? Math.max(route.km * 30 * 2 * tier, 350) : city.flight * travelers * tier
    const stay = city.stay * days * rooms * tier
    const food = (isLocal ? 650 : city.food) * days * travelers * tier
    const buffer = route.domestic ? (flight + stay + food) * 0.03 : (flight + stay + food) * 0.08
    const insurance = trip.insurance ? 2200 * travelers : 0
    const gst = trip.gst ? (flight + stay) * 0.18 : 0

    return [
      ['✈', isLocal ? 'Local Transport' : 'Flights & Local', flight, isLocal ? `${route.km} km cab estimate, return included` : `${trip.tier} flight estimate`, isLocal ? 'Route Based' : 'Live Rate'],
      ['▣', 'Accommodation', stay, `${days} night(s), ${rooms} room(s)`, 'Editable'],
      ['🍴', 'Dining & Food', food, isLocal ? `Local meals for ${days} day(s)` : `${trip.tier} dining plan`, 'Detailed'],
      ['$', route.domestic ? 'Local Buffers' : 'Forex & Buffers', buffer + insurance + gst, route.domestic ? 'Domestic trip · no forex needed' : `${live.currency} 1 = ₹${live.rate.toFixed(2)} · ${live.source}`, 'Calculated'],
    ]
  }, [trip, live, route])

  const city = cityCosts[cityName(trip.destination).toLowerCase()] || cityCosts.default
  const destinationImage = live.photoUrl || city.image
  const weather = live.weather
    ? `${Math.round(live.weather.temperature_2m)}°C ${weatherText[live.weather.weather_code] || 'Current weather'}`
    : 'Weather loading'
  const transport = transportFor(route.km)

  return (
    <section className="min-h-screen w-full bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-1xl">
        <div className="mb-10 flex items-center justify-between gap-6 text-sm font-extrabold tracking-widest text-emerald-800">
          <div className="flex-1">
            <p>CALCULATOR PROGRESS</p>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-emerald-700 to-amber-400" />
            </div>
          </div>
          <p className="hidden text-slate-600 sm:block">Step 3 of 5: Stay & Flights</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1fr]">
          <aside>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-extrabold">Trip Parameters</h1>
              {[
                ['Origin City', 'origin'],
                ['Destination', 'destination'],
              ].map(([label, field]) => (
                <label key={label} className="mt-7 block font-bold text-slate-600">
                  {label}
                  <span className="relative block">
                    <input
                      className="mt-3 w-full rounded-lg bg-slate-50 p-4 text-lg font-medium text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-400"
                      value={trip[field]}
                      onFocus={() => setActiveInput(field)}
                      onChange={(event) => handlePlaceInput(field, event.target.value)}
                      onBlur={() => closeSuggestions(field)}
                    />
                    {activeInput === field && suggestions[field].length > 0 && (
                      <span className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl bg-white text-slate-800 shadow-lg ring-1 ring-slate-100">
                        {suggestions[field].map((place) => (
                          <button
                            key={`${place.id}-${place.name}`}
                            type="button"
                            onMouseDown={() => choosePlace(field, place)}
                            className="block w-full px-4 py-3 text-left hover:bg-teal-50"
                          >
                            <span className="block font-bold">{place.name}, {place.country}</span>
                            <span className="text-sm font-medium text-slate-500">{place.admin1 || place.timezone}</span>
                          </button>
                        ))}
                      </span>
                    )}
                  </span>
                  {field === 'destination' && (
                    <span className="mt-4 block rounded-xl border border-teal-100 bg-teal-50 p-4 text-slate-700">
                      <span className="block text-sm font-extrabold uppercase tracking-wide text-emerald-700">
                        Suggested transport
                      </span>
                      <span className="mt-1 block text-lg font-extrabold text-slate-900">
                        {route.loading ? 'Checking distance...' : `${transport.mode}${route.km ? ` · ${route.km.toLocaleString('en-IN')} km` : ''}`}
                      </span>
                      <span className="mt-1 block text-sm font-medium text-slate-500">{transport.text}</span>
                    </span>
                  )}
                </label>
              ))}

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {[
                  ['Days', 'days'],
                  ['Travelers', 'travelers'],
                ].map(([label, field]) => (
                  <label key={label} className="font-bold text-slate-600">
                    {label}
                    <input
                      type="number"
                      min="1"
                      className="mt-3 w-full rounded-lg bg-slate-50 p-4 text-lg font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-400"
                      value={trip[field]}
                      onChange={(event) => setField(field, event.target.value)}
                    />
                  </label>
                ))}
              </div>

              <p className="mt-7 font-bold text-slate-600">Budget Tier</p>
              <div className="mt-3 grid grid-cols-3 rounded-xl bg-slate-200 p-1 text-center font-bold text-slate-600">
                {Object.keys(tierRates).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setField('tier', tier)}
                    className={`rounded-lg py-2 ${trip.tier === tier ? 'bg-[#151b1b] text-white' : ''}`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {[
                ['insurance', 'Include Travel Insurance'],
                ['gst', 'Apply GST (18%) for India'],
              ].map(([field, label]) => (
                <label key={field} className="mt-7 flex items-center gap-4 text-lg">
                  <input
                    type="checkbox"
                    checked={trip[field]}
                    onChange={(event) => setField(field, event.target.checked)}
                    className="h-6 w-6 accent-teal-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </aside>

          <div>
            <div className="grid gap-7 md:grid-cols-2">
              {costs.map(([icon, title, amount, note, status], index) => (
                <article key={title} className="rounded-2xl bg-white p-7 shadow-sm">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-10">
                    <span className={`grid h-14 w-14 place-items-center rounded-full text-2xl ${index === 3 ? 'bg-[#151b1b] text-teal-300' : 'bg-teal-100 text-emerald-700'}`}>
                      {index === 0 ? <img className="h-8 w-8" src={airplane} alt="" /> : icon}
                    </span>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-600">{title}</p>
                      <h3 className="text-4xl font-extrabold">{format(amount)}</h3>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between gap-4 text-lg">
                    <p className="text-slate-500">{note}</p>
                    <p className="font-extrabold text-emerald-700">{status}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl bg-[#151b1b] shadow-lg">
              <div className="relative h-80 bg-cover bg-center" style={{ backgroundImage: `url(${destinationImage})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="font-extrabold text-teal-300">Current Destination Selection</p>
                  <h2 className="mt-2 text-4xl font-extrabold">{trip.destination || 'Your destination'}</h2>
                  <p className="mt-5 text-lg">
                    {weather} &nbsp;&nbsp; {route.domestic ? 'Domestic route · no forex needed' : `Forex: ${live.currency} 1 = ₹${live.rate.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Planner
