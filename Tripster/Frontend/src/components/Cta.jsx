import React from 'react' 
import car from '../assets/car-front.svg';
import airplane from '../assets/airplane-fill.svg';
import world from '../assets/world-2-fill.svg';
import emt from '../assets/partners/emt-logo-us.svg';
import mmt from '../assets/partners/mmt_dt_top_icon.avif';
import goibibo from '../assets/partners/goibibo.avif';
import cleartrip from '../assets/partners/cleartrip.svg';

const trips = [
  [car, 'Road Trip', "Calculate fuel, tolls, and pitstop expenses across India's national highways.", 'From ₹4,500'],
  [airplane, 'Domestic Flight', 'Budgeting for flights, airport transfers, and baggage fees with GST support.', 'From ₹8,200'],
  [world, 'International', 'Currency conversion, visa fees, and global travel insurance estimates.', 'From ₹1,25,000'],
]

const partners = [
  [mmt, 'MakeMyTrip'],
  [emt, 'EaseMyTrip'],
  [cleartrip, 'Cleartrip'],
  [goibibo, 'Goibibo'],
]

const Cta = () => {
  return (
    <section className="bg-[#FCFCF7] text-slate-900">
      <div className="mx-auto ">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 pb-8 text-slate-500 py-7 bg-[#0F1818] px-5 sm:px-8">
          <h2 className="text-3xl font-extrabold text-white">10,000+ trips calculated</h2>
          <div className="flex flex-wrap items-center gap-6">
            {partners.map(([logo, name]) => <img key={name} className="h-10 max-w-40 object-contain" src={logo} alt={name} />)}
          </div>
        </div>

        <div className="py-20 text-center">
          <h2 className="text-4xl font-extrabold">Select your journey type</h2>
          <p className="mt-3 text-xl text-slate-500">Tailored algorithms for every way you explore the world.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mx-auto max-w-1xl px-5 sm:px-8">
          {trips.map(([icon, title, text, price]) => (
            <article key={title} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <div className="mb-8 grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
                <img className="h-8 w-8" src={icon} alt="" />
              </div>
              <h3 className="text-3xl font-extrabold">{title}</h3>
              <p className="mt-5 text-xl leading-8 text-slate-500">{text}</p>
              <p className="mt-8 text-2xl font-extrabold text-emerald-700">{price}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-8 text-amber-900 mb-16 mx-7">
          <h3 className="text-3xl font-extrabold">Pro Tip: Track GST Separately</h3>
          <p className="mt-3 text-xl">Indian business travelers can save up to 18% by accurately tracking GST components in their flight and hotel bookings.</p>
        </div>
      </div>
    </section>
  )
}

export default Cta
