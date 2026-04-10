export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header glass-card">
      <div>
        <p className="eyebrow">maintenance workspace</p>
        <h2>{title}</h2>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </div>
  )
}
