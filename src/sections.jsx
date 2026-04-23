// Page sections

const sectionStyles = {
  wrap: { padding: '120px 48px', borderBottom: '1px solid var(--rule)', position: 'relative' },
  inner: { maxWidth: 1200, margin: '0 auto' },
  eyebrow: {
    fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.22em',
    textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 28,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  h2: {
    fontFamily: 'var(--display)', fontWeight: 300,
    fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.05,
    letterSpacing: '-0.02em', marginBottom: 56,
  },
};

const SectionEyebrow = ({ num, children }) => (
  <div style={sectionStyles.eyebrow}>
    <span style={{ color: 'var(--accent)' }}>§ {num}</span>
    <span style={{ width: 24, height: 1, background: 'var(--rule)' }} />
    <span>{children}</span>
  </div>
);

// ABOUT
const About = () => (
  <section id="about" style={sectionStyles.wrap}>
    <div style={sectionStyles.inner}>
      <SectionEyebrow num="01">About</SectionEyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 96, alignItems: 'start' }}>
        <div>
          <h2 style={sectionStyles.h2}>
            I build small instruments<br/>
            for looking inside big<br/>
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>forecasting</em> models.
          </h2>
          {BIO.map((p, i) => (
            <p key={i} style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--fg-soft)', marginBottom: 20, maxWidth: 560 }}>
              {p}
            </p>
          ))}
          <div style={{ marginTop: 32, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href={`mailto:${PROFILE.email}`} className="btn-pri">Get in touch <Arrow /></a>
            <a href="assets/YounesEssafouri_CV.pdf" target="_blank" rel="noreferrer" download className="btn-sec">Download CV</a>
          </div>
        </div>
        <aside style={{ fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, paddingBottom: 16, borderBottom: '1px solid var(--rule)' }}>
            <LocationBadge />
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 4 }}>Currently at</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400 }}>Toulouse, FR</div>
              <div style={{ fontSize: 11, color: 'var(--fg-mute)' }}>43.60° N · 1.44° E</div>
            </div>
          </div>
          <DataRow k="Role" v={PROFILE.role} />
          <DataRow k="Lab" v={PROFILE.lab} />
          <DataRow k="Advisor" v="L. Risser" />
          <DataRow k="Since" v="Oct. 2025" />
          <div style={{ height: 28 }} />
          <DataRow k="Currently reading" v="East of Eden — Steinbeck" />
          <DataRow k="On repeat" v="Fleetwood Mac · Rumours" />
          <DataRow k="Speaks" v="AR · FR · EN" />
        </aside>
      </div>
    </div>
  </section>
);

