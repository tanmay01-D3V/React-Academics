import { useEffect, useMemo, useState } from "react"
import airplane from "../assets/airplane-fill.svg"
import { fetchFlightPriceByCoords } from "../api/flightsApi"
import { fetchHotelPriceByCoords } from "../api/hotelsApi"
import { fetchWeatherByCoords } from "../api/weatherApi"
import { getCoords, fetchCurrencyRate, distanceKm, searchPlaces } from "../api/core"
import Footer from "../components/Footer.jsx"

// ─── Constants ────────────────────────────────────────────────────────────────
const tierRates = { Economy: 0.8, Premium: 1, Luxury: 1.25 }
const cityCosts = { default: { flight: 45000, stay: 7000, food: 2800 } }
const currencyByCountry = {
  AF:'AFN', AL:'ALL', DZ:'DZD', AS:'USD', AD:'EUR', AO:'AOA', AG:'XCD', AR:'ARS',
  AM:'AMD', AU:'AUD', AT:'EUR', AZ:'AZN', BS:'BSD', BH:'BHD', BD:'BDT', BB:'BBD',
  BY:'BYN', BE:'EUR', BZ:'BZD', BJ:'XOF', BM:'BMD', BT:'BTN', BO:'BOB', BA:'BAM',
  BW:'BWP', BR:'BRL', BN:'BND', BG:'BGN', BF:'XOF', BI:'BIF', KH:'KHR', CM:'XAF',
  CA:'CAD', CV:'CVE', CF:'XAF', TD:'XAF', CL:'CLP', CN:'CNY', CO:'COP', KM:'KMF',
  CG:'XAF', CD:'CDF', CR:'CRC', HR:'EUR', CU:'CUP', CY:'EUR', CZ:'CZK', DK:'DKK',
  DJ:'DJF', DM:'XCD', DO:'DOP', EC:'USD', EG:'EGP', SV:'USD', GQ:'XAF', ER:'ERN',
  EE:'EUR', SZ:'SZL', ET:'ETB', FJ:'FJD', FI:'EUR', FR:'EUR', GA:'XAF', GM:'GMD',
  GE:'GEL', DE:'EUR', GH:'GHS', GR:'EUR', GD:'XCD', GT:'GTQ', GN:'GNF', GW:'XOF',
  GY:'GYD', HT:'HTG', HN:'HNL', HK:'HKD', HU:'HUF', IS:'ISK', IN:'INR', ID:'IDR',
  IR:'IRR', IQ:'IQD', IE:'EUR', IL:'ILS', IT:'EUR', JM:'JMD', JP:'JPY', JO:'JOD',
  KZ:'KZT', KE:'KES', KI:'AUD', KP:'KPW', KR:'KRW', KW:'KWD', KG:'KGS', LA:'LAK',
  LV:'EUR', LB:'LBP', LS:'LSL', LR:'LRD', LY:'LYD', LI:'CHF', LT:'EUR', LU:'EUR',
  MO:'MOP', MG:'MGA', MW:'MWK', MY:'MYR', MV:'MVR', ML:'XOF', MT:'EUR', MH:'USD',
  MR:'MRU', MU:'MUR', MX:'MXN', FM:'USD', MD:'MDL', MC:'EUR', MN:'MNT', ME:'EUR',
  MA:'MAD', MZ:'MZN', MM:'MMK', NA:'NAD', NR:'AUD', NP:'NPR', NL:'EUR', NZ:'NZD',
  NI:'NIO', NE:'XOF', NG:'NGN', MK:'MKD', NO:'NOK', OM:'OMR', PK:'PKR', PW:'USD',
  PA:'PAB', PG:'PGK', PY:'PYG', PE:'PEN', PH:'PHP', PL:'PLN', PT:'EUR', QA:'QAR',
  RO:'RON', RU:'RUB', RW:'RWF', KN:'XCD', LC:'XCD', VC:'XCD', WS:'WST', SM:'EUR',
  ST:'STN', SA:'SAR', SN:'XOF', RS:'RSD', SC:'SCR', SL:'SLE', SG:'SGD', SK:'EUR',
  SI:'EUR', SB:'SBD', SO:'SOS', ZA:'ZAR', ES:'EUR', LK:'LKR', SD:'SDG', SR:'SRD',
  SE:'SEK', CH:'CHF', SY:'SYP', TW:'TWD', TJ:'TJS', TZ:'TZS', TH:'THB', TL:'USD',
  TG:'XOF', TO:'TOP', TT:'TTD', TN:'TND', TR:'TRY', TM:'TMT', TV:'AUD', UG:'UGX',
  UA:'UAH', AE:'AED', GB:'GBP', US:'USD', UY:'UYU', UZ:'UZS', VU:'VUV', VA:'EUR',
  VE:'VES', VN:'VND', YE:'YER', ZM:'ZMW', ZW:'ZiG'
}

