import React from "react";

const Table = ({
  data = [],
  columns = [],
  loading = false,
  className = "",
}) => {
  return (
    <div className={`overflow-x-auto ${className} max-h-[70vh] relative`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="sticky top-0 left-0 bg-white dark:bg-gray-900 z-10">
          <tr className="shadow-sm shadow-gray-300 dark:shadow-black">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available
        </div>
      )}
    </div>
  );
};

export default Table;
