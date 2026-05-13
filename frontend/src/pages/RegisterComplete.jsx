import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

const JLPT_OPTIONS = ['NONE','BEGINNER','N5','N4','N3','N2','N1']

export default function RegisterComplete() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    jlptLevel: 'NONE',
    bio: '',
    country: '',
  })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/complete-registration', form)
      setUser(data)
      toast.success('Profile saved! Your account is pending admin approval.')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--ink)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div className="text-center" style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '2.5rem' }}>📝</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '8px' }}>Complete Your Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Tell us about your Japanese level to personalize your experience
          </p>
        </div>

        <div className="glass" style={{ padding: '32px' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Your full name" />
            </div>

            <div className="form-group">
              <label className="form-label">JLPT Level</label>
              <select className="form-select" name="jlptLevel" value={form.jlptLevel} onChange={handle}>
                {JLPT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input className="form-input" name="country" value={form.country} onChange={handle} placeholder="Your country" />
            </div>

            <div className="form-group">
              <label className="form-label">Bio <span style={{ color:'var(--text-muted)' }}>(optional)</span></label>
              <textarea className="form-textarea" name="bio" value={form.bio} onChange={handle}
                placeholder="Tell the instructors a bit about yourself and your Japanese learning goals…" />
            </div>

            <div className="alert alert-warning" style={{ marginTop: '4px' }}>
              ⏳ After submission your account will be reviewed by an admin before you can join sessions.
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Saving…' : '🌸 Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
