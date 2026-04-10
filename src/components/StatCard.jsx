import React from "react";
export default function StatCard({ label, value, helper, typeClass = "" }) {
  return (
    <div className="stat-card glass-card">
      <p className={`stat-label ${typeClass}`}>{label}</p>
      <h3>{value}</h3>
      {helper && (
        <p className="muted mt-1" style={{ fontSize: "0.85rem" }}>
          {helper}
        </p>
      )}
    </div>
  );
}
