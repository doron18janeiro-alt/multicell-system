export default function Tabela({
  data = [],
  columns = [],
  loading,
  actions = [],
}) {
  return (
    <div className="border rounded overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-200">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="p-2 border text-left">
                {col.header}
              </th>
            ))}
            {actions.length > 0 && <th className="p-2 border">Ações</th>}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td className="p-4 text-center" colSpan={columns.length + 1}>
                Carregando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className="p-4 text-center" colSpan={columns.length + 1}>
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.accessor} className="border p-2">
                    {row[col.accessor] ?? "-"}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td className="border p-2 space-x-2">
                    {actions.map((act) => (
                      <button
                        key={act.label}
                        className="text-blue-600 underline"
                        onClick={() => act.onClick(row)}
                      >
                        {act.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
