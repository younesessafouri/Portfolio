// Root app
const { useState, useEffect } = React;

// Inject component-level styles (buttons, nav, pills, hover)
const injectStyles = () => {
  if (document.getElementById('__portfolio_styles')) return;
  const s = document.createElement('style');
  s.id = '__portfolio_styles';
  s.textContent = `
    .btn-pri {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 13px 22px; background: var(--fg); color: var(--bg);
      border-radius: 999px; font-size: 14px; font-weight: 500;
      border: 1px solid var(--fg); transition: transform .2s, background .2s;
    }
    .btn-pri:hover { transform: translateY(-1px); }
    .btn-sec {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 13px 22px; border: 1px solid var(--rule);
      border-radius: 999px; font-size: 14px; font-weight: 500;
      color: var(--fg); transition: border-color .2s, background .2s;
    }
    .btn-sec:hover { border-color: var(--fg); background: var(--paper); }
    .pill {
      padding: 6px 14px; border: 1px solid var(--rule); border-radius: 999px;
      background: transparent; color: var(--fg-soft); cursor: pointer;
      font-family: var(--mono); font-size: 11px; letter-spacing: .08em;
      text-transform: uppercase; transition: all .2s;
    }
    .pill:hover { border-color: var(--fg); color: var(--fg); }
    .pill-on { background: var(--fg); color: var(--bg); border-color: var(--fg); }
    .nav-link { transition: color .2s, background .2s; }
    .nav-link:hover { color: var(--fg); background: var(--rule-soft); }
    .icon-btn {
      margin-left: 8px; width: 34px; height: 34px; border-radius: 999px;
      border: 1px solid var(--rule); background: transparent; cursor: pointer;
      color: var(--fg); font-size: 14px; transition: all .2s;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .icon-btn:hover { border-color: var(--fg); }
    .hover-accent { transition: color .2s, padding-left .25s; }
    .hover-accent:hover { color: var(--accent); padding-left: 8px; }
    .scroll-hint { animation: bounce 2.2s ease-in-out infinite; }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); opacity: .6; }
      50% { transform: translateY(4px); opacity: 1; }
    }
    .tweak-btn {
      padding: 8px 10px; border: 1px solid var(--rule); border-radius: 6px;
      background: transparent; color: var(--fg-soft); cursor: pointer;
      font-family: var(--mono); font-size: 11px; transition: all .15s;
    }
    .tweak-btn:hover { border-color: var(--fg); color: var(--fg); }
    .tweak-btn.on { background: var(--fg); color: var(--bg); border-color: var(--fg); }
    @media (max-width: 880px) {
      .nav-links { display: none !important; }
      section { padding: 80px 24px !important; }
    }
  `;
  document.head.appendChild(s);
};

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portfolio-theme') || 'light';
  });
  const [tweaks, setTweaks] = useState(window.__TWEAKS__ || { heroVariant: 'manifesto', typePair: 'editorial' });
  const [tweaksVisible, setTweaksVisible] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.typepair = tweaks.typePair;
  }, [tweaks.typePair]);

  // Tweaks host protocol
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateTweaks = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero variant={tweaks.heroVariant} />
        <About />
        <Research />
        <Publications />
        <EducationSection />
        <TalksTeaching />
        <Writing />
        <Personal />
        <Contact />
      </main>
      <TweaksPanel visible={tweaksVisible} state={tweaks} onChange={updateTweaks} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
