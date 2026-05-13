import React, { useMemo } from 'react'

const formatCurrency = (value) =>
  `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`

const Report = () => {
  const report = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tripReport') || 'null')
    } catch {
      return null
    }
  }, [])

  if (!report) {
    return (
      <section className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Trip Report</p>
          <h1 className="mt-3 text-3xl font-extrabold">No report generated yet</h1>
          <p className="mt-3 text-slate-600">
            Create a trip plan first, then open the report from the planner.
          </p>
          <a
            href="#/planner"
            className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Open Planner
          </a>
        </div>
      </section>
    )
  }

  const { trip, route, costs = [], estimatedTotal, weatherData } = report

  return (
    <section className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Trip Report</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">
                {trip?.origin} to {trip?.destination}
              </h1>
              <p className="mt-2 text-slate-600">
                {trip?.days} day(s), {trip?.travelers} traveler(s), {trip?.tier} plan
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-5 py-4 text-right">
              <p className="text-sm font-bold text-emerald-700">Estimated Total</p>
              <p className="text-3xl font-extrabold">{formatCurrency(estimatedTotal)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.8fr]">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold">Cost Breakdown</h2>
            <div className="mt-5 divide-y divide-slate-100">
              {costs.map(([icon, label, amount, detail, source]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-bold">{icon} {label}</p>
                    <p className="text-sm text-slate-500">{detail} · {source}</p>
                  </div>
                  <p className="font-extrabold">{formatCurrency(amount)}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-extrabold">Route Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-bold text-slate-500">Distance</dt>
                <dd className="mt-1 text-lg font-extrabold">
                  {route?.km ? `${route.km.toLocaleString('en-IN')} km` : 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Trip Type</dt>
                <dd className="mt-1 text-lg font-extrabold">
                  {route?.domestic ? 'Domestic' : 'International'}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Weather</dt>
                <dd className="mt-1 text-lg font-extrabold">
                  {weatherData?.temperature ? `${weatherData.temperature}°C` : 'Not available'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Report
