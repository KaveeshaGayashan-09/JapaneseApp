import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import ConfirmModal from '../../components/ConfirmModal'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit3, Play, Video, X } from 'lucide-react'
import { format } from 'date-fns'

const EMPTY = { title:'', description:'', scheduledAt:'', durationMinutes:60 }

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)  // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const fetchSessions = () => {
    api.get('/admin/sessions').then(({ data }) => setSessions(data)).finally(() => setLoading(false))
  }
  useEffect(fetchSessions, [])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => { setForm(EMPTY); setEditTarget(null); setModal('form') }
  const openEdit   = (s) => {
    setEditTarget(s)
    setForm({
      title: s.title, description: s.description || '',
      scheduledAt: s.scheduledAt?.slice(0,16) || '',
      durationMinutes: s.durationMinutes,
    })
    setModal('form')
  }

  const save = async e => {
    e.preventDefault()
    if (!form.title || !form.scheduledAt) { toast.error('Title and time are required'); return }
    setSaving(true)
    try {
      const payload = { ...form, scheduledAt: form.scheduledAt + ':00' }
      if (editTarget) await api.put(`/admin/sessions/${editTarget.id}`, payload)
      else            await api.post('/admin/sessions', payload)
      toast.success(editTarget ? 'Session updated' : 'Session created + Zoom meeting generated 🎥')
      setModal(null); fetchSessions()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save session')
    } finally { setSaving(false) }
  }

  const startSession = async (id) => {
    await api.post(`/admin/sessions/${id}/start`)
    toast.success('Session is now LIVE — students can join!')
    fetchSessions()
  }

  const deleteSession = async (id) => {
    await api.delete(`/admin/sessions/${id}`)
    toast.success('Session deleted')
    setConfirm(null); fetchSessions()
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop:'32px', paddingBottom:'60px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px', marginBottom:'28px' }}>
            <div className="page-header" style={{ margin:0 }}>
              <h1>Session Manager</h1>
              <p style={{ color:'var(--text-secondary)' }}>Create Japanese lessons and manage Zoom meetings</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> New Session
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Scheduled</th>
                  <th>Duration</th>
                  <th>Zoom</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>Loading…</td></tr>
                  : sessions.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No sessions yet. Create one!</td></tr>
                    : sessions.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.title}</div>
                          {s.description && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.description.slice(0,60)}…</div>}
                        </td>
                        <td>{s.scheduledAt ? format(new Date(s.scheduledAt),'MMM d, yyyy · h:mm a') : '—'}</td>
                        <td>{s.durationMinutes} min</td>
                        <td>
                          {s.zoomMeetingId
                            ? <span className="badge badge-verified">✅ Ready</span>
                            : <span className="badge badge-pending">⏳ Pending</span>
                          }
                        </td>
                        <td>
                          {s.ended   && <span className="badge badge-rejected">Ended</span>}
                          {s.active  && !s.ended && <span className="badge badge-verified">🔴 LIVE</span>}
                          {!s.active && !s.ended && <span className="badge badge-pending">Scheduled</span>}
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                            {!s.active && !s.ended && (
                              <button className="btn btn-success btn-sm" onClick={() => startSession(s.id)}>
                                <Play size={13} /> Start
                              </button>
                            )}
                            {s.zoomStartUrl && (
                              <a href={s.zoomStartUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                <Video size={13} /> Host
                              </a>
                            )}
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>
                              <Edit3 size={13} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => setConfirm(s)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" style={{ maxWidth:'540px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 className="modal-title">{editTarget ? 'Edit Session' : 'New Session'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}><X size={15}/></button>
            </div>
            <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="e.g., N3 Grammar Deep Dive" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" name="description" value={form.description} onChange={handle}
                  placeholder="Session overview, topics covered…" style={{ minHeight:'80px' }}/>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input className="form-input" type="datetime-local" name="scheduledAt" value={form.scheduledAt} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input className="form-input" type="number" name="durationMinutes" value={form.durationMinutes} onChange={handle} min={15} max={480} />
                </div>
              </div>
              {!editTarget && (
                <div className="alert alert-info" style={{ fontSize:'0.82rem' }}>
                  🎥 A Zoom meeting will be created automatically when you save.
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editTarget ? 'Update Session' : 'Create + Generate Zoom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Delete Session"
          message={`Delete "${confirm.title}"? The Zoom meeting will also be deleted.`}
          danger onConfirm={() => deleteSession(confirm.id)} onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}
