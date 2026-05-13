export default function StatusBadge({ status }) {
  const map = {
    PENDING:  'badge-pending',
    VERIFIED: 'badge-verified',
    REJECTED: 'badge-rejected',
    ADMIN:    'badge-admin',
  }
  const dots = { PENDING:'🟡', VERIFIED:'🟢', REJECTED:'🔴', ADMIN:'🔷' }
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      {dots[status]} {status}
    </span>
  )
}