const DataRow = ({ k, v }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16,
    padding: '10px 0', borderBottom: '1px dotted var(--rule)',
    color: 'var(--fg-soft)',
  }}>
    <span style={{ color: 'var(--fg-mute)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '.14em' }}>{k}</span>
    <span style={{ color: 'var(--fg)' }}>{v}</span>
  </div>
);

// RESEARCH / PROJECTS
const Research = () => {
  const [hover, setHover] = React.useState(null);
  return (
    <section id="research" style={sectionStyles.wrap}>
      <div style={sectionStyles.inner}>
        <SectionEyebrow num="02">Research · Projects</SectionEyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48, gap: 40, flexWrap: 'wrap' }}>
          <h2 style={{ ...sectionStyles.h2, marginBottom: 0, maxWidth: 780 }}>
            Six projects at the<br/>
            edge of mathematics,<br/>
            code, and physics.
          </h2>
          <div style={{ width: 180 }}>
            <SensitivityGrid cols={12} rows={8} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginTop: 10 }}>
              fig. — sensitivity (move cursor)
            </div>
          </div>
        </div>
        <div>
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.id} project={p} active={hover === i}
              onEnter={() => setHover(i)} onLeave={() => setHover(null)} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectRow = ({ project, active, onEnter, onLeave }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const [mx, setMx] = React.useState(0);
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setMx(((e.clientX - r.left) / r.width) * 100);
  };
  return (
    <div
      ref={ref}
      onMouseEnter={onEnter} onMouseLeave={onLeave}
      onMouseMove={onMove}
      onClick={() => setOpen(!open)}
      style={{
        borderTop: '1px solid var(--rule)',
        padding: '28px 0',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '60px 1fr 180px 140px 40px',
        gap: 24, alignItems: 'baseline',
        transition: 'padding .25s ease, background .25s ease',
        paddingLeft: active ? 16 : 0,
        position: 'relative',
        backgroundImage: active
          ? `linear-gradient(90deg, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent ${Math.min(mx + 30, 100)}%)`
          : 'none',
      }}
    >
      {active && (
        <div style={{
          position: 'absolute', top: 0, left: `${mx}%`,
          width: 1, height: '100%', background: 'var(--accent)',
          opacity: 0.4, pointerEvents: 'none',
          transform: 'translateX(-50%)',
        }} />
      )}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: active ? 'var(--accent)' : 'var(--fg-mute)', transition: 'color .2s' }}>{project.id}</div>
      <div>
        <div style={{
          fontFamily: 'var(--display)', fontSize: 28, letterSpacing: '-0.01em',
          fontWeight: 400, lineHeight: 1.15,
        }}>{project.title}</div>
        <div style={{ fontSize: 14, color: 'var(--fg-mute)', marginTop: 4 }}>{project.sub}</div>
        <div style={{
          maxHeight: open ? 240 : 0,
          overflow: 'hidden',
          transition: 'max-height .4s ease, margin-top .4s ease',
          marginTop: open ? 20 : 0,
        }}>
          <p style={{ fontSize: 16, color: 'var(--fg-soft)', maxWidth: 680, marginBottom: 14, lineHeight: 1.6 }}>
            {project.desc}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {project.tags.map(t => (
              <span key={t} style={{
                fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.08em',
                padding: '4px 10px', border: '1px solid var(--rule)', borderRadius: 999,
                color: 'var(--fg-soft)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-mute)' }}>{project.year}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
        <span style={{
          padding: '3px 10px', border: '1px solid var(--rule)', borderRadius: 999,
          color: project.status === 'Active' ? 'var(--accent)' : 'var(--fg-soft)',
          borderColor: project.status === 'Active' ? 'var(--accent)' : 'var(--rule)',
        }}>{project.status}</span>
      </div>
      <div style={{
        fontFamily: 'var(--mono)', textAlign: 'right', color: 'var(--fg-mute)',
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .3s',
      }}>+</div>
    </div>
  );
};

// PUBLICATIONS
const Publications = () => {
  const [filter, setFilter] = React.useState('All');
  const types = ['All', ...Array.from(new Set(PUBLICATIONS.map(p => p.type)))];
  const filtered = filter === 'All' ? PUBLICATIONS : PUBLICATIONS.filter(p => p.type === filter);
  return (
    <section id="publications" style={sectionStyles.wrap}>
      <div style={sectionStyles.inner}>
        <SectionEyebrow num="03">Publications</SectionEyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 24, marginBottom: 56 }}>
          <h2 style={{ ...sectionStyles.h2, marginBottom: 0 }}>Written arguments.</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={filter === t ? 'pill pill-on' : 'pill'}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <ol style={{ listStyle: 'none' }}>
          {filtered.map((p, i) => (
            <li key={i} style={{
              borderTop: '1px solid var(--rule)',
              padding: '28px 0',
              display: 'grid', gridTemplateColumns: '60px 1fr 120px', gap: 24,
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-mute)' }}>{p.year}</div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginBottom: 6, fontFamily: 'var(--mono)' }}>
                  {p.authors}
                </div>
                <a href={p.href} target="_blank" rel="noreferrer" style={{
                  fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.3,
                  letterSpacing: '-0.01em', display: 'inline',
                  backgroundImage: 'linear-gradient(var(--accent), var(--accent))',
                  backgroundSize: '0 1px', backgroundPosition: '0 100%',
                  backgroundRepeat: 'no-repeat', transition: 'background-size .3s',
                }} onMouseEnter={e => e.currentTarget.style.backgroundSize = '100% 1px'}
                   onMouseLeave={e => e.currentTarget.style.backgroundSize = '0 1px'}>
                  {p.title} <ArrowUR size={12} />
                </a>
                <div style={{ fontSize: 14, color: 'var(--fg-soft)', marginTop: 8, fontStyle: 'italic' }}>
                  {p.venue}
                </div>
                {p.doi && (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', marginTop: 6 }}>
                    doi: {p.doi}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                {p.type}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

// EDUCATION & EXPERIENCE
const EducationSection = () => (
  <section id="education" style={sectionStyles.wrap}>
    <div style={sectionStyles.inner}>
      <SectionEyebrow num="04">Education · Trajectory</SectionEyebrow>
      <h2 style={{ ...sectionStyles.h2, marginBottom: 56 }}>
        Prep classes, then<br/>
        Grenoble, KTH, Toulouse.
      </h2>
      {EDUCATION.map((e, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: 24,
          padding: '22px 0', borderTop: '1px solid var(--rule)',
          alignItems: 'baseline',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-mute)' }}>{e.year}</span>
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400, lineHeight: 1.3 }}>{e.degree}</div>
          <div style={{ fontSize: 14, color: 'var(--fg-soft)' }}>
            {e.where}
            {e.note && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', marginTop: 4 }}>{e.note}</div>}
          </div>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--rule)' }} />

      {/* Skills strip */}
      <div style={{ marginTop: 80 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 20 }}>
          Tools of the trade
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 40px' }}>
          {[
            ['Languages', SKILLS.languages],
            ['Libraries', SKILLS.libraries],
            ['Tools', SKILLS.tools],
            ['Spoken', SKILLS.spoken],
          ].map(([label, items]) => (
            <div key={label} style={{ padding: '16px 0', borderTop: '1px dotted var(--rule)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 8 }}>{label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}>
                {items.map(s => (
                  <span key={s} style={{ fontSize: 14, color: 'var(--fg-soft)' }}>
                    {s}<span style={{ color: 'var(--fg-mute)' }}> · </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// TALKS + TEACHING side by side
const TalksTeaching = () => (
  <section id="talks" style={sectionStyles.wrap}>
    <div style={sectionStyles.inner}>
      <SectionEyebrow num="05">Teaching · Talks</SectionEyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 32, marginBottom: 28, fontWeight: 400 }}>
            Teaching
          </h3>
          {TEACHING.map((t, i) => (
            <div key={i} style={{
              padding: '22px 0', borderTop: '1px solid var(--rule)',
              display: 'grid', gridTemplateColumns: '90px 1fr 60px', gap: 20,
              alignItems: 'baseline',
            }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-mute)' }}>{t.year}</span>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 400 }}>{t.what}</div>
                <div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 4 }}>{t.where}</div>
                {t.desc && <div style={{ fontSize: 14, color: 'var(--fg-soft)', marginTop: 8, maxWidth: 480, lineHeight: 1.55 }}>{t.desc}</div>}
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-mute)', textAlign: 'right' }}>{t.role}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--rule)' }} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 32, marginBottom: 28, fontWeight: 400 }}>
            Talks
          </h3>
          {TALKS.map((t, i) => (
            <ListRow key={i} left={t.year} center={<><div>{t.what}</div><div style={{ fontSize: 13, color: 'var(--fg-mute)', marginTop: 3 }}>{t.where}</div></>} right={t.kind} />
          ))}
          <div style={{ borderTop: '1px solid var(--rule)' }} />
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-mute)', marginTop: 24, lineHeight: 1.7 }}>
            More on the way — the PhD has barely begun.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const ListRow = ({ left, center, right }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16,
    padding: '18px 0', borderTop: '1px solid var(--rule)',
    alignItems: 'baseline',
  }}>
    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-mute)' }}>{left}</span>
    <div style={{ fontSize: 16 }}>{center}</div>
    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}>{right}</span>
  </div>
);

// WRITING
const Writing = () => {
  const [hover, setHover] = React.useState(null);
  if (!WRITING.length) {
    return (
      <section id="writing" style={sectionStyles.wrap}>
        <div style={sectionStyles.inner}>
          <SectionEyebrow num="06">Writing</SectionEyebrow>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48, gap: 40, flexWrap: 'wrap' }}>
            <h2 style={{ ...sectionStyles.h2, marginBottom: 0 }}>Notes in the margin.</h2>
            <Compass size={52} />
          </div>
          <div style={{
            borderTop: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
            padding: '64px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.18em',
            textTransform: 'uppercase', color: 'var(--fg-mute)',
          }}>
            — nothing here yet · first essay coming soon —
          </div>
        </div>
      </section>
    );
  }
  return (
  <section id="writing" style={sectionStyles.wrap}>
    <div style={sectionStyles.inner}>
      <SectionEyebrow num="06">Writing</SectionEyebrow>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 48, gap: 40, flexWrap: 'wrap' }}>
        <h2 style={{ ...sectionStyles.h2, marginBottom: 0 }}>Notes in the margin.</h2>
        <Compass size={52} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0, borderTop: '1px solid var(--rule)' }}>
        {WRITING.map((w, i) => (
          <a key={i} href="#"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{
              padding: '28px 32px 28px 0',
              borderBottom: '1px solid var(--rule)',
              borderRight: i % 2 === 0 ? '1px solid var(--rule)' : 'none',
              paddingLeft: i % 2 === 1 ? 32 : 0,
              display: 'block', transition: 'background .25s, padding-top .25s',
              background: hover === i ? 'var(--rule-soft)' : 'transparent',
              paddingTop: hover === i ? 36 : 28,
            }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em', color: 'var(--fg-mute)', textTransform: 'uppercase', marginBottom: 8 }}>
              {w.date} · {w.kind} · {w.len}
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 26, lineHeight: 1.25, fontWeight: 400 }}>
              {w.title} <ArrowUR size={14} />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
  );
};

// PERSONAL — books, music, photo
const Personal = () => (
  <section id="personal" style={sectionStyles.wrap}>
    <div style={sectionStyles.inner}>
      <SectionEyebrow num="07">A personal index</SectionEyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
        <div>
          <h2 style={{ ...sectionStyles.h2, marginBottom: 24 }}>
            Outside the lab,<br/>
            mostly books, records,<br/>
            and long walks.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--fg-soft)', maxWidth: 480, lineHeight: 1.6 }}>
            I'm convinced that the way we think about atmospheric instability is a little easier after a Steinbeck novel and a Fleetwood Mac record. Here's the current shelf.
          </p>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.9 }}>
          <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 12 }}>
            ✦ On the nightstand
          </div>
          {READING.map((b, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 0', borderBottom: '1px dotted var(--rule)', gap: 16,
            }}>
              <span>
                <span style={{
                  color: b.state === 'reading' ? 'var(--accent)' : 'var(--fg)',
                  fontStyle: b.state === 'reading' ? 'italic' : 'normal'
                }}>{b.title}</span>
                <span style={{ color: 'var(--fg-mute)' }}> · {b.author}</span>
              </span>
              <span style={{ color: 'var(--fg-mute)', fontSize: 11 }}>
                {b.state === 'reading' ? 'reading' : '✓'}
              </span>
            </div>
          ))}
          <div style={{ height: 32 }} />
          <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--fg-mute)', marginBottom: 12 }}>
            ♪ On the turntable
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {LISTENING.map(a => (
              <span key={a} style={{ color: 'var(--fg-soft)' }}>
                {a}<span style={{ color: 'var(--fg-mute)' }}> · </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 72 }}>
        {[
          { src: 'photos/montreux.jpg', caption: 'Montreux · Switzerland' },
          { src: 'photos/tetouan.jpg', caption: 'Tétouan · Morocco' },
          { src: 'photos/barcelona.jpg', caption: 'Barcelona · Spain' },
          { src: 'photos/lucerne.jpg', caption: 'Lucerne · Switzerland' },
        ].map((p, i) => (
          <figure key={i} style={{ margin: 0, transition: 'transform .3s' }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
              const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
              e.currentTarget.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'perspective(700px) rotateX(0) rotateY(0)'; }}>
            <div style={{
              aspectRatio: '4/5',
              border: '1px solid var(--rule)',
              overflow: 'hidden',
              background: 'var(--rule-soft)',
            }}>
              <img src={p.src} alt={p.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: 'saturate(.95)', transition: 'filter .3s, transform .6s' }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'saturate(1.1)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = 'saturate(.95)'; e.currentTarget.style.transform = 'scale(1)'; }}
              />
            </div>
            <figcaption style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-mute)', marginTop: 8, letterSpacing: '.08em' }}>
              fig. {String(i+1).padStart(2, '0')} · {p.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

// CONTACT / FOOTER
const Contact = () => (
  <section id="contact" style={{ ...sectionStyles.wrap, borderBottom: 'none', paddingBottom: 80 }}>
    <div style={sectionStyles.inner}>
      <SectionEyebrow num="08">Contact</SectionEyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, alignItems: 'end' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--display)', fontWeight: 300,
            fontSize: 'clamp(40px, 6vw, 88px)', lineHeight: 1.02,
            letterSpacing: '-0.025em',
          }}>
            Say hi,<br/>
            or send a paper<br/>
            worth arguing about.
          </h2>
          <a href={`mailto:${PROFILE.email}`} style={{
            display: 'inline-block', marginTop: 32,
            fontFamily: 'var(--display)', fontSize: 28, fontStyle: 'italic',
            color: 'var(--accent)', borderBottom: '1px solid var(--accent)',
            paddingBottom: 4,
          }}>
            {PROFILE.email}
          </a>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
          {PROFILE.links.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '16px 0', borderTop: '1px solid var(--rule)',
              alignItems: 'center',
            }} className="hover-accent">
              <span>{l.label}</span>
              <ArrowUR />
            </a>
          ))}
          <div style={{ borderTop: '1px solid var(--rule)' }} />
        </div>
      </div>

      <div style={{
        marginTop: 120, display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em',
        color: 'var(--fg-mute)', textTransform: 'uppercase', flexWrap: 'wrap', gap: 16,
      }}>
        <span>© {new Date().getFullYear()} Younes Essafouri</span>
        <span>Composed in Toulouse · set in Fraunces & Inter</span>
        <span>v. 1.0 — {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  </section>
);

