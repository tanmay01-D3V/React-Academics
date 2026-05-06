import { useState, useCallback, useRef, memo, useEffect } from "react";

// ─── Shared primitives ────────────────────────────────────────────────────────
function useRenderCount() {
  const c = useRef(0);
  c.current += 1;
  return c.current;
}

function RenderCount({ n }) {
  const hot = n > 5;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border
      ${hot ? "bg-orange-900/60 border-orange-700/50 text-orange-300" : "bg-emerald-900/60 border-emerald-700/50 text-emerald-300"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse inline-block" />
      {n} renders
    </span>
  );
}

function Badge({ children, color = "violet" }) {
  const map = {
    violet: "bg-violet-900/60 border-violet-700/50 text-violet-300",
    sky:    "bg-sky-900/60 border-sky-700/50 text-sky-300",
    orange: "bg-orange-900/60 border-orange-700/50 text-orange-300",
    green:  "bg-emerald-900/60 border-emerald-700/50 text-emerald-300",
    rose:   "bg-rose-900/60 border-rose-700/50 text-rose-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${map[color]}`}>
      {children}
    </span>
  );
}

function Code({ children }) {
  return (
    <pre className="bg-[#0d0d1a] border border-slate-700/50 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre">
      {children}
    </pre>
  );
}

function SectionTitle({ emoji, title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function Insight({ children }) {
  return (
    <div className="flex gap-2 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/30 text-xs text-cyan-200/80 leading-relaxed">
      <span className="text-cyan-400 shrink-0">💡</span>
      {children}
    </div>
  );
}

// ─── LAB 1 — The core problem: function identity ──────────────────────────────
// A button that logs how many times it actually rendered
const FancyButton = memo(function FancyButton({ onClick, label, color }) {
  const renders = useRenderCount();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border font-mono text-sm transition-all
        ${color === "green"
          ? "border-emerald-700/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/60"
          : "border-orange-700/50 bg-orange-950/30 text-orange-300 hover:bg-orange-950/60"}`}
    >
      <span>{label}</span>
      <RenderCount n={renders} />
    </button>
  );
});

function Lab1() {
  const renders = useRenderCount();
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const callLog = useRef([]);
  const [, tick] = useState(0);

  // ✅ Stable reference — created once, never recreated
  const handleWithCallback = useCallback(() => {
    callLog.current.unshift({ label: "✅ with useCallback", time: Date.now() });
    if (callLog.current.length > 6) callLog.current.pop();
    tick(n => n + 1);
  }, []); // no deps → same function forever

  // ❌ New function every render — always a new reference
  const handleWithout = () => {
    callLog.current.unshift({ label: "❌ without useCallback", time: Date.now() });
    if (callLog.current.length > 6) callLog.current.pop();
    tick(n => n + 1);
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="🆔"
        title="Function identity & React.memo"
        subtitle="Every render creates a new function reference. useCallback preserves the same reference — so React.memo actually works."
      />

      <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-800/40 border border-slate-700/40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Type anything (re-renders parent):</label>
          <input
            type="text" value={text} onChange={e => setText(e.target.value)}
            placeholder="type here…"
            className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 w-36"
          />
        </div>
        <button onClick={() => setCount(c => c + 1)}
          className="px-3 py-1 text-xs font-mono rounded border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors">
          counter → {count}
        </button>
        <div className="ml-auto"><RenderCount n={renders} /></div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-slate-500 font-mono">Click a button, then interact above — watch the child render counts:</p>
        <FancyButton onClick={handleWithCallback} label="✅ useCallback(() => ..., [])" color="green" />
        <FancyButton onClick={handleWithout}      label="❌ const handler = () => ..."  color="orange" />
      </div>

      {callLog.current.length > 0 && (
        <div className="rounded-lg border border-slate-700/40 divide-y divide-slate-800/60 overflow-hidden">
          {callLog.current.map((e, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono text-slate-400 hover:bg-slate-800/30">
              <span className={e.label.startsWith("✅") ? "text-emerald-400" : "text-orange-400"}>{e.label}</span>
              <span className="ml-auto text-slate-600">{new Date(e.time).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <Code>{`// ✅ useCallback — same function reference every render
const handler = useCallback(() => {
  doSomething();
}, []); // deps: [] = never recreate

// ❌ Without — new reference on every render
const handler = () => { doSomething(); };

// React.memo only helps when props are stable.
// If onClick is a new fn every render,
// React.memo on the child is useless.`}</Code>

      <Insight>
        Type fast in the input — the parent re-renders every keystroke.
        The <strong>green button</strong>'s render count stays frozen (stable ref → React.memo bails out).
        The <strong>orange button</strong> re-renders every time (new fn ref → memo can't help).
      </Insight>
    </div>
  );
}

// ─── LAB 2 — useCallback with deps ───────────────────────────────────────────
const SearchBox = memo(function SearchBox({ onSearch, label }) {
  const renders = useRenderCount();
  const [val, setVal] = useState("");
  return (
    <div className={`rounded-lg p-3 border space-y-2 ${label.startsWith("✅") ? "border-emerald-700/40 bg-emerald-950/20" : "border-orange-700/40 bg-orange-950/20"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300 font-sans">{label}</span>
        <RenderCount n={renders} />
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="search term…"
          className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 flex-1" />
        <button onClick={() => onSearch(val)}
          className="px-3 py-1 text-xs rounded border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors font-mono">
          search
        </button>
      </div>
    </div>
  );
});

function Lab2() {
  const renders = useRenderCount();
  const [prefix, setPrefix] = useState("EN");
  const [unrelated, setUnrelated] = useState(0);
  const results = useRef([]);
  const [, tick] = useState(0);

  // ✅ Recreated only when `prefix` changes
  const searchWithDeps = useCallback((term) => {
    const found = `[${prefix}] results for "${term}"`;
    results.current.unshift({ label: "✅", text: found, time: Date.now() });
    if (results.current.length > 5) results.current.pop();
    tick(n => n + 1);
  }, [prefix]); // ← correct dep

  // ❌ Stale closure — prefix is captured at creation and never updates
  const searchStale = useCallback((term) => {
    const found = `[${prefix}] results for "${term}"`; // BUG: always uses initial prefix
    results.current.unshift({ label: "❌ stale", text: found, time: Date.now() });
    if (results.current.length > 5) results.current.pop();
    tick(n => n + 1);
  }, []); // ← missing dep! stale closure bug

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="📦"
        title="Deps array & the stale closure trap"
        subtitle="useCallback captures variables at creation. Missing a dep = stale closure bug. The right rule: include every value the function reads."
      />

      <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Prefix (language):</label>
          <select value={prefix} onChange={e => setPrefix(e.target.value)}
            className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1">
            {["EN","FR","DE","JP","ES"].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Unrelated: {unrelated}</label>
          <input type="range" min={0} max={100} value={unrelated}
            onChange={e => setUnrelated(+e.target.value)} className="w-24 accent-cyan-500" />
        </div>
        <div className="ml-auto"><RenderCount n={renders} /></div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] text-slate-500 font-mono">Change Prefix, then search in both boxes:</p>
        <SearchBox onSearch={searchWithDeps} label="✅ useCallback(fn, [prefix]) — correct deps" />
        <SearchBox onSearch={searchStale}    label="❌ useCallback(fn, [])  — missing dep (stale!)" />
      </div>

      {results.current.length > 0 && (
        <div className="rounded-lg border border-slate-700/40 divide-y divide-slate-800/60 overflow-hidden">
          <div className="px-3 py-1.5 bg-slate-800/40 text-[10px] font-mono text-slate-500">search log</div>
          {results.current.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono">
              <span className={r.label === "✅" ? "text-emerald-400" : "text-orange-400"}>{r.label}</span>
              <span className="text-slate-300">{r.text}</span>
              <span className="ml-auto text-slate-600">{new Date(r.time).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <Code>{`// ✅ Correct — prefix in deps, always fresh
const search = useCallback((term) => {
  fetch(\`/api?lang=\${prefix}&q=\${term}\`);
}, [prefix]); // recreated when prefix changes

// ❌ Stale closure — prefix frozen at "EN" forever
const search = useCallback((term) => {
  fetch(\`/api?lang=\${prefix}&q=\${term}\`); // BUG!
}, []); // missing dep → prefix never updates inside`}</Code>

      <Insight>
        Change the <strong>Prefix</strong> dropdown to "FR", then search in both boxes.
        The ✅ box sends the correct prefix. The ❌ box always sends the <em>initial</em> prefix — classic stale closure bug from a missing dep.
      </Insight>
    </div>
  );
}

// ─── LAB 3 — useCallback + useEffect ─────────────────────────────────────────
function Lab3() {
  const [userId, setUserId] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [intervalMs, setIntervalMs] = useState(2000);
  const [log, setLog] = useState([]);
  const fetchCount = useRef(0);

  const addLog = (msg, type = "fetch") => {
    setLog(prev => [{ msg, type, time: Date.now() }, ...prev].slice(0, 8));
  };

  // ✅ Stable when userId doesn't change — safe to put in useEffect deps
  const fetchUser = useCallback(() => {
    fetchCount.current += 1;
    addLog(`Fetched user #${userId}  (call #${fetchCount.current})`, "fetch");
  }, [userId]);

  // useEffect depends on fetchUser — safe because fetchUser is stable
  useEffect(() => {
    fetchUser(); // fetch on mount / when userId changes
  }, [fetchUser]);

  // Auto-refresh using the stable callback
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchUser, intervalMs);
    addLog(`Auto-refresh started (every ${intervalMs}ms)`, "info");
    return () => {
      clearInterval(id);
      addLog("Auto-refresh stopped", "warn");
    };
  }, [autoRefresh, intervalMs, fetchUser]); // all stable, no infinite loop

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="🔄"
        title="useCallback + useEffect"
        subtitle="Without useCallback, a function in useEffect deps would cause an infinite re-fetch loop. Stable reference = safe dep."
      />

      <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">User ID:</label>
          <div className="flex gap-1">
            {[1,2,3,4].map(id => (
              <button key={id} onClick={() => setUserId(id)}
                className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors
                  ${userId === id ? "border-cyan-500 bg-cyan-900/40 text-cyan-300" : "border-slate-600 text-slate-400 hover:border-slate-400"}`}>
                #{id}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)}
            className="accent-cyan-500" />
          Auto-refresh
        </label>
        {autoRefresh && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Every {intervalMs}ms</label>
            <input type="range" min={500} max={4000} step={500} value={intervalMs}
              onChange={e => setIntervalMs(+e.target.value)} className="w-24 accent-cyan-500" />
          </div>
        )}
        <div className="ml-auto">
          <Badge color="sky">fetched: {fetchCount.current}×</Badge>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/40 overflow-hidden">
        <div className="px-3 py-1.5 bg-slate-800/40 text-[10px] font-mono text-slate-500">fetch log</div>
        {log.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-4 font-mono">waiting…</p>
        )}
        {log.map((e, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono border-t border-slate-800/60
            ${e.type === "fetch" ? "text-sky-300" : e.type === "info" ? "text-emerald-300" : "text-amber-300"}`}>
            <span>{e.type === "fetch" ? "⬇" : e.type === "info" ? "▶" : "■"}</span>
            <span>{e.msg}</span>
            <span className="ml-auto text-slate-600">{new Date(e.time).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <Code>{`// ✅ fetchUser is stable when userId doesn't change
const fetchUser = useCallback(() => {
  fetch(\`/api/users/\${userId}\`);
}, [userId]);

// Safe to depend on in useEffect:
useEffect(() => {
  fetchUser(); // runs once, or when userId changes
}, [fetchUser]);

// ❌ Without useCallback:
// const fetchUser = () => fetch(...); // new ref every render
// useEffect(() => { fetchUser(); }, [fetchUser]);
//   → fetchUser changes → effect re-runs → re-render
//   → fetchUser changes → effect re-runs → 💥 infinite loop`}</Code>

      <Insight>
        Change <strong>User ID</strong> — fetchUser gets a new reference (userId changed) → useEffect re-runs once.
        Enable <strong>Auto-refresh</strong> — the interval uses the same stable fetchUser reference safely.
        Without useCallback, putting fetchUser in useEffect deps would cause an infinite fetch loop.
      </Insight>
    </div>
  );
}

// ─── LAB 4 — Event handlers in lists ─────────────────────────────────────────
const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  const renders = useRenderCount();
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-700/40 hover:bg-slate-800/30 transition-colors">
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)}
        className="accent-cyan-500 w-3.5 h-3.5 cursor-pointer" />
      <span className={`flex-1 text-sm font-sans ${todo.done ? "line-through text-slate-500" : "text-slate-200"}`}>
        {todo.text}
      </span>
      <RenderCount n={renders} />
      <button onClick={() => onDelete(todo.id)}
        className="text-slate-500 hover:text-rose-400 transition-colors text-xs font-mono px-1">✕</button>
    </div>
  );
});

function Lab4() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Learn useCallback", done: false },
    { id: 2, text: "Build something with React", done: false },
    { id: 3, text: "Stop prop-drilling everything", done: true },
    { id: 4, text: "Read the React docs", done: false },
  ]);
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState(0); // unrelated

  // ✅ Stable — doesn't change when theme or unrelated state changes
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []); // uses functional updater → no deps needed!

  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  }, [input]); // input is a dep — needed to read the value

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="📋"
        title="Event handlers in lists"
        subtitle="Handlers passed to list items should be stable. Without useCallback, every parent re-render causes all memo'd children to re-render."
      />

      <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <div className="flex gap-2 flex-1">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="New todo… (press Enter)"
            className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 flex-1" />
          <button onClick={handleAdd}
            className="px-3 py-1 text-xs font-mono rounded border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors">
            add
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Unrelated: {theme}</label>
          <input type="range" min={0} max={100} value={theme}
            onChange={e => setTheme(+e.target.value)} className="w-24 accent-cyan-500" />
        </div>
      </div>

      <div className="space-y-1.5">
        {todos.map(t => (
          <TodoItem key={t.id} todo={t} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
      </div>

      <Code>{`// ✅ Stable handlers — use functional updater (no state dep)
const handleToggle = useCallback((id) => {
  setTodos(prev =>        // functional updater
    prev.map(t => t.id === id ? {...t, done: !t.done} : t)
  );
}, []); // no deps needed — doesn't read any state directly

const handleDelete = useCallback((id) => {
  setTodos(prev => prev.filter(t => t.id !== id));
}, []);

// Passed to React.memo'd child → stable = no extra renders
<TodoItem onToggle={handleToggle} onDelete={handleDelete} />`}</Code>

      <Insight>
        Move the <strong>Unrelated slider</strong> — parent re-renders but all todo items stay frozen
        because <code>handleToggle</code> and <code>handleDelete</code> are stable.
        Try toggling an item — only that item re-renders.
        The key trick: using <strong>functional updater</strong> form of setState removes the need to list state in deps.
      </Insight>
    </div>
  );
}

// ─── Root shell ───────────────────────────────────────────────────────────────
const LABS = [
  { id: "identity",  label: "🆔 Identity",   component: Lab1 },
  { id: "deps",      label: "📦 Deps & Stale", component: Lab2 },
  { id: "effect",    label: "🔄 + useEffect", component: Lab3 },
  { id: "handlers",  label: "📋 Handlers",    component: Lab4 },
];

export default function UseCallbackLab() {
  const [active, setActive] = useState("identity");
  const ActiveLab = LABS.find(l => l.id === active)?.component ?? Lab1;

  return (
    <div className="min-h-screen bg-[#0b0b12] text-slate-200 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/70 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {["bg-rose-500","bg-amber-500","bg-emerald-500"].map(c => (
                <div key={c} className={``} />
              ))}
            </div>
            <span className="font-mono text-sm text-slate-300 ml-1">
              use<span className="text-cyan-400">Callback</span> lab
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
            React 18 · Tailwind
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* Intro */}
        <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 px-4 py-3">
          <p className="text-sm text-cyan-200 font-semibold mb-1">
            useCallback caches a function reference between renders.
          </p>
          <p className="text-xs text-cyan-300/70 leading-relaxed">
            Functions are recreated on every render. useCallback returns the <em>same</em> function reference
            until a dependency changes — making React.memo and useEffect deps safe and predictable.
          </p>
        </div>

        {/* useMemo vs useCallback clarifier */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { hook: "useMemo", returns: "a cached value", example: "useMemo(() => compute(a), [a])", color: "border-violet-700/40 bg-violet-950/20 text-violet-300" },
            { hook: "useCallback", returns: "a cached function", example: "useCallback(() => fn(a), [a])", color: "border-cyan-700/40 bg-cyan-950/20 text-cyan-300" },
          ].map(r => (
            <div key={r.hook} className={`rounded-lg p-3 border ${r.color}`}>
              <p className="font-mono font-semibold text-sm mb-1">{r.hook}</p>
              <p className="text-xs opacity-70 mb-2">returns {r.returns}</p>
              <code className="text-[10px] opacity-80 block">{r.example}</code>
            </div>
          ))}
        </div>

        {/* Note: useCallback(fn, deps) === useMemo(() => fn, deps) */}
        <div className="text-[11px] font-mono text-slate-500 text-center">
          useCallback(fn, deps) is sugar for useMemo(() =&gt; fn, deps)
        </div>

        {/* Tab nav */}
        <div className="flex flex-wrap gap-2">
          {LABS.map(lab => (
            <button
              key={lab.id}
              onClick={() => setActive(lab.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                active === lab.id
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/40"
                  : "bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600"
              }`}
            >
              {lab.label}
            </button>
          ))}
        </div>

        {/* Active lab */}
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-5">
          <ActiveLab />
        </div>

        {/* Quick reference */}
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Quick reference</h3>
          <Code>{`const fn = useCallback(() => doWork(a, b), [a, b]);
//                    ↑ function to cache     ↑ deps

// []     → same function forever (only safe if no external vars)
// [a, b] → new function when a or b changes
// Functional updater trick → removes state from deps:
//   setCount(prev => prev + 1) — no need for [count] in deps`}</Code>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["✅ Good use", "border-emerald-800/40 bg-emerald-950/30 text-emerald-300",
                "Handler passed to React.memo child\nFunction in useEffect deps\nEvent handlers in long lists"],
              ["❌ Bad use", "border-rose-800/40 bg-rose-950/30 text-rose-300",
                "Inline handler on non-memo component\nFunction that changes every render anyway\nPremature optimization"],
              ["⚠️ Gotcha", "border-amber-800/40 bg-amber-950/30 text-amber-300",
                "Missing dep = stale closure bug\nOver-optimizing creates complexity\nuseCallback ≠ free — has its own cost"],
            ].map(([title, cls, body]) => (
              <div key={title} className={`rounded-lg p-2.5 border ${cls}`}>
                <p className="font-semibold mb-1">{title}</p>
                {body.split("\n").map((l, i) => <p key={i} className="opacity-80 text-[11px]">{l}</p>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}