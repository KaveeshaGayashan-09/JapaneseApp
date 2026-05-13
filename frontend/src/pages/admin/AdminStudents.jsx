import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Search, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminStudents() {
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [all, setAll] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null) // { type, student }

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/students/pending'),
      api.get('/admin/students'),
    ]).then(([p, a]) => {
      setPending(p.data)
      setAll(a.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const doSearch = async () => {
    const { data } = await api.get(`/admin/students?q=${search}`)
    setAll(data)
  }

  const verify = async (id) => {
    await api.patch(`/admin/students/${id}/verify`)
    toast.success('Student verified ✅')
    fetchData()
  }
  const reject = async (id) => {
    await api.patch(`/admin/students/${id}/reject`)
    toast.success('Student rejected')
    fetchData()
  }
  const remove = async (id) => {
    await api.delete(`/admin/students/${id}`)
    toast.success('Student deleted')
    setConfirm(null)
    fetchData()
  }

  const shown = tab === 'pending' ? pending : all

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop:'32px', paddingBottom:'60px' }}>
          <div className="page-header">
            <h1>Student Management</h1>
            <p style={{ color:'var(--text-secondary)' }}>Review registrations and manage all students</p>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
            {[['pending',`Pending (${pending.length})`],['all','All Students']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`btn ${tab===key ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
                {label}
              </button>
            ))}
          </div>

          {/* Search (all tab) */}
          {tab === 'all' && (
            <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
              <input className="form-input" placeholder="Search by name or email…"
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                style={{ maxWidth:'380px' }} />
              <button className="btn btn-secondary btn-sm" onClick={doSearch}>
                <Search size={14} /> Search
              </button>
            </div>
          )}

          {/* Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>JLPT</th>
                  <th>Country</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>Loading…</td></tr>
                  : shown.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No students found</td></tr>
                    : shown.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.name}</div>
                          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.email}</div>
                        </td>
                        <td>{s.jlptLevel || '—'}</td>
                        <td>{s.country || '—'}</td>
                        <td>{s.createdAt ? format(new Date(s.createdAt),'MMM d, yyyy') : '—'}</td>
                        <td><StatusBadge status={s.status} /></td>
                        <td>
                          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                            {s.status !== 'VERIFIED' &&
                              <button className="btn btn-success btn-sm" onClick={() => verify(s.id)}>
                                <CheckCircle size={13} /> Approve
                              </button>
                            }
                            {s.status !== 'REJECTED' &&
                              <button className="btn btn-ghost btn-sm" onClick={() => reject(s.id)}>
                                <XCircle size={13} /> Reject
                              </button>
                            }
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setConfirm({ type:'delete', student:s })}>
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

      {confirm?.type === 'delete' && (
        <ConfirmModal
          title="Delete Student"
          message={`Permanently delete ${confirm.student.name}? This cannot be undone.`}
          danger
          onConfirm={() => remove(confirm.student.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  )
}
