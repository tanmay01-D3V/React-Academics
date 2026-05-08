import { useEffect, useMemo, useState } from 'react'

const format = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`

const COLORS = ['#16a34a', '#f59e0b', '#06b6d4', '#7c3aed', '#ef4444']

function DonutChart({ breakdown = [], total = 0, size = 160, stroke = 28 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  const slices = breakdown.map((b, i) => {
    const value = Number(b.amount || 0)
    const percent = total ? (value / total) * 100 : 0
    const dash = (percent / 100) * circumference
    const slice = {
      color: COLORS[i % COLORS.length],
      dash,
      offset,
      label: b.title,
      percent,
      value,
    }
    offset += dash
    return slice
  })

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {slices.map((s, idx) => (
            <circle
              key={idx}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${circumference}`}
              strokeDashoffset={circumference - s.offset}
              strokeLinecap="round"
              transform="rotate(-90)"
            />
          ))}
          <text x="0" y="6" textAnchor="middle" className="font-semibold" style={{ fontSize: 14 }}>{Math.round(total).toLocaleString('en-IN')}</text>
        </g>
      </svg>

      <div className="grid gap-2">
        {slices.slice(0, 5).map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <span style={{ background: s.color }} className="inline-block h-3 w-3 rounded-full" />
            <div className="text-sm text-slate-700">{s.label}</div>
            <div className="ml-3 text-sm font-semibold text-slate-800">{Math.round(s.percent)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Report = () => {
  const [report, setReport] = useState(null)

  useEffect(() => {
    const r = sessionStorage.getItem('tripReport')
    if (r) setReport(JSON.parse(r))
  }, [])

  const breakdown = useMemo(() => {
    if (!report) return []
    // report.costs is array of [icon, title, amount, note, status]
    return report.costs.map(([icon, title, amount, note]) => ({ title, amount: Number(amount || 0), note }))
  }, [report])

  const total = useMemo(() => (breakdown.length ? breakdown.reduce((s, b) => s + b.amount, 0) : 0), [breakdown])

  if (!report) return (
    <section className="min-h-screen p-12">
      <div className="mx-auto max-w-4xl text-center py-40">
        <h2 className="text-2xl font-bold">No report found</h2>
        <p className="mt-3 text-slate-600">Create a plan in Planner and click "View Report" to see a detailed trip report.</p>
      </div>
    </section>
  )

  return (
    <section className="min-h-screen bg-[#f6fbfa] p-10">
      <div className="mx-auto max-w-1xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">{report.trip && report.trip.title ? report.trip.title : `Trip Summary`}</h1>
            <p className="mt-2 text-sm text-slate-600">{report.trip.days} Days · {report.trip.origin} → {report.trip.destination}</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-md border border-slate-200 bg-white px-4 py-2">Download PDF Report</button>
            <button className="rounded-md bg-emerald-600 px-4 py-2 text-white">Start New Trip</button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-6">
          <div className="col-span-5 rounded-2xl bg-white p-6 shadow">
            <h3 className="font-bold text-slate-700">Expense Distribution</h3>
              <div className="mt-6 flex items-center gap-6">
                <DonutChart breakdown={breakdown} total={total} />
                <div>
                  <div className="text-2xl font-extrabold">{format(total)}</div>
                  <div className="mt-2 text-sm text-slate-500">Total Spent</div>
                </div>
              </div>
            <div className="mt-6 text-sm text-slate-600">Pro tip: Review itemized breakdown to find quick savings.</div>
          </div>

          <div className="col-span-7 rounded-2xl bg-white p-6 shadow">
            <h3 className="font-bold text-slate-700">Itemized Breakdown</h3>
            <div className="mt-6 grid gap-4">
              {breakdown.map((b) => (
                <div key={b.title} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-sm text-slate-500">{b.note}</div>
                  </div>
                  <div className="font-bold">{format(b.amount)}</div>
                </div>
              ))}

              <div className="mt-4 flex justify-end">
                <div className="w-64 rounded-xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Subtotal</div>
                  <div className="mt-2 text-xl font-bold">{format(total)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="font-bold text-slate-700">Journey Visuals</h4>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(https://picsum.photos/800/400?random=${i})` }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Report
