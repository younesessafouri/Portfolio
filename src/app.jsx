// Root app
const { useState, useEffect } = React;

// Inject component-level styles (buttons, nav, pills, hover)
const injectStyles = () => {
  const STYLE_ID = '__portfolio_styles_v3';
  // Remove any previous version
  ['__portfolio_styles', '__portfolio_styles_v2'].forEach(old => {
    const n = document.getElementById(old);
    if (n) n.remove();
  });
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
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
    .mobile-menu-btn { display: none; }
    @media (max-width: 880px) {
      nav { padding: 12px 20px !important; }
      .nav-links {
        position: fixed !important; top: 60px; left: 0; right: 0;
        flex-direction: column !important; gap: 0 !important;
        background: color-mix(in oklab, var(--bg) 96%, transparent);
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--rule);
        padding: 12px 20px 20px; max-height: 0; overflow: hidden;
        transition: max-height .35s ease, padding .35s ease, opacity .25s;
        opacity: 0;
      }
      .nav-links.open { max-height: 500px; opacity: 1; padding: 12px 20px 20px; }
      .nav-link { padding: 12px 8px !important; font-size: 14px !important; border-bottom: 1px solid var(--rule-soft); }
      .mobile-menu-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 34px; height: 34px; border-radius: 999px;
        border: 1px solid var(--rule); background: transparent;
        color: var(--fg); cursor: pointer; margin-left: 6px;
      }
      section { padding: 72px 20px !important; }
      .hero-grid { grid-template-columns: 1fr !important; }
      .two-col { grid-template-columns: 1fr !important; gap: 40px !important; }
      .project-row {
        grid-template-columns: 30px 1fr !important;
        gap: 12px !important;
        padding: 20px 0 !important;
      }
      .project-row .pr-year, .project-row .pr-status, .project-row .pr-plus {
        display: none !important;
      }
      .pub-row { grid-template-columns: 50px 1fr !important; gap: 12px !important; }
      .pub-row .pub-type { display: none !important; }
      .edu-row { grid-template-columns: 1fr !important; gap: 6px !important; }
      .photos-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .teach-grid { grid-template-columns: 1fr !important; }
      .teach-row { grid-template-columns: 1fr !important; gap: 4px !important; }
      .teach-row .t-role { text-align: left !important; }
      .skills-grid { grid-template-columns: 1fr !important; }
      .writing-grid { grid-template-columns: 1fr !important; }
      .writing-grid > a { border-right: none !important; padding-left: 0 !important; padding-right: 0 !important; }
      h1 { font-size: clamp(36px, 9vw, 64px) !important; }
      h2 { font-size: clamp(28px, 7vw, 40px) !important; }
      .hide-mobile { display: none !important; }
      .personal-sensitivity { width: 100% !important; max-width: 240px; }
      .editorial-split { grid-template-columns: 1fr !important; }
      .editorial-right { border-left: none !important; border-top: 1px solid var(--rule); min-height: 320px !important; }
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
