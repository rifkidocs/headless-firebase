import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Save } from 'lucide-react'
import { Field, FieldType, FIELD_TYPE_CONFIG } from '@/lib/types'
import { useForm, Controller } from 'react-hook-form'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

interface FieldConfigModalProps {
  isOpen: boolean
  field: Field | null
  onClose: () => void
  onSave: (field: Field) => void
  collections: { slug: string; label: string }[]
  components: { id: string; displayName: string }[]
}

const FieldConfigModal: React.FC<FieldConfigModalProps> = ({
  isOpen,
  field,
  onClose,
  onSave,
  collections,
  components,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Field>()

  useEffect(() => {
    if (field) {
      reset(field)
    }
  }, [field, reset])

  const onSubmit = (data: Field) => {
    onSave(data)
    onClose()
  }

  const fieldType = watch('type')
  const config = fieldType ? FIELD_TYPE_CONFIG[fieldType as FieldType] : null

  const generateKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^(.)/, (c) => c.toLowerCase());
  };

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
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">
                        Configure Field: {config?.label || 'New Field'}
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-gray-500 mt-1">
                        Set the properties and validation for this field.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500" aria-label="Close">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {/* Basic Settings */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Label</label>
                        <input
                          {...register('label', {
                            required: 'Label is required',
                            onChange: (e) => {
                              const key = watch('name');
                              if (!key || key === generateKey(field?.label || "")) {
                                setValue('name', generateKey(e.target.value));
                              }
                            }
                          })}
                          autoFocus
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="e.g. Article Title"
                        />
                        {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Field Key (API ID)</label>
                        <input
                          {...register('name', { required: 'Key is required' })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                          placeholder="camelCase"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <input
                          {...register('description')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="Help text for editors"
                        />
                      </div>

                      {/* Common Validation */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" {...register('required')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-700">Required Field</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" {...register('unique')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-700">Unique Value</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" {...register('private')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-700">Private (API Hide)</span>
                        </label>
                      </div>

                      {/* Type Specific - Placeholder for now */}
                      <div className="md:col-span-2 border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-400 italic">Advanced settings for {fieldType} will be implemented in integration phase.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <Dialog.Close asChild>
                      <button type="button" className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-all">
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      <Save className="w-4 h-4" />
                      Save Settings
                    </button>
                  </div>
                </form>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

export default FieldConfigModal
