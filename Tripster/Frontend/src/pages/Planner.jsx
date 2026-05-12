import React from 'react'
import { useEffect, useMemo, useState } from "react"
import airplane from "../assets/airplane-fill.svg"
import { fetchFlightPriceByCoords } from "../api/flightsApi"
import { fetchHotelPriceByCoords } from "../api/hotelsApi"
import { fetchWeatherByCoords } from "../api/weatherApi"
import Footer from "../components/Footer.jsx"

const tierRates = { Economy: 0.8, Premium: 1, Luxury: 1.45 }
const format = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`
const cityCosts = { default: { flight: 45000, stay: 7000, food: 2800 } }
const cityName = (value = '') => value.split(',')[0].trim()
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
  if (km < 120) return { mode: 'Car / Cab', text: 'Short route' }
  if (km < 800) return { mode: 'Train / Road', text: 'Medium distance' }
  return { mode: 'Flight', text: 'Long distance' }
}

const Planner = () => {
  const [trip, setTrip] = useState({ origin: 'New Delhi, India', destination: 'Mumbai, India', days: 5, travelers: 1, tier: 'Premium', insurance: true, gst: false })
  const [route, setRoute] = useState({ km: null, domestic: false, loading: true })
  const [flightData, setFlightData] = useState(null)
  const [hotelData, setHotelData] = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [activeInput, setActiveInput] = useState(null)
  const [suggestions, setSuggestions] = useState({ origin: [], destination: [] })

  const setField = (field, value) => setTrip((t) => ({ ...t, [field]: value }))

  useEffect(() => {
    if (!activeInput || (trip[activeInput] || '').trim().length < 3) return
    const timer = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip[activeInput])}&count=5&language=en&format=json`)
        .then((res) => res.json())
        .then((data) => setSuggestions((s) => ({ ...s, [activeInput]: data.results || [] })))
        .catch(() => setSuggestions((s) => ({ ...s, [activeInput]: [] })))
    }, 250)
    return () => clearTimeout(timer)
  }, [activeInput, trip])

  const choosePlace = (field, place) => {
    setField(field, `${place.name}, ${place.country}`)
    setActiveInput(null)
    setSuggestions((s) => ({ ...s, [field]: [] }))
  }
  const closeSuggestions = (field) => setTimeout(() => { setActiveInput(null); setSuggestions((s) => ({ ...s, [field]: [] })) }, 120)
  const handlePlaceInput = (field, value) => { setField(field, value); if ((value || '').trim().length < 3) setSuggestions((s) => ({ ...s, [field]: [] })) }

  useEffect(() => {
    let active = true
    const origin = cityName(trip.origin)
    const destination = cityName(trip.destination)
    const geocode = (name) => fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`).then((r) => r.json())

    Promise.all([geocode(origin), geocode(destination)])
      .then(async ([oRes, dRes]) => {
        if (!active) return
        const originPlace = oRes.results?.[0]
        const destPlace = dRes.results?.[0]
        const domestic = Boolean(originPlace?.country_code && destPlace?.country_code && originPlace.country_code === destPlace.country_code)
        setRoute({ km: originPlace && destPlace ? distanceKm(originPlace, destPlace) : null, domestic, loading: false })
        if (originPlace && destPlace) {
          try {
            const [priceResult, hotelResult, weatherResult] = await Promise.all([
              fetchFlightPriceByCoords(originPlace, destPlace, trip.travelers).catch(() => null),
              fetchHotelPriceByCoords(originPlace, destPlace, trip.days, Math.ceil(trip.travelers / 2)).catch(() => null),
              fetchWeatherByCoords(destPlace).catch(() => null),
            ])
            setFlightData(priceResult || null)
            setHotelData(hotelResult || null)
            setWeatherData(weatherResult || null)
          } catch {
            setFlightData(null)
            setHotelData(null)
            setWeatherData(null)
          }
        } else {
          setFlightData(null)
          setHotelData(null)
        }
      })
      .catch(() => setRoute({ km: null, domestic: false, loading: false }))

    return () => { active = false }
  }, [trip.origin, trip.destination, trip.travelers])

  const costs = useMemo(() => {
    const days = Number(trip.days) || 1
    const travelers = Number(trip.travelers) || 1
    const tier = tierRates[trip.tier] || 1
    const city = cityCosts[cityName(trip.destination).toLowerCase()] || cityCosts.default
    const isLocal = route.domestic && route.km && route.km < 120
    const rooms = Math.ceil(travelers / 2)
    const flight = isLocal
      ? Math.max((route.km || 0) * 30 * 2 * tier, 350)
      : (flightData && flightData.priceInINR) ? flightData.priceInINR * travelers * tier : city.flight * travelers * tier
    const perNight = (hotelData && hotelData.pricePerNightInINR) ? hotelData.pricePerNightInINR : (city.stay || 0)
    const stay = perNight * days * rooms * tier
    const food = (isLocal ? 650 : (city.food || 0)) * days * travelers * tier
    const buffer = route.domestic ? (flight + stay + food) * 0.03 : (flight + stay + food) * 0.08
    const insurance = trip.insurance ? 2200 * travelers : 0
    const gst = trip.gst ? (flight + stay) * 0.18 : 0
    return [
      ['✈', isLocal ? 'Local Transport' : 'Flights & Local', flight, isLocal ? `${route.km} km cab estimate` : `${trip.tier} flight estimate`, isLocal ? 'Route Based' : (flightData?.source || 'Estimate')],
      ['▣', 'Accommodation', stay, `${days} night(s), ${rooms} room(s)`, 'Editable'],
      ['🍴', 'Dining & Food', food, isLocal ? `Local meals for ${days} day(s)` : `${trip.tier} dining plan`, 'Detailed'],
      ['$', route.domestic ? 'Local Buffers' : 'Forex & Buffers', buffer + insurance + gst, route.domestic ? 'Domestic trip · no forex needed' : 'India-first pricing', 'Calculated'],
    ]
  }, [trip, route, flightData, hotelData])

  const transport = transportFor(route.km)
  const destinationImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'

  const estimatedTotal = useMemo(() => costs.reduce((s, [, , a]) => s + Number(a || 0), 0), [costs])
  const days = Number(trip.days) || 1
  const travelers = Number(trip.travelers) || 1

  const downloadReport = () => {
    const report = {
      trip,
      route,
      flightData,
      hotelData,
      weatherData,
      costs,
      estimatedTotal,
      generatedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-report-${cityName(trip.destination) || 'trip'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const viewReport = () => {
    const report = { trip, route, flightData, hotelData, weatherData, costs, estimatedTotal, generatedAt: new Date().toISOString() }
    try { sessionStorage.setItem('tripReport', JSON.stringify(report)) } catch {}
    // Ensure the router picks up the change — set hash and dispatch event
    try {
      window.location.hash = '#/report'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    } catch (e) {
      // fallback
      window.location.href = '#/report'
    }
  }

  const sharePlan = async () => {
    const text = `${cityName(trip.destination)} trip · Estimated ${format(estimatedTotal)} for ${travelers} person(s)`
    if (navigator.share) {
      try { await navigator.share({ title: 'Trip Report', text, url: window.location.href }) } catch { /* ignore */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(`${text}\n${window.location.href}`) } catch { /* ignore */ }
      alert('Plan copied to clipboard')
    } else {
      alert('Sharing not supported')
    }
  }

  return (
    <>
    <section className="min-h-screen w-full bg-slate-50 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-1xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-block px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-green-400/30 shadow-lg">
            <h1 className="text-3xl font-extrabold flex items-center gap-3 text-emerald-700"><img src={airplane} alt="Airplane Icon" className="h-6 w-6" /> Trip Planner</h1>
            <p className="mt-1 text-sm text-slate-500">Plan your next trip with our smart cost estimator and personalized suggestions.</p>
</div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1fr]">
          <aside>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="grid gap-6">
                <div>
                  <label className="font-bold text-slate-600 block">Origin City</label>
                  <input className="mt-3 w-full rounded-lg bg-slate-50 p-4 text-lg" value={trip.origin} onFocus={() => setActiveInput('origin')} onChange={(e) => handlePlaceInput('origin', e.target.value)} onBlur={() => closeSuggestions('origin')} />
                  {activeInput === 'origin' && suggestions.origin.length > 0 && (
                    <div className="mt-2 rounded-xl bg-white shadow">
                      {suggestions.origin.map((p) => (
                        <button key={p.id} onMouseDown={() => choosePlace('origin', p)} className="block w-full text-left px-4 py-3 hover:bg-teal-50">{p.name}, {p.country}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-600 block">Destination</label>
                  <input className="mt-3 w-full rounded-lg bg-slate-50 p-4 text-lg" value={trip.destination} onFocus={() => setActiveInput('destination')} onChange={(e) => handlePlaceInput('destination', e.target.value)} onBlur={() => closeSuggestions('destination')} />
                  {activeInput === 'destination' && suggestions.destination.length > 0 && (
                    <div className="mt-2 rounded-xl bg-white shadow">
                      {suggestions.destination.map((p) => (
                        <button key={p.id} onMouseDown={() => choosePlace('destination', p)} className="block w-full text-left px-4 py-3 hover:bg-teal-50">{p.name}, {p.country}</button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4 text-slate-700">
                    <div className="text-sm font-extrabold text-emerald-700">SUGGESTED TRANSPORT</div>
                    <div className="mt-2 text-lg font-extrabold text-slate-900">{route.loading ? 'Checking distance...' : `${transport.mode}${route.km ? ` · ${route.km.toLocaleString('en-IN')} km` : ''}`}</div>
                    <div className="mt-1 text-sm text-slate-500">{transport.text}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="font-bold text-slate-600">Days
                    <input type="number" min="1" className="mt-2 w-full rounded-lg bg-slate-50 p-3" value={trip.days} onChange={(e) => setField('days', e.target.value)} />
                  </label>
                  <label className="font-bold text-slate-600">Travelers
                    <input type="number" min="1" className="mt-2 w-full rounded-lg bg-slate-50 p-3" value={trip.travelers} onChange={(e) => setField('travelers', e.target.value)} />
                  </label>
                </div>

                <div>
                  <p className="font-bold text-slate-600">Budget Tier</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-200 p-1">
                    {Object.keys(tierRates).map((t) => (
                      <button key={t} onClick={() => setField('tier', t)} className={`rounded-lg py-2 ${trip.tier === t ? 'bg-black text-white' : ''}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-3"><input type="checkbox" checked={trip.insurance} onChange={(e) => setField('insurance', e.target.checked)} className="h-5 w-5 accent-teal-500" /> Include Travel Insurance</label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={trip.gst} onChange={(e) => setField('gst', e.target.checked)} className="h-5 w-5" /> Apply GST (18%) for India</label>
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="grid grid-cols-2 gap-6">
              {costs.map(([icon, title, amount, note, status], index) => (
                <article key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-emerald-700">{title}</div>
                      <div className="mt-2 text-4xl font-extrabold text-slate-900">{format(amount)}</div>
                      <div className="mt-2 text-1xl text-slate-500">{note}</div>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-700">{status}</div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl shadow-lg">
              <div className="relative h-72 bg-cover bg-center" style={{ backgroundImage: `url(${destinationImage})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm text-teal-300">Current Destination Selection</p>
                  <h2 className="mt-2 text-3xl font-extrabold">{trip.destination || 'Your destination'}</h2>
                  <div className="mt-2 flex items-center gap-4">
                    <p className="text-sm">{route.domestic ? 'Domestic route · no forex needed' : 'India-first pricing'}</p>
                    {weatherData && (
                      <div className="rounded-md bg-black/30 px-3 py-1 text-sm text-teal-200">
                        {weatherData.description} · {Math.round(weatherData.tempC)}°C
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>       
      </div>
    </section>

    <div className="fixed left-1/2 bottom-6 z-50 w-[min(96%,1100px)] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-lg">
      <div className="mx-auto flex items-center justify-between gap-6">
        <div>
          <div className="text-sm text-slate-500">ESTIMATED TOTAL</div>
          <div className="mt-1 flex items-baseline gap-4">
            <div className="text-2xl font-extrabold">{format(estimatedTotal)}</div>
            <div className="text-sm text-slate-500">/ {travelers} person{travelers>1? 's':''}</div>
          </div>
          <div className="mt-1 text-sm text-slate-600">Per day {format(estimatedTotal / days)} · Per person {format(estimatedTotal / travelers)}</div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button onClick={sharePlan} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">Share Plan</button>
          <button onClick={viewReport} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">View Report</button>
        </div>
      </div>
    </div>

    <Footer />
    </>
  )
}

export default Planner
