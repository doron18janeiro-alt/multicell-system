export default function Table({
  columns = [],
  data = [],
  emptyLabel = "Nenhum registro.",
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.length === 0 && (
            <tr>
              <td
                className="px-4 py-6 text-center text-gray-500"
                colSpan={columns.length}
              >
                {emptyLabel}
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr
              key={row.id || JSON.stringify(row)}
              className="hover:bg-gray-50"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
