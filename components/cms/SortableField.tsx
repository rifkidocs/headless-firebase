import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ChevronDown, Settings2 } from 'lucide-react'
import clsx from 'clsx'
import { FieldType, FIELD_TYPE_CONFIG } from '@/lib/types'

interface SortableFieldProps {
  id: string
  index: number
  field: any
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onRemove: (index: number) => void
  onEdit?: (index: number) => void
  renderSettings: (index: number) => React.ReactNode
  Icon: React.ElementType
}

export const SortableField: React.FC<SortableFieldProps> = ({
  id,
  index,
  field,
  isExpanded,
  onToggleExpand,
  onRemove,
  onEdit,
  renderSettings,
  Icon,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = FIELD_TYPE_CONFIG[field.type as FieldType]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'group relative bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden',
        isDragging && 'z-50 shadow-xl border-blue-500 opacity-50'
      )}
    >
      {/* Field Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => onToggleExpand(id)}
      >
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="p-2 rounded-lg bg-gray-100">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {field.label || "Untitled Field"}
            </span>
            {field.required && (
              <span className="text-xs text-red-500">*</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {config?.label || field.type} • {field.name || "no-key"}
          </p>
        </div>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
             <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    onEdit(index)
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Field"
             >
                <Settings2 className="w-4 h-4" />
             </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(index)
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Field"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <ChevronDown
          className={clsx(
            "w-5 h-5 text-gray-400 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </div>

      {/* Field Settings */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50/50">
          {renderSettings(index)}
        </div>
      )}
    </div>
  )
}
