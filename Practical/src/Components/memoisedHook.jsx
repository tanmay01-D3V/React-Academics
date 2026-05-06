import { useState, useMemo, useRef, useCallback, memo } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const CATEGORIES = ["Electronics", "Clothing", "Books", "Food", "Sports", "Tools"];

const PRODUCTS = Array.from({ length: 80 }, (_, i) => {
  const price = Math.round((Math.random() * 490 + 10) * 100) / 100;
  const sales = Math.floor(Math.random() * 900 + 50);
  return {
    id: i + 1,
    name: `Product ${String(i + 1).padStart(3, "0")}`,
    category: CATEGORIES[i % CATEGORIES.length],
    price,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    stock: Math.floor(Math.random() * 200),
    sales,
    revenue: Math.round(price * sales),
  };
});

// Intentionally slow — burns ~35ms to show the memo benefit clearly
function slowComputeStats(products) {
  const start = performance.now();
  while (performance.now() - start < 35) {}
  return {
    totalRevenue: products.reduce((s, p) => s + p.revenue, 0),
    avgRating: (products.reduce((s, p) => s + p.rating, 0) / (products.length || 1)).toFixed(2),
    totalSales: products.reduce((s, p) => s + p.sales, 0),
    topProduct: products.slice().sort((a, b) => b.revenue - a.revenue)[0] ?? null,
  };
}

function slowSort(arr, key, dir) {
  const start = performance.now();
  while (performance.now() - start < 15) {}
  return [...arr].sort((a, b) => {
    const v = typeof a[key] === "string" ? a[key].localeCompare(b[key]) : a[key] - b[key];
    return dir === "asc" ? v : -v;
  });
}

// ─── Tiny shared primitives ───────────────────────────────────────────────────
function useRenderCount() {
  const c = useRef(0);
  c.current += 1;
  return c.current;
}

function Badge({ children, color = "violet" }) {
  const map = {
    violet: "bg-violet-900/60 border-violet-700/50 text-violet-300",
    green:  "bg-emerald-900/60 border-emerald-700/50 text-emerald-300",
    orange: "bg-orange-900/60 border-orange-700/50 text-orange-300",
    sky:    "bg-sky-900/60 border-sky-700/50 text-sky-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${map[color]}`}>
      {children}
    </span>
  );
}

function RenderCount({ n }) {
  return (
    <Badge color={n > 5 ? "orange" : "green"}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse inline-block" />
      {n} renders
    </Badge>
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
    <div className="flex gap-2 p-3 rounded-lg bg-violet-950/30 border border-violet-800/30 text-xs text-violet-200/80 leading-relaxed">
      <span className="text-violet-400 shrink-0">💡</span>
      {children}
    </div>
  );
}

function StatCard({ label, value, color = "text-slate-100" }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3">
      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
      <p className={`text-base font-mono font-semibold ${color}`}>{value}</p>
    </div>
  );
}

// ─── LAB 1 — Expensive computation ───────────────────────────────────────────
function Lab1() {
  const renders = useRenderCount();
  const [category, setCategory] = useState("All");
  const [theme, setTheme] = useState(50); // unrelated state — triggers re-renders
  const computeCalls = useRef(0);
  const [tick, setTick] = useState(0); // force re-render on theme change

  const filtered = useMemo(
    () => (category === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === category)),
    [category]
  );

  // ✅ useMemo: only re-runs when `filtered` changes
  const stats = useMemo(() => {
    computeCalls.current += 1;
    return slowComputeStats(filtered);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="⚡"
        title="Expensive computation"
        subtitle="slowComputeStats() burns ~35ms. Watch the 'computed' counter vs 'renders' counter as you move the Theme slider."
      />

      <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1"
          >
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Theme (unrelated) {theme}</label>
          <input
            type="range" min={0} max={100} value={theme}
            onChange={e => { setTheme(+e.target.value); setTick(n => n + 1); }}
            className="w-28 accent-violet-500"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <RenderCount n={renders} />
          <Badge color="sky">computed: {computeCalls.current}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="text-emerald-400" />
        <StatCard label="Total Sales" value={stats.totalSales.toLocaleString()} color="text-sky-400" />
        <StatCard label="Avg Rating" value={`★ ${stats.avgRating}`} color="text-amber-400" />
        <StatCard label="Top Product" value={stats.topProduct?.name ?? "—"} color="text-violet-400" />
      </div>

      <Code>{`// ✅ With useMemo
const stats = useMemo(() => {
  return slowComputeStats(filtered); // ~35ms
}, [filtered]); // only re-runs when filtered changes

// ❌ Without useMemo
// const stats = slowComputeStats(filtered);
// → burns 35ms on EVERY render, even Theme slider moves`}</Code>

      <Insight>
        Move the <strong>Theme slider</strong> — renders go up, but <strong>computed stays frozen</strong> (cache hit).
        Change <strong>Category</strong> to actually bust the memo and see computeCalls increment.
      </Insight>
    </div>
  );
}

