import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 8}s`,
  duration: `${6 + Math.random() * 6}s`,
  size: `${8 + Math.random() * 8}px`,
}))

const FEATURES = [
  { icon: '🎌', title: 'Live Zoom Sessions', desc: 'Join real-time Japanese lessons with certified instructors via Zoom.' },
  { icon: '📚', title: 'JLPT Structured Path', desc: 'From N5 beginner to N1 advanced — a clear curriculum for every level.' },
  { icon: '✅', title: 'Expert-Verified Enrolment', desc: 'Admin-reviewed registration ensures a premium learning community.' },
  { icon: '📅', title: 'Flexible Scheduling', desc: 'Browse the interactive calendar and join sessions that fit your timezone.' },
  { icon: '🎴', title: 'Cultural Immersion', desc: 'Learn kanji, grammar, and Japanese culture through expert-curated content.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Get instant alerts when new sessions are scheduled by admins.' },
]

const STATS = [
  { value: '500+', label: 'Students Enrolled' },
  { value: '1,200+', label: 'Sessions Held' },
  { value: 'N5–N1', label: 'JLPT Coverage' },
  { value: '98%', label: 'Satisfaction Rate' },
]

export default function LandingPage() {
  const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="sakura-container">
            {PETALS.map(p => (
              <div key={p.id} className="petal" style={{
                left: p.left, width: p.size, height: p.size,
                animationDelay: p.delay, animationDuration: p.duration,
              }} />
            ))}
          </div>

          <div className="hero-content animate-fade-up">
            <div className="hero-eyebrow">🌸 Japanese Language Education Platform</div>
            <span className="hero-jp jp-text">日本語を学ぼう</span>
            <h1>Master Japanese<br />with Expert Tutors</h1>
            <p className="hero-sub">
              Join live Zoom sessions, follow a structured JLPT path, and become
              part of an exclusive Japanese learning community.
            </p>
            <div className="hero-cta">
              <a href={`${BACKEND}/oauth2/authorization/google`} className="btn btn-primary btn-lg">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </a>
              <a href={`${BACKEND}/oauth2/authorization/facebook`} className="btn oauth-facebook btn-lg">
                <svg width="20" height="20" fill="#5b9ef4" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: '0 24px' }}>
          <div className="container">
            <div className="stats-bar">
              {STATS.map(s => (
                <div key={s.label} className="stat-item">
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 24px' }}>
          <div className="container">
            <div className="text-center mb-4">
              <div className="section-label">Why Nihongo Hub</div>
              <h2 className="section-title">Everything you need to<br />master Japanese</h2>
              <p className="section-sub">A complete ecosystem for serious Japanese learners.</p>
            </div>
            <div className="features-grid">
              {FEATURES.map(f => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 24px', background: 'var(--ink-2)' }}>
          <div className="container text-center">
            <span className="hero-jp jp-text" style={{ fontSize: '1.5rem', display:'block', marginBottom:'16px' }}>
              一緒に学びましょう
            </span>
            <h2 className="section-title">Ready to start your journey?</h2>
            <p className="section-sub" style={{ maxWidth: '480px', margin: '8px auto 32px' }}>
              Register today, get verified by our admin team, and join live Japanese sessions.
            </p>
            <a href={`${BACKEND}/oauth2/authorization/google`} className="btn btn-primary btn-lg">
              🌸 Join Nihongo Hub — It's Free
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', textAlign:'center' }}>
          <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>
            © 2025 Nihongo Hub · <span className="jp-text">日本語ハブ</span> · Built with ❤️ for Japanese learners worldwide
          </p>
        </footer>
      </main>
    </>
  )
}
