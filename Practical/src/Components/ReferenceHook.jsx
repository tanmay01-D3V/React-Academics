import { useEffect, useRef, useState } from "react";

const ReferenceHook = () => {
  const inputRef = useRef(null);
  const previousName = useRef("");
  const hiddenClickCount = useRef(0);
  const timerRef = useRef(null);

  const [name, setName] = useState("");
  const [previousNameText, setPreviousNameText] = useState("");
  const [clickCountSnapshot, setClickCountSnapshot] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const handleNameChange = (event) => {
    previousName.current = name;
    setPreviousNameText(previousName.current);
    setName(event.target.value);
  };

  const focusInput = () => {
    inputRef.current.focus();
  };

  const clearInput = () => {
    setName("");
    inputRef.current.focus();
  };

  const countHiddenClick = () => {
    hiddenClickCount.current += 1;
  };

  const showHiddenClicks = () => {
    setClickCountSnapshot(hiddenClickCount.current);
  };

  const startTimer = () => {
    if (timerRef.current) return;

    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setSeconds(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            React hook mini project
          </p>
          <h1 className="mt-2 text-3xl font-bold">useRef Playground</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            This page shows three common uses of useRef: focusing an element,
            keeping values between renders, and storing a timer id without
            causing extra renders.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">1. Control a DOM element</h2>
            <p className="mt-2 text-sm text-slate-400">
              The input is connected to a ref, so the button can focus it
              directly.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <input
                ref={inputRef}
                value={name}
                onChange={handleNameChange}
                type="text"
                placeholder="Type your name"
                className="rounded-md border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={focusInput}
                  className="rounded-md bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Focus input
                </button>
                <button
                  onClick={clearInput}
                  className="rounded-md border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold">2. Remember values</h2>
            <p className="mt-2 text-sm text-slate-400">
              Refs can store data between renders without triggering a new
              render by themselves.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-md bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Current name</p>
                <p className="mt-1 text-lg font-semibold">
                  {name || "Nothing typed yet"}
                </p>
              </div>
              <div className="rounded-md bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Previous name</p>
                <p className="mt-1 text-lg font-semibold">
                  {previousNameText || "No previous value yet"}
                </p>
              </div>
              <div className="rounded-md bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Hidden ref clicks</p>
                <p className="mt-1 text-lg font-semibold">
                  {clickCountSnapshot}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={countHiddenClick}
                  className="rounded-md bg-violet-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-violet-300"
                >
                  Add hidden click
                </button>
                <button
                  onClick={showHiddenClicks}
                  className="rounded-md border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-500"
                >
                  Show count
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">3. Store a timer id</h2>
          <p className="mt-2 text-sm text-slate-400">
            The interval id lives in a ref, so React can keep track of it
            without putting that id in state.
          </p>

          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Timer</p>
              <p className="text-5xl font-bold tabular-nums">{seconds}s</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={startTimer}
                disabled={isRunning}
                className="rounded-md bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={pauseTimer}
                disabled={!isRunning}
                className="rounded-md bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pause
              </button>
              <button
                onClick={resetTimer}
                className="rounded-md border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-slate-500"
              >
                Reset
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReferenceHook;