export default function DataTable({ columns, rows, emptyMessage = 'Không có dữ liệu.' }) {
  return (
    <div className="table-shell glass-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key}>{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows?.length ? rows.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="empty-cell">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
