import React from "react";
import pic from "../assets/heroimage.jpg";

const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-[#101818] text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#00684f_0%,#17302c_42%,#101818_78%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(16,24,24,0)_0%,rgba(16,24,24,0.94)_88%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-89px)] max-w-8xl flex-col items-center px-5 pb-20 pt-16 text-center sm:px-8 lg:pt-20">
        <div className="inline-flex items-center gap-3 rounded-full border border-teal-300/10 bg-teal-400/5 px-5 py-3 text-sm font-bold tracking-wide text-teal-300 shadow-[inset_0_0_24px_rgba(20,184,166,0.08)] sm:text-base">
          Trusted by 10,000+ Indian Travelers
        </div>

        <h1 className="mt-10 max-w-5xl text-7xl font-extrabold leading-[1.08] tracking-normal text-white">
          Know your trip cost before you book
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-white/68 sm:text-2xl sm:leading-10">
          The precision of fintech meets the soul of travel. Calculate GST,
          split costs with family, and forecast expenses across 180+ currencies
          instantly.
        </p>

        <div className="mt-12 flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="#/planner"
            className="inline-flex min-h-16 items-center justify-center rounded-xl bg-[#12c8ae] px-10 text-xl font-extrabold text-[#073431] shadow-lg shadow-teal-950/30 transition hover:bg-[#18d8bd] focus:outline-none focus:ring-4 focus:ring-teal-300/30 sm:text-2xl"
          >
            Start Calculating
          </a>
          <a
            href="#/history"
            className="inline-flex min-h-16 items-center justify-center rounded-xl border border-white/14 bg-white/5 px-10 text-xl font-extrabold text-white shadow-lg shadow-black/20 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/15 sm:text-2xl"
          >
            Watch Demo
          </a>
        </div>

        <div className="relative mt-20 w-full max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-[#1b2423] shadow-2xl shadow-black/35">
          <img
            className="h-[270px] w-full object-cover opacity-70 sm:h-[360px] lg:h-[420px]"
            src={pic}
            alt="Paris skyline with the Eiffel Tower at sunset."
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,24,24,0.42),rgba(16,24,24,0.08)_45%,rgba(16,24,24,0.22))]" />
          <div className="absolute bottom-6 left-6 right-6 max-w-sm rounded-xl border border-white/20 bg-white/10 p-5 text-left shadow-xl backdrop-blur-md sm:bottom-8 sm:left-8 sm:p-7">
            <p className="text-sm font-extrabold uppercase tracking-wide text-teal-300">
              Live Estimate
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Mumbai to Paris
            </h2>
            <p className="mt-3 text-lg text-white/70 sm:text-xl">
              Estimated Total: ₹2,45,000
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
