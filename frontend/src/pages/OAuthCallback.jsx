import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')
    if (!token) { navigate('/login'); return }

    // Store tokens temporarily so axios can use them
    useAuthStore.setState({ token, refreshToken })

    api.get('/auth/me').then(({ data }) => {
      setAuth(token, refreshToken, data, data.status === 'PENDING' && !data.jlptLevel)
      toast.success(`Welcome, ${data.name}!`)

      if (data.role === 'ADMIN') navigate('/admin')
      else if (!data.jlptLevel) navigate('/register/complete')
      else navigate('/dashboard')
    }).catch(() => {
      toast.error('Authentication failed')
      navigate('/login')
    })
  }, [])

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:'16px' }}>🌸</div>
        <p style={{ color:'var(--text-secondary)' }}>Completing sign in…</p>
      </div>
    </div>
  )
}
