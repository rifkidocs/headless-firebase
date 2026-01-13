import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Save, Component, Layers } from 'lucide-react'
import { Field, FieldType, FIELD_TYPE_CONFIG } from '@/lib/types'
import { useForm, Controller } from 'react-hook-form'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
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
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Display Label</label>
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
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="e.g. Article Title"
                        />
                        {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Field Key (API ID)</label>
                        <input
                          {...register('name', { required: 'Key is required' })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono text-gray-900 placeholder:text-gray-400"
                          placeholder="field_key"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                        <input
                          {...register('description')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          placeholder="Help text for editors"
                        />
                      </div>

                      {/* Common Validation */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" {...register('required')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-900">Required Field</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" {...register('unique')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-900">Unique Value</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                          <input type="checkbox" {...register('private')} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <span className="text-sm font-medium text-gray-900">Private (API Hide)</span>
                        </label>
                      </div>

                      {/* Type Specific */}
                      <div className="md:col-span-2 border-t border-gray-100 pt-6">
                        {fieldType === 'component' ? (
                          <div className="flex flex-col gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">Select Component</label>
                              <select
                                {...register('component.component', { required: 'Component is required' })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 bg-white"
                              >
                                {components.map((comp) => (
                                  <option key={comp.id} value={comp.id}>
                                    {comp.displayName}
                                  </option>
                                ))}
                              </select>
                              {components.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">
                                  No components found.{' '}
                                  <Link href="/admin/components/new" target="_blank" className="underline hover:text-red-600">
                                    Create one first
                                  </Link>
                                  .
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">Component Type</label>
                              <div className="flex gap-4">
                                <label
                                  className={clsx(
                                    "flex-1 p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4",
                                    !watch('component.repeatable')
                                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                      : "border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    value="single"
                                    className="sr-only"
                                    onChange={() => setValue('component.repeatable', false)}
                                    checked={!watch('component.repeatable')}
                                  />
                                  <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <Component className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">Single Component</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Fixed structure (e.g. SEO, Header)</p>
                                  </div>
                                </label>

                                <label
                                  className={clsx(
                                    "flex-1 p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4",
                                    watch('component.repeatable')
                                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                      : "border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    value="repeatable"
                                    className="sr-only"
                                    onChange={() => setValue('component.repeatable', true)}
                                    checked={watch('component.repeatable')}
                                  />
                                  <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <Layers className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">Repeatable Component</p>
                                    <p className="text-xs text-gray-500 mt-0.5">List of items (e.g. Slider, FAQ)</p>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Advanced settings for {fieldType} will be implemented in integration phase.
                          </p>
                        )}
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
