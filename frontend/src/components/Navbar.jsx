import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LogOut, BookOpen } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const adminLinks = [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/sessions', label: 'Sessions' },
    { to: '/admin/announcements', label: 'Announcements' },
  ]
  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Sessions' },
  ]
  const links = isAdmin() ? adminLinks : studentLinks

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          日本語 <span>Nihongo Hub</span>
        </Link>

        {user && (
          <div className="navbar-links">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`nav-link ${pathname === l.to ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
            <div className="nav-avatar" title={user.name}>
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>
                : user.name?.[0]?.toUpperCase()}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        )}

        {!user && (
          <Link to="/login" className="btn btn-primary btn-sm">
            <BookOpen size={15} /> Get Started
          </Link>
        )}
      </div>
    </nav>
  )
}
