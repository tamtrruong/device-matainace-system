export default function Modal({ open, title, children, onClose }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="ghost-btn" onClick={onClose}>Đóng</button>
        </div>
        {children}
      </div>
    </div>
  )
}
