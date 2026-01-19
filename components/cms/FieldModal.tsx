import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Type, AlignLeft, FileText, Hash, Percent, ToggleLeft, Calendar, Clock, Clock3, Mail, Lock, Fingerprint, Braces, List, Image, Link2, Component, Layers } from 'lucide-react'
import { FieldType, FIELD_TYPE_CONFIG } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

interface FieldModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: FieldType) => void
}

const FIELD_ICONS: Record<FieldType, React.ElementType> = {
  text: Type,
  textarea: AlignLeft,
  richtext: FileText,
  number: Hash,
  decimal: Percent,
  boolean: ToggleLeft,
  date: Calendar,
  datetime: Clock,
  time: Clock3,
  email: Mail,
  password: Lock,
  uid: Fingerprint,
  json: Braces,
  enumeration: List,
  media: Image,
  relation: Link2,
  component: Component,
  dynamiczone: Layers,
}

const fieldCategories = [
  {
    name: "Text",
    types: ["text", "textarea", "richtext", "email", "password", "uid"] as FieldType[],
  },
  {
    name: "Number",
    types: ["number", "decimal"] as FieldType[],
  },
  {
    name: "Date & Time",
    types: ["date", "datetime", "time"] as FieldType[],
  },
  {
    name: "Other",
    types: ["boolean", "enumeration", "json", "media"] as FieldType[],
  },
  {
    name: "Components",
    types: ["component", "dynamiczone"] as FieldType[],
  },
  {
    name: "Relation",
    types: ["relation"] as FieldType[],
  },
]

const FieldModal: React.FC<FieldModalProps> = ({ isOpen, onClose, onSelect }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-gray-900">Select Field Type</Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 mt-1">
                      Choose the type of field you want to add to your schema.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500" aria-label="Close">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {fieldCategories.map((category) => (
                      <div key={category.name}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
                          {category.name}
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {category.types.map((type) => {
                            const config = FIELD_TYPE_CONFIG[type]
                            const Icon = FIELD_ICONS[type]
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => onSelect(type)}
                                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                              >
                                <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {config.label}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                    {config.description}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default FieldModal
