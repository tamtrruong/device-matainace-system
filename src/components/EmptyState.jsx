export default function EmptyState({ title, message }) {
  return (
    <div className="glass-card empty-state">
      <h3>{title}</h3>
      <p className="muted">{message}</p>
    </div>
  )
}
