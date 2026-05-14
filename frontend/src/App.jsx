import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterComplete from './pages/RegisterComplete'
import Dashboard from './pages/Dashboard'
import SessionsPage from './pages/SessionsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminSessions from './pages/admin/AdminSessions'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import ProtectedRoute from './components/ProtectedRoute'
import OAuthCallback from './pages/OAuthCallback'
import { useAuthStore } from './stores/authStore'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a2e', color: '#e8e8f0', border: '1px solid #9d4edd' }
      }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/register/complete" element={
          <ProtectedRoute><RegisterComplete /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/sessions" element={
          <ProtectedRoute requireVerified><SessionsPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute requireAdmin><AdminStudents /></ProtectedRoute>
        } />
        <Route path="/admin/sessions" element={
          <ProtectedRoute requireAdmin><AdminSessions /></ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute requireAdmin><AdminAnnouncements /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
