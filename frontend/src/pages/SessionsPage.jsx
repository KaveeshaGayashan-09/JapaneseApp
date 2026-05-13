import { useEffect, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { Video, X } from 'lucide-react'
import { format } from 'date-fns'

const localizer = momentLocalizer(moment)

export default function SessionsPage() {
  const [sessions, setSessions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/student/sessions').then(({ data }) => setSessions(data))
      .finally(() => setLoading(false))
  }, [])

  const events = sessions.map(s => ({
    id: s.id, title: s.title,
    start: new Date(s.scheduledAt),
    end: new Date(new Date(s.scheduledAt).getTime() + (s.durationMinutes || 60) * 60000),
    resource: s,
  }))

  const eventStyle = (event) => ({
    style: {
      background: event.resource.active
        ? 'linear-gradient(135deg,#10b981,#059669)'
        : 'linear-gradient(135deg,var(--crimson),var(--crimson-dark))',
      border: 'none', borderRadius: '4px', fontSize: '0.78rem',
    }
  })

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
          <div className="page-header">
            <h1>Session Calendar</h1>
            <p style={{ color:'var(--text-secondary)' }}>
              All scheduled Japanese lessons · Click an event for details
            </p>
          </div>

          <div className="glass" style={{ padding:'24px', minHeight:'580px' }}>
            {loading
              ? <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>Loading calendar…</div>
              : (
                <Calendar
                  localizer={localizer} events={events}
                  startAccessor="start" endAccessor="end"
                  style={{ height: 540, background:'transparent' }}
                  eventPropGetter={eventStyle}
                  onSelectEvent={e => setSelected(e.resource)}
                />
              )
            }
          </div>

          {/* Session Detail Modal */}
          {selected && (
            <div className="modal-overlay" onClick={() => setSelected(null)}>
              <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <h2 className="modal-title">{selected.title}</h2>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={16}/></button>
                </div>

                {selected.active && (
                  <div className="session-live" style={{ margin:'8px 0' }}>
                    <div className="live-dot" /> LIVE NOW
                  </div>
                )}

                <div style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:1.7, marginTop:'8px' }}>
                  <p>📅 {format(new Date(selected.scheduledAt), 'EEEE, MMMM d yyyy')}</p>
                  <p>⏰ {format(new Date(selected.scheduledAt), 'h:mm a')} · {selected.durationMinutes} minutes</p>
                  {selected.zoomPasscode && <p>🔑 Passcode: <code>{selected.zoomPasscode}</code></p>}
                  {selected.description && <p style={{ marginTop:'10px' }}>{selected.description}</p>}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                  {selected.active
                    ? <a href={selected.zoomJoinUrl} target="_blank" rel="noreferrer" className="btn btn-success">
                        <Video size={15} /> Join Meeting
                      </a>
                    : <button className="btn btn-ghost" disabled>Not started yet</button>
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
