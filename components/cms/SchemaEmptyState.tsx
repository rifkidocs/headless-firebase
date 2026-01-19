import React from 'react'

interface SchemaEmptyStateProps {
  onAddField: () => void
}

const SchemaEmptyState: React.FC<SchemaEmptyStateProps> = ({ onAddField }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">No fields yet</h3>
        <p className="mt-1 text-sm text-gray-500">Click &quot;Add Field&quot; to start building your schema.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onAddField}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Field
          </button>
        </div>
      </div>
    </div>
  )
}

export default SchemaEmptyState
