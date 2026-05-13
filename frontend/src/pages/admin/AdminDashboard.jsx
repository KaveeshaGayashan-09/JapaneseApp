import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Users, Calendar, Clock, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents:0, pendingStudents:0, activeSessions:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false))
  }, [])

  const cards = [
    { icon: <Users size={22}/>, label:'Total Students', value: stats.totalStudents, color:'var(--purple-light)', to:'/admin/students' },
    { icon: <Clock size={22}/>, label:'Pending Approval', value: stats.pendingStudents, color:'var(--warning)', to:'/admin/students' },
    { icon: <Calendar size={22}/>, label:'Active Sessions', value: stats.activeSessions, color:'var(--success)', to:'/admin/sessions' },
  ]

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop:'32px', paddingBottom:'60px' }}>
          <div className="page-header">
            <h1>Admin Dashboard</h1>
            <p style={{ color:'var(--text-secondary)' }}>
              Welcome back · Nihongo Hub administration panel
            </p>
          </div>

          <div className="stat-cards" style={{ marginBottom:'36px' }}>
            {cards.map(c => (
              <Link key={c.label} to={c.to} style={{ textDecoration:'none' }}>
                <div className="stat-card glass-hover" style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{
                    width:52, height:52, borderRadius:'var(--radius)',
                    background:`rgba(${c.color === 'var(--success)' ? '16,185,129' : '255,255,255'},0.08)`,
                    border:`1px solid rgba(255,255,255,0.1)`,
                    display:'flex', alignItems:'center', justifyContent:'center', color:c.color, flexShrink:0,
                  }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="stat-card-value" style={{ color:c.color, fontSize:'2rem', fontWeight:800 }}>
                      {loading ? '—' : c.value}
                    </div>
                    <div className="stat-card-label">{c.label}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Links */}
          <div className="page-header"><h2 style={{ fontSize:'1.2rem', fontWeight:700 }}>Quick Actions</h2></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'14px' }}>
            {[
              { to:'/admin/students', icon:'👥', label:'Manage Students', sub:'Review & verify registrations' },
              { to:'/admin/sessions', icon:'🎥', label:'Manage Sessions', sub:'Create & start Zoom meetings' },
              { to:'/admin/announcements', icon:'📢', label:'Announcements', sub:'Post updates to students' },
            ].map(q => (
              <Link key={q.to} to={q.to} style={{ textDecoration:'none' }}>
                <div className="feature-card" style={{ cursor:'pointer' }}>
                  <div className="feature-icon">{q.icon}</div>
                  <h3 style={{ fontSize:'0.95rem' }}>{q.label}</h3>
                  <p style={{ fontSize:'0.82rem' }}>{q.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
