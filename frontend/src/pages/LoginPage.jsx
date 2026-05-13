import { Link } from 'react-router-dom'

export default function LoginPage() {
  const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 30% 50%, rgba(220,20,60,0.1) 0%, transparent 60%), var(--ink)',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div className="text-center mb-4" style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
          <h1 style={{ fontFamily: "'Noto Serif JP', serif", fontSize: '1.8rem', color: 'var(--crimson)' }}>
            日本語ハブ
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Sign in to continue your Japanese learning journey
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '36px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>
            Choose your preferred sign-in method
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href={`${BACKEND}/oauth2/authorization/google`} className="oauth-btn oauth-google">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </a>

            <a href={`${BACKEND}/oauth2/authorization/facebook`} className="oauth-btn oauth-facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </a>
          </div>

          <div className="divider" style={{ margin: '24px 0' }}>secure OAuth 2.0</div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.6 }}>
            By signing in you agree to our terms. New students are placed in a
            <strong style={{ color: 'var(--warning)' }}> Pending</strong> state until
            verified by an admin.
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Link to="/" style={{ color: 'var(--crimson)', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