// NAV
const Nav = ({ theme, toggleTheme }) => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [
    ['About', '#about'], ['Research', '#research'], ['Publications', '#publications'],
    ['Education', '#education'], ['Teaching', '#talks'], ['Writing', '#writing'], ['Personal', '#personal'], ['Contact', '#contact'],
  ];
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? '14px 32px' : '22px 32px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: scrolled ? 'color-mix(in oklab, var(--bg) 88%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--rule)' : '1px solid transparent',
      transition: 'all .3s ease',
    }}>
      <a href="#" style={{
        fontFamily: 'var(--display)', fontSize: 20, letterSpacing: '-0.01em',
        fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          display: 'inline-block', width: 10, height: 10,
          background: 'var(--accent)', borderRadius: '50%',
        }} />
        Y. Essafouri
      </a>
      <div style={{
        display: 'flex', gap: 4, alignItems: 'center',
        fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.04em',
      }}>
        <div style={{ display: 'flex', gap: 4 }} className="nav-links">
          {links.map(([l, h]) => (
            <a key={l} href={h} style={{
              padding: '8px 12px', borderRadius: 6, color: 'var(--fg-soft)',
            }} className="nav-link">
              {l}
            </a>
          ))}
        </div>
        <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
          {theme === 'dark' ? '☾' : '☀'}
        </button>
      </div>
    </nav>
  );
};

Object.assign(window, { About, Research, Publications, EducationSection, TalksTeaching, Writing, Personal, Contact, Nav });
