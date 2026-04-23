// Tweaks panel — in-page controls for hero variant + typography
const TweaksPanel = ({ visible, state, onChange }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 100,
      background: 'var(--paper)', border: '1px solid var(--rule)',
      borderRadius: 12, padding: 18, minWidth: 280,
      fontFamily: 'var(--mono)', fontSize: 12,
      boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase',
        color: 'var(--fg-mute)', marginBottom: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Tweaks</span>
        <span style={{ color: 'var(--accent)' }}>●</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: 'var(--fg-soft)', marginBottom: 8 }}>Hero variant</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {[
            ['manifesto', 'Manifesto'],
            ['isobaric', 'Isobaric'],
            ['editorial', 'Editorial'],
          ].map(([key, label]) => (
            <button key={key}
              onClick={() => onChange({ heroVariant: key })}
              className={state.heroVariant === key ? 'tweak-btn on' : 'tweak-btn'}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ color: 'var(--fg-soft)', marginBottom: 8 }}>Typography</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[
            ['editorial', 'Fraunces × Inter'],
            ['literary', 'Garamond'],
          ].map(([key, label]) => (
            <button key={key}
              onClick={() => onChange({ typePair: key })}
              className={state.typePair === key ? 'tweak-btn on' : 'tweak-btn'}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TweaksPanel });
