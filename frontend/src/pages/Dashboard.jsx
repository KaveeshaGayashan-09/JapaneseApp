import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { useAuthStore } from '../stores/authStore'
import api from '../api/axios'
import { Calendar, Clock, Video } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isVerified = user?.status === 'VERIFIED'
    const promises = [
      api.get('/student/announcements').catch(() => ({ data: [] })),
      isVerified ? api.get('/student/sessions/upcoming').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]
    Promise.all(promises).then(([ann, sess]) => {
      setAnnouncements(ann.data)
      setSessions(sess.data)
    }).finally(() => setLoading(false))
  }, [])

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'
  const isPending  = user?.status === 'PENDING'
  const isVerified = user?.status === 'VERIFIED'

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
          {/* Announcements */}
          {announcements.length > 0 && (
            <div style={{ marginBottom: '24px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {announcements.map(a => (
                <div key={a.id} className="alert alert-info">
                  📢 <div><strong>{a.title}</strong><br />{a.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Profile Card */}
          <div className="profile-card" style={{ marginBottom: '28px' }}>
            <div className="profile-avatar">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} />
                : initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                <div className="profile-name">{user?.name}</div>
                <StatusBadge status={user?.role === 'ADMIN' ? 'ADMIN' : user?.status} />
              </div>
              <div className="profile-email">{user?.email}</div>
              {user?.jlptLevel && user.jlptLevel !== 'NONE' && (
                <div style={{ marginTop:'8px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <span className="badge" style={{ background:'rgba(240,180,41,0.1)', color:'var(--gold)', border:'1px solid rgba(240,180,41,0.3)' }}>
                    JLPT {user.jlptLevel}
                  </span>
                  {user.country && <span className="badge badge-pending">{user.country}</span>}
                </div>
              )}
            </div>
            {isPending && (
              <div className="alert alert-warning" style={{ maxWidth: '280px' }}>
                ⏳ Your account is awaiting admin verification before you can access sessions.
              </div>
            )}
          </div>

          {/* Pending message */}
          {isPending && (
            <div className="glass" style={{ padding:'40px', textAlign:'center', marginBottom:'28px' }}>
              <div style={{ fontSize:'3rem', marginBottom:'12px' }}>⏳</div>
              <h2 style={{ fontSize:'1.3rem', fontWeight:700, marginBottom:'8px' }}>Account Pending Verification</h2>
              <p style={{ color:'var(--text-secondary)', maxWidth:'420px', margin:'0 auto' }}>
                An admin will review your profile and grant you access to live sessions.
                You'll be notified once approved.
              </p>
            </div>
          )}

          {/* Upcoming sessions */}
          {isVerified && (
            <div>
              <div className="page-header">
                <h2 style={{ fontSize:'1.3rem', fontWeight:700 }}>Upcoming Sessions</h2>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>Your next scheduled Japanese lessons</p>
              </div>

              {loading
                ? <p style={{ color:'var(--text-muted)' }}>Loading sessions…</p>
                : sessions.length === 0
                  ? (
                    <div className="glass" style={{ padding:'40px', textAlign:'center' }}>
                      <div style={{ fontSize:'2.5rem' }}>📅</div>
                      <p style={{ color:'var(--text-muted)', marginTop:'10px' }}>No upcoming sessions. Check back soon!</p>
                    </div>
                  )
                  : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {sessions.slice(0,6).map(s => (
                        <div key={s.id} className="session-card">
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
                            <div>
                              <div className="session-title">{s.title}</div>
                              <div className="session-meta">
                                <span><Calendar size={13} style={{ display:'inline', marginRight:4 }} />
                                  {format(new Date(s.scheduledAt), 'EEE, MMM d yyyy')}</span>
                                <span><Clock size={13} style={{ display:'inline', marginRight:4 }} />
                                  {format(new Date(s.scheduledAt), 'h:mm a')} · {s.durationMinutes}min</span>
                              </div>
                              {s.description && (
                                <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', marginTop:'6px' }}>{s.description}</p>
                              )}
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>
                              {s.active
                                ? (
                                  <a href={s.zoomJoinUrl} target="_blank" rel="noreferrer"
                                    className="btn btn-success btn-sm">
                                    <Video size={14} /> Join Live
                                  </a>
                                ) : (
                                  <button className="btn btn-ghost btn-sm" disabled>
                                    <Video size={14} /> Not started yet
                                  </button>
                                )
                              }
                              {s.active && <span className="session-live"><div className="live-dot" />LIVE NOW</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          )}
        </div>
      </div>
    </>
  )
}
