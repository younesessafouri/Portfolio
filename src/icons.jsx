// Interactive SVG & DOM utilities

const Dot = ({ size = 6, color }) => (
  <span style={{
    display: 'inline-block', width: size, height: size, borderRadius: '50%',
    background: color || 'currentColor', verticalAlign: 'middle'
  }} />
);

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle' }}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowUR = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle' }}>
    <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Global pointer tracker (one listener, shared via hook)
const pointerStore = { x: 0.5, y: 0.5, listeners: new Set() };
if (typeof window !== 'undefined' && !window.__pointer_bound__) {
  window.__pointer_bound__ = true;
  window.addEventListener('pointermove', (e) => {
    pointerStore.x = e.clientX / window.innerWidth;
    pointerStore.y = e.clientY / window.innerHeight;
    pointerStore.listeners.forEach(fn => fn(pointerStore.x, pointerStore.y));
  });
}
const usePointer = () => {
  const [p, setP] = React.useState({ x: 0.5, y: 0.5 });
  React.useEffect(() => {
    const fn = (x, y) => setP({ x, y });
    pointerStore.listeners.add(fn);
    return () => pointerStore.listeners.delete(fn);
  }, []);
  return p;
};

// Cursor-reactive isobar field — flows toward the pointer
const IsobarField = ({ height = 420, reactive = true }) => {
  const [t, setT] = React.useState(0);
  const ptr = usePointer();
  React.useEffect(() => {
    let raf, start = performance.now();
    const loop = (now) => { setT((now - start) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const w = 1200, h = height;
  const lines = [];
  const bands = 18;
  const px = reactive ? (ptr.x - 0.5) * 40 : 0;
  const py = reactive ? (ptr.y - 0.5) * 30 : 0;
  for (let i = 0; i < bands; i++) {
    const phase = t * 0.12 + i * 0.32;
    const amp = 28 + (i % 5) * 8 + Math.abs(py) * 0.4;
    const yBase = (h / (bands + 1)) * (i + 1) + py * 0.2;
    let d = `M 0 ${yBase.toFixed(2)}`;
    for (let x = 0; x <= w; x += 18) {
      const dx = x - ptr.x * w;
      const pull = reactive ? Math.exp(-(dx * dx) / 60000) * py * 1.2 : 0;
      const y = yBase
        + Math.sin((x / 180) + phase + px * 0.01) * amp * 0.6
        + Math.sin((x / 70) + phase * 1.3) * (amp * 0.25)
        + Math.cos((x / 300) - phase * 0.4) * (amp * 0.3)
        + pull;
      d += ` L ${x} ${y.toFixed(2)}`;
    }
    lines.push(
      <path key={i} d={d} fill="none" stroke="currentColor"
        strokeWidth={i % 4 === 0 ? 1.2 : 0.55}
        opacity={i % 4 === 0 ? 0.55 : 0.25} />
    );
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}
      preserveAspectRatio="none" style={{ display: 'block', color: 'var(--fg)' }}>
      {lines}
    </svg>
  );
};

// Reveal-on-scroll wrapper
const Reveal = ({ children, delay = 0, as: Tag = 'div', style = {}, ...rest }) => {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.1, rootMargin: '-40px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity .9s ease ${delay}s, transform .9s cubic-bezier(.2,.7,.2,1) ${delay}s`,
    }} {...rest}>{children}</Tag>
  );
};

// Toulouse mini-map badge (48.58°N 2.35°E was Paris — Toulouse: 43.60°N 1.44°E)
const LocationBadge = () => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s = performance.now();
    const loop = (n) => { setT((n - s) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg viewBox="0 0 120 120" width="80" height="80" style={{ display: 'block' }}>
      {/* concentric rings */}
      {[20, 34, 48].map((r, i) => (
        <circle key={i} cx="60" cy="60" r={r}
          fill="none" stroke="currentColor"
          strokeWidth="0.6" opacity={0.3 - i * 0.08}
          strokeDasharray={i === 1 ? "2 4" : "none"} />
      ))}
      {/* pulsing pin */}
      <circle cx="60" cy="60" r={4 + Math.sin(t * 2) * 1.5}
        fill="var(--accent)" opacity={0.5 - Math.sin(t * 2) * 0.2} />
      <circle cx="60" cy="60" r="3" fill="var(--accent)" />
      {/* crosshair */}
      <line x1="60" y1="6" x2="60" y2="18" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="60" y1="102" x2="60" y2="114" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="6" y1="60" x2="18" y2="60" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="102" y1="60" x2="114" y2="60" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
    </svg>
  );
};

// Tiny sensitivity heatmap — pointer-reactive grid
const SensitivityGrid = ({ cols = 12, rows = 8 }) => {
  const ptr = usePointer();
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = (x + 0.5) / cols;
      const cy = (y + 0.5) / rows;
      const d = Math.sqrt((cx - ptr.x) ** 2 + (cy - ptr.y) ** 2);
      const v = Math.max(0, 1 - d * 2.2);
      cells.push(
        <div key={`${x}-${y}`} style={{
          background: `color-mix(in oklab, var(--accent) ${v * 80}%, transparent)`,
          border: '1px solid var(--rule)',
          transition: 'background .25s ease',
        }} />
      );
    }
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridAutoRows: '1fr',
      aspectRatio: `${cols}/${rows}`,
      gap: 2,
    }}>
      {cells}
    </div>
  );
};

// Windrose-ish small decorator
const Compass = ({ size = 48 }) => {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf, s = performance.now();
    const loop = (n) => { setT((n - s) / 1000); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const angle = Math.sin(t * 0.5) * 40 + 20;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size}>
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
      <g transform={`rotate(${angle} 24 24)`} style={{ transition: 'transform .3s' }}>
        <path d="M24 8 L20 26 L24 22 L28 26 Z" fill="var(--accent)" />
        <path d="M24 40 L20 22 L24 26 L28 22 Z" fill="currentColor" opacity="0.3" />
      </g>
      <circle cx="24" cy="24" r="1.5" fill="currentColor" />
    </svg>
  );
};

Object.assign(window, { Dot, Arrow, ArrowUR, IsobarField, Reveal, LocationBadge, SensitivityGrid, Compass, usePointer });
