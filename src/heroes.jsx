// Three hero variations — Tweak switches between them
const heroStyles = {
  wrap: {
    minHeight: '92vh',
    padding: '120px 48px 80px',
    position: 'relative',
    borderBottom: '1px solid var(--rule)',
    overflow: 'hidden',
  },
};

// 1) MANIFESTO — pure typography
const HeroManifesto = () => (
  <section style={{ ...heroStyles.wrap, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.18em',
        textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 32,
        display: 'flex', gap: 20, flexWrap: 'wrap'
      }}>
        <span><Dot size={6} color="var(--accent)" /> &nbsp; {PROFILE.location}</span>
        <span>· PhD in progress</span>
      </div>
      <h1 style={{
        fontFamily: 'var(--display)', fontWeight: 300,
        fontSize: 'clamp(48px, 7.6vw, 124px)',
        lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 28,
        fontVariationSettings: '"opsz" 144',
      }}>
        Teaching neural<br/>
        networks to <em style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 400 }}>explain</em><br/>
        themselves<span style={{ color: 'var(--accent)' }}>.</span>
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 56, maxWidth: 900 }}>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--fg-soft)', maxWidth: 420 }}>
          PhD student at the <strong style={{ fontWeight: 500, color: 'var(--fg)' }}>Institut de Mathématiques de Toulouse</strong>,
          building explainable-AI tools for numerical weather prediction.
        </p>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.8,
          color: 'var(--fg-mute)', letterSpacing: '.02em'
        }}>
          <div>01 &nbsp; gradient attributions</div>
          <div>02 &nbsp; sensitivity atlases</div>
          <div>03 &nbsp; physically-grounded XAI</div>
          <div>04 &nbsp; numerical weather prediction</div>
        </div>
      </div>
    </div>
    <div style={{
      position: 'absolute', bottom: 32, left: 48, right: 48,
      display: 'flex', justifyContent: 'space-between',
      fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em',
      color: 'var(--fg-mute)', textTransform: 'uppercase',
    }}>
      <span>↓ &nbsp; scroll to read</span>
      <span>Portfolio · MMXXVI</span>
    </div>
  </section>
);

// 2) ISOBARIC — animated weather field background
const HeroIsobaric = () => (
  <section style={{
    ...heroStyles.wrap,
    padding: '120px 48px 80px',
    display: 'flex', alignItems: 'center',
  }}>
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      opacity: 0.75, color: 'var(--fg)',
      maskImage: 'radial-gradient(ellipse at 70% 50%, black 0%, transparent 80%)',
      WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 0%, transparent 80%)',
    }}>
      <IsobarField height={900} />
    </div>
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', position: 'relative' }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.22em',
        textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 40,
      }}>
        <span style={{ color: 'var(--accent)' }}>●</span> &nbsp; 43.6047° N · 1.4442° E &nbsp; / &nbsp; reading the atmosphere
      </div>
      <h1 style={{
        fontFamily: 'var(--display)', fontWeight: 400,
        fontSize: 'clamp(44px, 6.8vw, 108px)',
        lineHeight: 1.02, letterSpacing: '-0.025em',
        maxWidth: 900, marginBottom: 40,
      }}>
        Younes Essafouri.
      </h1>
      <p style={{
        fontSize: 20, lineHeight: 1.5, color: 'var(--fg-soft)',
        maxWidth: 560, marginBottom: 20,
      }}>
        A PhD in explainable AI for weather forecasting — written between pressure levels,
        gradient fields, and a stubborn meteorological intuition.
      </p>
      <div style={{ display: 'flex', gap: 14, marginTop: 40, flexWrap: 'wrap' }}>
        <a href="#research" className="btn-pri">Read the research <Arrow /></a>
        <a href="#about" className="btn-sec">About me</a>
      </div>
    </div>
  </section>
);

// 3) EDITORIAL — split with photo placeholder
const HeroEditorial = () => (
  <section style={{
    ...heroStyles.wrap, padding: 0, borderBottom: '1px solid var(--rule)',
    minHeight: '92vh',
  }}>
    <div style={{
      display: 'grid', gridTemplateColumns: '1.15fr 1fr',
      minHeight: '92vh',
    }}>
      <div style={{ padding: '120px 56px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.22em',
          textTransform: 'uppercase', color: 'var(--fg-mute)',
        }}>
          Vol. I &nbsp; — &nbsp; a portfolio · Spring 2026
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)',
            letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 24,
          }}>
            The long form
          </div>
          <h1 style={{
            fontFamily: 'var(--display)', fontWeight: 300,
            fontSize: 'clamp(40px, 5.6vw, 92px)', lineHeight: 1.0,
            letterSpacing: '-0.025em', marginBottom: 36,
            fontStyle: 'italic',
          }}>
            "A forecast<br/>
            is an argument<br/>
            about the sky."
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--fg-soft)', maxWidth: 480, marginBottom: 24 }}>
            I'm Younes — a PhD student at the Institut de Mathématiques de Toulouse
            studying how deep learning models reason about the weather, and whether their
            reasoning can be made legible to the people who use them.
          </p>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'var(--fg-mute)', flexWrap: 'wrap' }}>
            <span>— IMT, Toulouse</span>
            <span>— Ensimag / KTH</span>
            <span>— EGU 2026</span>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 32, alignItems: 'baseline',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em',
          color: 'var(--fg-mute)', textTransform: 'uppercase',
        }}>
          <span>↓ continue reading</span>
          <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          <span>p.01</span>
        </div>
      </div>
      <div style={{
        background: 'var(--paper)',
        borderLeft: '1px solid var(--rule)',
        padding: 32,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          flex: 1,
          background: 'repeating-linear-gradient(45deg, var(--rule-soft) 0 12px, transparent 12px 24px)',
          border: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.18em',
          textTransform: 'uppercase', color: 'var(--fg-mute)',
          minHeight: 480,
          position: 'relative',
        }}>
          <span style={{ background: 'var(--paper)', padding: '8px 14px' }}>
            [ portrait · 3:4 · drop in ]
          </span>
        </div>
        <div style={{
          marginTop: 20, display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em',
          color: 'var(--fg-mute)',
        }}>
          <span>fig. 01</span>
          <span>Toulouse, Apr. 2026</span>
        </div>
      </div>
    </div>
  </section>
);

const Hero = ({ variant }) => {
  if (variant === 'isobaric') return <HeroIsobaric />;
  if (variant === 'editorial') return <HeroEditorial />;
  return <HeroManifesto />;
};

Object.assign(window, { Hero, HeroManifesto, HeroIsobaric, HeroEditorial });
