import React from 'react'

const columns = [
  ['Product', 'Trip calculator', 'GST tracker', 'Currency forecast', 'Family split'],
  ['Company', 'About TripSter', 'Careers', 'Travel partners', 'Press kit'],
  ['Support', 'Help center', 'Contact us', 'Privacy policy', 'Terms of service'],
]

const Footer = () => (
  <footer className="bg-[#151b1b] px-5 py-16 text-[#d7dddd] sm:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr_1.1fr]">
        <div>
          <h2 className="text-3xl font-extrabold text-[#62f4d7]">TripSter</h2>
          <p className="mt-5 max-w-sm text-lg leading-8 text-[#b8c1c1]">
            Empowering Indian travelers with clearer budgets, smarter GST tracking, and confident cost planning before every booking.
          </p>
          <div className="mt-7 flex gap-3">
            {['in', 'x', '↗'].map((item) => (
              <a key={item} href="#" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-sm font-bold hover:border-[#62f4d7] hover:text-[#62f4d7]">
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map(([title, ...links]) => (
            <div key={title}>
              <h3 className="font-bold text-white">{title}</h3>
              <div className="mt-5 grid gap-3">
                {links.map((link) => <a key={link} href="#" className="text-[#a7b0b0] hover:text-[#62f4d7]">{link}</a>)}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-white">Get travel cost updates</h3>
          <p className="mt-5 text-[#a7b0b0]">Monthly fare signals, GST tips, and currency alerts for better planning.</p>
          <div className="mt-5 flex overflow-hidden rounded-full border border-white/15 bg-white/5">
            <input className="min-w-0 flex-1 bg-transparent px-5 py-3 outline-none placeholder:text-[#7f8888]" placeholder="Email address" />
            <button className="bg-[#62f4d7] px-5 font-bold text-[#10201f]">Join</button>
          </div>
          <p className="mt-5 text-sm text-[#8d9696]">hello@tripster.in · Mumbai, India</p>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 text-[#8d9696] md:flex-row md:items-center md:justify-between">
        <p>© 2026 TripSter India. All rights reserved.</p>
        <div className="flex flex-wrap gap-6">
          {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => <a key={link} href="#" className="hover:text-[#62f4d7]">{link}</a>)}
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
