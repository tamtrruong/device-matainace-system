export default function HeaderBar({ title, subtitle, actions }) {
  return (
    <div className="page-header glass-card">
      <div>
        <p className="eyebrow">system workspace</p>
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
      <div className="header-actions">{actions}</div>
    </div>
  )
}