// ─── LAB 2 — Filter + Sort pipeline ─────────────────────────────────────────
function Lab2() {
  const renders = useRenderCount();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [sortKey, setSortKey] = useState("revenue");
  const [sortDir, setSortDir] = useState("desc");
  const filterCalls = useRef(0);
  const sortCalls = useRef(0);

  // Stage 1: filter — only re-runs when search inputs change
  const filtered = useMemo(() => {
    filterCalls.current += 1;
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (cat === "All" || p.category === cat) &&
      p.price >= minPrice
    );
  }, [query, cat, minPrice]);

  // Stage 2: sort — re-runs when filtered changes OR sort changes
  // Reuses cached `filtered` without re-filtering!
  const sorted = useMemo(() => {
    sortCalls.current += 1;
    return slowSort(filtered, sortKey, sortDir);
  }, [filtered, sortKey, sortDir]);

  const Th = ({ k, label }) => (
    <th
      onClick={() => { setSortKey(k); setSortDir(d => k === sortKey ? (d === "asc" ? "desc" : "asc") : "desc"); }}
      className={`px-2 py-2 text-left text-[11px] font-mono cursor-pointer select-none hover:text-slate-200 transition-colors ${sortKey === k ? "text-violet-400" : "text-slate-400"}`}
    >
      {label} {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="🔗"
        title="Filter → Sort pipeline"
        subtitle="Two chained useMemos. Changing sort reuses the cached filtered array — zero re-filtering work."
      />

      <div className="flex flex-wrap gap-3 items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <input
          type="text" placeholder="Search…" value={query}
          onChange={e => setQuery(e.target.value)}
          className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 w-32"
        />
        <select value={cat} onChange={e => setCat(e.target.value)}
          className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1">
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">≥${minPrice}</span>
          <input type="range" min={0} max={400} step={10} value={minPrice}
            onChange={e => setMinPrice(+e.target.value)}
            className="w-20 accent-violet-500" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <RenderCount n={renders} />
          <Badge color="sky">filtered: {filterCalls.current}×</Badge>
          <Badge color="green">sorted: {sortCalls.current}×</Badge>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/40 overflow-hidden">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-700/40">
              <Th k="name" label="Name" />
              <Th k="category" label="Category" />
              <Th k="price" label="Price" />
              <Th k="revenue" label="Revenue" />
              <Th k="rating" label="★" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sorted.slice(0, 8).map(p => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-2 py-1.5 text-slate-300">{p.name}</td>
                <td className="px-2 py-1.5 text-slate-400">{p.category}</td>
                <td className="px-2 py-1.5 text-slate-300">${p.price.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-emerald-400">${p.revenue.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-amber-300">{p.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 py-1.5 bg-slate-800/30 text-[10px] text-slate-500 font-mono">
          showing 8 of {sorted.length} results
        </div>
      </div>

      <Code>{`// Stage 1 — filter
const filtered = useMemo(() =>
  products.filter(p =>
    p.name.includes(query) && p.price >= min
  ),
  [products, query, min]  // deps
);

// Stage 2 — sort (depends on filtered!)
const sorted = useMemo(() =>
  slowSort(filtered, sortKey, dir),
  [filtered, sortKey, dir]
  //  ↑ reuses cached filtered, no re-filter`}</Code>

      <Insight>
        Click a column header to change sort — <strong>sorted× increments but filtered× stays frozen</strong>.
        Filtering and sorting are separate costs, each cached independently.
      </Insight>
    </div>
  );
}

// ─── LAB 3 — Reference stability ─────────────────────────────────────────────
const ChartChild = memo(function ChartChild({ config, label, withMemo }) {
  const renders = useRenderCount();
  const bars = [65, 80, 45, 90, 55, 75, 60];
  return (
    <div className={`rounded-lg p-3 border ${withMemo ? "border-emerald-700/40 bg-emerald-950/20" : "border-orange-700/40 bg-orange-950/20"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-300">{label}</span>
        <RenderCount n={renders} />
      </div>
      <div className="flex items-end gap-1 h-12">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm transition-all duration-300"
            style={{ height: `${h}%`, backgroundColor: config.color, opacity: 0.6 + i * 0.06 }} />
        ))}
      </div>
      <div className="mt-1 text-[10px] font-mono text-slate-500">
        size={config.size} · grid={String(config.grid)}
      </div>
    </div>
  );
});

function Lab3() {
  const renders = useRenderCount();
  const [count, setCount] = useState(0);       // unrelated — just causes re-renders
  const [color, setColor] = useState("#34d399");
  const [size, setSize] = useState(12);
  const [grid, setGrid] = useState(true);

  // ✅ Same object reference as long as deps don't change
  const memoConfig = useMemo(() => ({ color, size, grid }), [color, size, grid]);

  // ❌ New object every render — React.memo can't help
  const noMemoConfig = { color, size, grid };

  return (
    <div className="space-y-4">
      <SectionTitle
        emoji="🔗"
        title="Object reference stability"
        subtitle="React.memo only bails out when props are the same reference. A plain object literal is always a new reference."
      />

      <div className="flex flex-wrap gap-4 items-center p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Size {size}</label>
          <input type="range" min={10} max={20} value={size} onChange={e => setSize(+e.target.value)}
            className="w-20 accent-violet-500" />
        </div>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" checked={grid} onChange={e => setGrid(e.target.checked)} className="accent-violet-500" />
          Grid
        </label>
        <div className="border-l border-slate-700 pl-4 flex items-center gap-3">
          <span className="text-xs text-slate-400">Unrelated counter:</span>
          <button
            onClick={() => setCount(c => c + 1)}
            className="px-3 py-1 text-xs font-mono rounded border border-slate-600 text-slate-300 hover:border-slate-400 transition-colors"
          >
            click me → {count}
          </button>
        </div>
        <RenderCount n={renders} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ChartChild config={memoConfig} label="✅ With useMemo" withMemo />
        <ChartChild config={noMemoConfig} label="❌ Without useMemo" />
      </div>

      <Code>{`// ✅ With useMemo — stable reference
const config = useMemo(
  () => ({ color, size, grid }),
  [color, size, grid]
);
// Same reference when deps unchanged
// → React.memo sees equal props → SKIP render

// ❌ Without useMemo
const config = { color, size, grid };
// Brand new object every render
// → React.memo sees different ref → ALWAYS renders`}</Code>

      <Insight>
        Hammer the <strong>"click me"</strong> button — parent re-renders each time.
        Left child (useMemo) stays frozen because <code>config</code> reference is stable.
        Right child always re-renders despite identical values.
      </Insight>
    </div>
  );
}

// ─── Root Lab Shell ───────────────────────────────────────────────────────────
const LABS = [
  { id: "compute",   label: "⚡ Computation", component: Lab1 },
  { id: "pipeline",  label: "🔗 Pipeline",    component: Lab2 },
  { id: "reference", label: "📦 References",  component: Lab3 },
];

export default function UseMemoLab() {
  const [active, setActive] = useState("compute");
  const ActiveLab = LABS.find(l => l.id === active)?.component ?? Lab1;

  return (
    <div className="min-h-screen bg-[#0b0b12] text-slate-200 font-sans">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/70 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {["bg-rose-500","bg-amber-500","bg-emerald-500"].map(c => (
                <div key={c} className={`w-2.5 h-2.5`} />
              ))}
            </div>
            <span className="font-mono text-sm text-slate-300 ml-1">
              use<span className="text-violet-400">Memo</span> lab
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
            React 18 · Tailwind
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* Intro */}
        <div className="rounded-xl border border-violet-800/40 bg-violet-950/20 px-4 py-3">
          <p className="text-sm text-violet-200 font-semibold mb-1">
            useMemo caches a computed value between renders.
          </p>
          <p className="text-xs text-violet-300/70 leading-relaxed">
            React skips recomputing and returns the cached result — unless a dependency changes.
            Three labs below show the three most important patterns.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2">
          {LABS.map(lab => (
            <button
              key={lab.id}
              onClick={() => setActive(lab.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                active === lab.id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40"
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
          <Code>{`const value = useMemo(() => expensiveFn(a, b), [a, b]);
//                    ↑ factory fn          ↑ deps array

// []        → compute once on mount, never again
// [a, b]    → recompute when a or b changes
// no array  → runs every render (pointless, don't do this)`}</Code>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["✅ Good use", "bg-emerald-950/40 border-emerald-800/40 text-emerald-300", "Slow computation\nLarge list filter/sort\nDerived object passed to memo child"],
              ["❌ Bad use", "bg-red-950/40 border-red-800/40 text-red-300", "Simple arithmetic\nString formatting\nComponents that always re-render anyway"],
              ["⚠️ Gotcha", "bg-amber-950/40 border-amber-800/40 text-amber-300", "Deps use === (shallow)\nNew [] or {} in deps = always recomputes\nDon't put side-effects inside"],
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
