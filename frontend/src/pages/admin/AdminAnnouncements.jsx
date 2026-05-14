import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminAnnouncements() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ title:'', content:'' })
  const [saving, setSaving] = useState(false)

  const fetch = () => api.get('/admin/announcements')
                          .then(({ data }) => {
                            // Only set items if the data is an array
                            setItems(Array.isArray(data) ? data : []);
                          })
                          .catch(err => {
                            console.error("Fetch error:", err);
                            setItems([]); // Reset to empty array on error to prevent crash
                          });

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.title || !form.content) { toast.error('Title and content required'); return }
    setSaving(true)
    await api.post('/admin/announcements', { ...form, active: true })
    toast.success('Announcement published 📢')
    setForm({ title:'', content:'' })
    fetch()
    setSaving(false)
  }

  const remove = async (id) => {
    await api.delete(`/admin/announcements/${id}`)
    toast.success('Announcement removed')
    fetch()
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop:'32px', paddingBottom:'60px', maxWidth:'760px' }}>
          <div className="page-header">
            <h1>Announcements</h1>
            <p style={{ color:'var(--text-secondary)' }}>Post site-wide messages visible to all verified students</p>
          </div>

          {/* Create Form */}
          <div className="glass" style={{ padding:'28px', marginBottom:'28px' }}>
            <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'16px' }}>New Announcement</h2>
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="e.g., New N2 session added!" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" name="content" value={form.content} onChange={handle}
                  placeholder="Write your announcement here…" style={{ minHeight:'100px' }} />
              </div>
              <div>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  <Plus size={15} /> {saving ? 'Publishing…' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {items.length === 0
              ? <p style={{ color:'var(--text-muted)', textAlign:'center' }}>No announcements yet.</p>
              : items.map(a => (
                <div key={a.id} className="glass" style={{ padding:'20px', display:'flex', gap:'16px', alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, marginBottom:'4px' }}>{a.title}</div>
                    <div style={{ color:'var(--text-secondary)', fontSize:'0.88rem', lineHeight:1.6 }}>{a.content}</div>
                    <div style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginTop:'8px' }}>
                      {a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy · h:mm a') : ''}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}