// ─── Pure helpers (no API calls) ──────────────────────────────────────────────
const fmt        = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`
const cityName   = (v = '') => v.split(',')[0].trim()
const formatRate = (r) => Number(r).toLocaleString('en-IN', { maximumFractionDigits: r < 1 ? 4 : 2 })
const transportFor = (km) => {
  if (!km)     return { mode: 'Checking route',  text: 'Enter both cities to estimate distance.' }
  if (km < 120) return { mode: 'Car / Cab',       text: 'Short route' }
  if (km < 800) return { mode: 'Train / Road',    text: 'Medium distance' }
  return               { mode: 'Flight',           text: 'Long distance' }
}

// ─── Component ────────────────────────────────────────────────────────────────
const Planner = () => {
  const [trip, setTrip] = useState({
    origin: 'New Delhi, India', destination: 'Mumbai, India',
    days: 5, travelers: 1, tier: 'Premium', insurance: true, gst: false,
  })
  const [route,       setRoute]       = useState({ km: null, domestic: false, loading: true, destinationCountryCode: '' })
  const [flightData,  setFlightData]  = useState(null)
  const [hotelData,   setHotelData]   = useState(null)
  const [weatherData, setWeatherData] = useState(null)
  const [currency,    setCurrency]    = useState({ code: 'INR', rate: 1 })
  const [activeInput, setActiveInput] = useState(null)
  const [suggestions, setSuggestions] = useState({ origin: [], destination: [] })

  const setField = (field, value) => setTrip((t) => ({ ...t, [field]: value }))

  // ── Autocomplete suggestions ──────────────────────────────────────────────
  useEffect(() => {
    const query = (trip[activeInput] || '').trim()
    if (!activeInput || query.length < 3) return
    const timer = setTimeout(async () => {
      // searchPlaces returns up to 5 results — defined in core.js
      const results = await searchPlaces(query)
      setSuggestions((s) => ({ ...s, [activeInput]: results }))
    }, 250)
    return () => clearTimeout(timer)
  }, [activeInput, trip])

  const choosePlace = (field, place) => {
    setField(field, `${place.name}, ${place.country}`)
    setActiveInput(null)
    setSuggestions((s) => ({ ...s, [field]: [] }))
  }
  const closeSuggestions = (field) =>
    setTimeout(() => { setActiveInput(null); setSuggestions((s) => ({ ...s, [field]: [] })) }, 120)
  const handlePlaceInput = (field, value) => {
    setField(field, value)
    if ((value || '').trim().length < 3) setSuggestions((s) => ({ ...s, [field]: [] }))
  }

  // ── Main data fetch: geocode → route → flight/hotel/weather/currency ──────
  useEffect(() => {
    let active = true
    setRoute((r) => ({ ...r, loading: true }))

    ;(async () => {
      const [originPlace, destPlace] = await Promise.all([
        getCoords(cityName(trip.origin)),
        getCoords(cityName(trip.destination)),
      ])

      if (!active) return

      const domestic = Boolean(
        originPlace?.country_code && destPlace?.country_code &&
        originPlace.country_code === destPlace.country_code
      )
      const km = originPlace && destPlace ? distanceKm(originPlace, destPlace) : null
      const destCode = destPlace?.country_code || ''

      setRoute({ km, domestic, loading: false, destinationCountryCode: destCode })

      // Currency — fetch in parallel with flight/hotel/weather
      const destCurrency = domestic ? 'INR' : (currencyByCountry[destCode] ?? null)

      const [priceResult, hotelResult, weatherResult, currencyRate] = await Promise.all([
        originPlace && destPlace
          ? fetchFlightPriceByCoords(originPlace, destPlace, trip.travelers).catch(() => null)
          : null,
        originPlace && destPlace
          ? fetchHotelPriceByCoords(originPlace, destPlace, trip.days, Math.ceil(trip.travelers / 2), trip.travelers).catch(() => null)
          : null,
        destPlace
          ? fetchWeatherByCoords(destPlace).catch(() => null)
          : null,
        destCurrency && destCurrency !== 'INR'
          ? fetchCurrencyRate('INR', destCurrency).catch(() => null)
          : Promise.resolve(destCurrency === 'INR' ? 1 : null),
      ])

      if (!active) return
      setFlightData(priceResult)
      setHotelData(hotelResult)
      setWeatherData(weatherResult)
      setCurrency({ code: destCurrency, rate: currencyRate })
    })()

    return () => { active = false }
  }, [trip.origin, trip.destination, trip.travelers, trip.days])

  // ── Derived values ────────────────────────────────────────────────────────
  const conversionText = !currency.code
    ? 'Currency unavailable'
    : currency.code === 'INR'
    ? '1 INR = INR 1'
    : currency.rate
    ? `1 INR = ${currency.code} ${formatRate(currency.rate)}`
    : `Checking ${currency.code} rate...`

  const costs = useMemo(() => {
    const days     = Number(trip.days)     || 1
    const travelers = Number(trip.travelers) || 1
    const tier     = tierRates[trip.tier]  || 1
    const city     = cityCosts[cityName(trip.destination).toLowerCase()] ?? cityCosts.default
    const isLocal  = route.domestic && route.km && route.km < 120
    const rooms    = Math.ceil(travelers / 2)

    const flight = isLocal
      ? Math.max((route.km || 0) * 30 * 2 * tier, 350)
      : flightData?.priceInINR
        ? flightData.priceInINR * travelers * tier
        : city.flight * travelers * tier

    const perNight = hotelData?.pricePerNightInINR ?? city.stay ?? 0
    const stay     = perNight * days * rooms * tier
    const food     = (isLocal ? 650 : city.food || 0) * days * travelers * tier
    const buffer   = (flight + stay + food) * (route.domestic ? 0.03 : 0.08)
    const insurance = trip.insurance ? 2200 * travelers : 0
    const gst       = trip.gst ? (flight + stay) * 0.18 : 0

    return [
      ['✈', isLocal ? 'Local Transport'  : 'Flights & Local',      flight,                 isLocal ? `${route.km} km cab estimate`         : `${trip.tier} ${flightData?.source ?? 'default'} flight`, isLocal ? 'Route Based' : (flightData?.source ?? 'Default')],
      ['▣', 'Accommodation',                                        stay,                   `${days} night(s), ${rooms} room(s)`,                                             'Editable'],
      ['🍴', 'Dining & Food',                                       food,                   isLocal ? `Local meals for ${days} day(s)`       : `${trip.tier} dining plan`,     'Detailed'],
      ['$',  route.domestic ? 'Local Buffers' : 'Forex & Buffers', buffer + insurance + gst, route.domestic ? 'Domestic trip · no forex needed' : conversionText,             'Calculated'],
    ]
  }, [trip, route, flightData, hotelData, conversionText])

  const estimatedTotal = useMemo(() => costs.reduce((s, [,, a]) => s + Number(a || 0), 0), [costs])
  const days      = Number(trip.days)      || 1
  const travelers = Number(trip.travelers) || 1
  const transport = transportFor(route.km)
  const destinationImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'

  // ── Actions ───────────────────────────────────────────────────────────────
  const viewReport = () => {
    try { sessionStorage.setItem('tripReport', JSON.stringify({ trip, route, flightData, hotelData, weatherData, costs, estimatedTotal, generatedAt: new Date().toISOString() })) } catch { /* ignore */ }
    try { window.location.hash = '#/report'; window.dispatchEvent(new HashChangeEvent('hashchange')) }
    catch { window.location.href = '#/report' }
  }

  const sharePlan = async () => {
    const text = `${cityName(trip.destination)} trip · Estimated ${fmt(estimatedTotal)} for ${travelers} person(s)`
    if (navigator.share) {
      try { await navigator.share({ title: 'Trip Report', text, url: window.location.href }) } catch { /* ignore */ }
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(`${text}\n${window.location.href}`) } catch { /* ignore */ }
      alert('Plan copied to clipboard')
    } else {
      alert('Sharing not supported')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const SuggestionList = ({ field }) =>
    activeInput === field && suggestions[field].length > 0 ? (
      <div className="mt-2 rounded-xl bg-white shadow">
        {suggestions[field].map((p) => (
          <button key={p.id} onMouseDown={() => choosePlace(field, p)}
            className="block w-full text-left px-4 py-3 hover:bg-teal-50">
            {p.name}, {p.country}
          </button>
        ))}
      </div>
    ) : null

  return (
    <>
      <section className="min-h-screen w-full bg-slate-50 px-6 py-8 text-slate-900">
        <div className="mx-auto max-w-1xl">

          <div className="mb-8">
            <div className="inline-block px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-green-400/30 shadow-lg">
              <h1 className="text-3xl font-extrabold flex items-center gap-3 text-emerald-700">
                <img src={airplane} alt="Airplane Icon" className="h-6 w-6" /> Trip Planner
              </h1>
              <p className="mt-1 text-sm text-slate-500">Plan your next trip with our smart cost estimator and personalized suggestions.</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1fr]">

            {/* ── Left panel: inputs ── */}
            <aside>
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="grid gap-6">

                  {/* Origin */}
                  <div>
                    <label className="font-bold text-slate-600 block">Origin City</label>
                    <input className="mt-3 w-full rounded-lg bg-slate-50 p-4 text-lg"
                      value={trip.origin}
                      onFocus={() => setActiveInput('origin')}
                      onChange={(e) => handlePlaceInput('origin', e.target.value)}
                      onBlur={() => closeSuggestions('origin')} />
                    <SuggestionList field="origin" />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="font-bold text-slate-600 block">Destination</label>
                    <input className="mt-3 w-full rounded-lg bg-slate-50 p-4 text-lg"
                      value={trip.destination}
                      onFocus={() => setActiveInput('destination')}
                      onChange={(e) => handlePlaceInput('destination', e.target.value)}
                      onBlur={() => closeSuggestions('destination')} />
                    <SuggestionList field="destination" />

                    <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4 text-slate-700">
                      <div className="text-sm font-extrabold text-emerald-700">SUGGESTED TRANSPORT</div>
                      <div className="mt-2 text-lg font-extrabold text-slate-900">
                        {route.loading ? 'Checking distance...' : `${transport.mode}${route.km ? ` · ${route.km.toLocaleString('en-IN')} km` : ''}`}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">{transport.text}</div>
                    </div>
                  </div>

                  {/* Days & Travelers */}
                  <div className="grid grid-cols-2 gap-4">
                    <label className="font-bold text-slate-600">Days
                      <input type="number" min="1" className="mt-2 w-full rounded-lg bg-slate-50 p-3"
                        value={trip.days} onChange={(e) => setField('days', e.target.value)} />
                    </label>
                    <label className="font-bold text-slate-600">Travelers
                      <input type="number" min="1" className="mt-2 w-full rounded-lg bg-slate-50 p-3"
                        value={trip.travelers} onChange={(e) => setField('travelers', e.target.value)} />
                    </label>
                  </div>

                  {/* Tier */}
                  <div>
                    <p className="font-bold text-slate-600">Budget Tier</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-200 p-1">
                      {Object.keys(tierRates).map((t) => (
                        <button key={t} onClick={() => setField('tier', t)}
                          className={`rounded-lg py-2 ${trip.tier === t ? 'bg-black text-white' : ''}`}>{t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={trip.insurance} className="h-5 w-5 accent-teal-500"
                        onChange={(e) => setField('insurance', e.target.checked)} />
                      Include Travel Insurance
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={trip.gst} className="h-5 w-5"
                        onChange={(e) => setField('gst', e.target.checked)} />
                      Apply GST (18%) for India
                    </label>
                  </div>

                </div>
              </div>
            </aside>

            {/* ── Right panel: cost cards + image ── */}
            <div>
              <div className="grid grid-cols-2 gap-6">
                {costs.map(([, title, amount, note, status]) => (
                  <article key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl font-extrabold text-emerald-700">{title}</div>
                        <div className="mt-2 text-4xl font-extrabold text-slate-900">{fmt(amount)}</div>
                        <div className="mt-2 text-sm text-slate-500">{note}</div>
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
                      <p className="text-sm">{conversionText}</p>
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

      {/* ── Sticky footer bar ── */}
      <div className="fixed left-1/2 bottom-6 z-50 w-[min(96%,1100px)] -translate-x-1/2 rounded-2xl bg-white p-4 shadow-lg">
        <div className="mx-auto flex items-center justify-between gap-6">
          <div>
            <div className="text-sm text-slate-500">ESTIMATED TOTAL</div>
            <div className="mt-1 flex items-baseline gap-4">
              <div className="text-2xl font-extrabold">{fmt(estimatedTotal)}</div>
              <div className="text-sm text-slate-500">/ {travelers} person{travelers > 1 ? 's' : ''}</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Per day {fmt(estimatedTotal / days)} · Per person {fmt(estimatedTotal / travelers)}
            </div>
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
