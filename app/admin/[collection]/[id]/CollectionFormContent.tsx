"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Plus,
  Trash2,
  GripVertical,
  X,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { toast } from "@/components/ui/Toast";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { MediaPicker } from "@/components/cms/MediaPicker";
import { Field, CollectionConfig, ComponentDefinition } from "@/lib/types";
import slugify from "slugify";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Combobox } from "@/components/ui/Combobox";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function CollectionFormContent({
  collectionSlug,
  id,
}: {
  collectionSlug: string;
  id: string;
}) {
  const isNew = id === "new";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig | null>(null);
  const [components, setComponents] = useState<
    Record<string, ComponentDefinition>
  >({});
  const [relatedData, setRelatedData] = useState<
    Record<string, { id: string; label: string }[]>
  >({});

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  // 1. Fetch Config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "_collections", collectionSlug));
        if (configDoc.exists()) {
          const config = configDoc.data() as CollectionConfig;
          setCollectionConfig(config);

          // Fetch related data
          const relationFields = config.fields?.filter((f) => f.type === "relation") || [];
          for (const field of relationFields) {
            if (field.relation?.target) {
              try {
                const relDocs = await getDocs(collection(db, field.relation.target));
                const items = relDocs.docs.map((d) => ({
                  id: d.id,
                  label: d.data().title || d.data().name || d.id,
                }));
                setRelatedData((prev) => ({ ...prev, [field.name]: items }));
              } catch { /* ignore */ }
            }
          }
        } else {
          setCollectionConfig(null);
          setLoading(false);
        }
      } catch (e) {
        console.error("Error fetching config", e);
        setLoading(false);
      }
    };
    fetchConfig();
  }, [collectionSlug]);

  // 2. Fetch Data if Edit
  useEffect(() => {
    if (!collectionConfig) return;

    const fetchData = async () => {
      if (isNew) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, collectionSlug, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          reset(docSnap.data());
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionSlug, id, isNew, collectionConfig, reset]);

  // Fetch components
  useEffect(() => {
    const q = query(collection(db, "_components"), orderBy("displayName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comps: Record<string, ComponentDefinition> = {};
      snapshot.docs.forEach((doc) => {
        comps[doc.id] = { id: doc.id, ...doc.data() } as ComponentDefinition;
      });
      setComponents(comps);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (!collectionConfig) {
    return notFound();
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      // 1. Handle UID fields first so they can be checked for uniqueness
      for (const field of collectionConfig.fields || []) {
        if (field.type === "uid" && field.targetField) {
          const sourceValue = data[field.targetField] as string;
          if (sourceValue && !data[field.name]) {
            data[field.name] = slugify(sourceValue, {
              lower: true,
              strict: true,
            });
          }
        }
      }

      // 2. Remove undefined values
      const sanitizedData = JSON.parse(JSON.stringify(data));

      // 3. Check for Unique constraints
      for (const field of collectionConfig.fields || []) {
        if (field.unique) {
          const value = sanitizedData[field.name];
          if (value !== undefined && value !== null && value !== "") {
            const q = query(
              collection(db, collectionSlug),
              where(field.name, "==", value)
            );
            const snapshot = await getDocs(q);
            const isDuplicate = snapshot.docs.some((doc) =>
              isNew ? true : doc.id !== id
            );

            if (isDuplicate) {
              toast.error(
                `The value for "${field.label}" must be unique. This value is already in use.`
              );
              setSaving(false);
              return;
            }
          }
        }
      }

      if (isNew) {
        await addDoc(collection(db, collectionSlug), {
          ...sanitizedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Entry created successfully!");
      } else {
        await updateDoc(doc(db, collectionSlug, id), {
          ...sanitizedData,
          updatedAt: serverTimestamp(),
        });
        toast.success("Entry updated successfully!");
      }
      router.push(`/admin/${collectionSlug}`);
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href={`/admin/${collectionSlug}`}
          className='p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
            {isNew
              ? `Create ${collectionConfig.label}`
              : `Edit ${collectionConfig.label}`}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            {isNew
              ? `Add a new entry to ${collectionConfig.label}`
              : `Update existing ${collectionConfig.label}`}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-8 space-y-6'>
          {collectionConfig.fields?.map((field) => (
            <FormField
              key={field.name}
              field={field}
              register={register}
              control={control}
              errors={errors}
              components={components}
              relatedData={relatedData}
            />
          ))}

          {(!collectionConfig.fields ||
            collectionConfig.fields.length === 0) && (
            <div className='text-center py-8 text-gray-500'>
              <p>No fields defined for this content type.</p>
              <Link
                href={`/admin/schema/${collectionSlug}`}
                className='text-blue-600 hover:underline text-sm'>
                Configure fields →
              </Link>
            </div>
          )}
        </div>

        <div className='px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3'>
          <Link
            href={`/admin/${collectionSlug}`}
            className='px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-300 transition-all'>
            Cancel
          </Link>
          <button
            type='submit'
            disabled={saving}
            className='bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20'>
            {saving ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='w-4 h-4' />
                {isNew ? "Create Entry" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Re-including FormField helper (matching original logic)
function FormField({
  field,
  register,
  control,
  errors,
  components,
  relatedData,
}: any) {
  const error = errors[field.name];

  const baseInputClass = clsx(
    "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400",
    error ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
  );

  return (
    <div className='group'>
      <label className='block text-sm font-semibold text-gray-700 mb-2'>
        {field.label}{" "}
        {field.required && <span className='text-red-500'>*</span>}
      </label>
      {field.description && (
        <p className='text-xs text-gray-500 mb-2'>{field.description}</p>
      )}

      {/* Text */}
      {field.type === "text" && (
        <input
          type='text'
          {...register(field.name, { required: field.required })}
          className={baseInputClass}
          placeholder={
            field.placeholder || `Enter ${field.label.toLowerCase()}...`
          }
          minLength={field.minLength}
          maxLength={field.maxLength}
        />
      )}

      {/* Textarea */}
      {field.type === "textarea" && (
        <textarea
          {...register(field.name, { required: field.required })}
          className={clsx(baseInputClass, "min-h-[120px] resize-y")}
          placeholder={
            field.placeholder || `Enter ${field.label.toLowerCase()}...`
          }
          minLength={field.minLength}
          maxLength={field.maxLength}
        />
      )}

      {/* Rich Text */}
      {field.type === "richtext" && (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required }}
          render={({ field: f }) => (
            <RichTextEditor
              value={f.value || ""}
              onChange={f.onChange}
              placeholder={field.placeholder}
            />
          )}
        />
      )}

      {/* Number */}
      {(field.type === "number" || field.type === "decimal") && (
        <input
          type='number'
          step={field.type === "decimal" ? "0.01" : "1"}
          {...register(field.name, {
            required: field.required,
            valueAsNumber: true,
            min: field.min,
            max: field.max,
          })}
          className={baseInputClass}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
        />
      )}

      {/* Boolean */}
      {field.type === "boolean" && (
        <div className='flex items-center h-10'>
          <Controller
            name={field.name}
            control={control}
            render={({ field: f }) => (
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={field.name}
                  checked={f.value}
                  onCheckedChange={f.onChange}
                />
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {field.label}
                </label>
              </div>
            )}
          />
        </div>
      )}

      {/* Date/Time Fields */}
      {field.type === "date" && (
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Calendar className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='date'
            {...register(field.name, { required: field.required })}
            className={clsx(baseInputClass, "pl-10")}
          />
        </div>
      )}

      {field.type === "datetime" && (
        <input
          type='datetime-local'
          {...register(field.name, { required: field.required })}
          className={baseInputClass}
        />
      )}

      {field.type === "time" && (
        <input
          type='time'
          {...register(field.name, { required: field.required })}
          className={baseInputClass}
        />
      )}

      {/* Email */}
      {field.type === "email" && (
        <input
          type='email'
          {...register(field.name, {
            required: field.required,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className={baseInputClass}
          placeholder={field.placeholder || "email@example.com"}
        />
      )}

      {/* Password */}
      {field.type === "password" && (
        <input
          type='password'
          {...register(field.name, { required: field.required })}
          className={baseInputClass}
          placeholder='••••••••'
        />
      )}

      {/* UID/Slug */}
      {field.type === "uid" && (
        <input
          type='text'
          {...register(field.name, { required: field.required })}
          className={clsx(baseInputClass, "font-mono text-sm")}
          placeholder='auto-generated-slug'
        />
      )}

      {/* JSON */}
      {field.type === "json" && (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required }}
          render={({ field: f }) => (
            <textarea
              value={typeof f.value === "object" ? JSON.stringify(f.value, null, 2) : f.value || ""}
              onChange={(e) => {
                try { f.onChange(JSON.parse(e.target.value)); } 
                catch { f.onChange(e.target.value); }
              }}
              className={clsx(baseInputClass, "font-mono text-sm min-h-[150px]")}
              placeholder='{ "key": "value" }'
            />
          )}
        />
      )}

      {/* Enumeration */}
      {field.type === "enumeration" && (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required }}
          render={({ field: f }) => (
            <Select onValueChange={f.onChange} value={f.value}>
              <SelectTrigger className={baseInputClass}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.enumOptions?.map((opt: any) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {/* Media */}
      {field.type === "media" && (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required }}
          render={({ field: f }) => (
            <MediaPicker value={f.value} onChange={f.onChange} multiple={false} accept='all' />
          )}
        />
      )}

      {/* Relation */}
      {field.type === "relation" && (
        <Controller
          name={field.name}
          control={control}
          rules={{ required: field.required }}
          render={({ field: f }) => {
            const items = relatedData[field.name] || [];
            const isMultiple = field.relation?.type === "hasMany" || field.relation?.type === "manyToMany";

                        if (isMultiple) {

                          const selectedIds = (f.value as string[]) || [];

                          return (

                            <div className='space-y-3'>

                              <div className='flex flex-wrap gap-2'>

                                {selectedIds.map((id) => {

                                  const item = items.find((i: any) => i.id === id);

                                  return (

                                    <Badge

                                      key={id}

                                      variant="secondary"

                                      className="pl-3 pr-1 py-1 gap-1"

                                    >

                                      {item?.label || id}

                                      <button

                                        type='button'

                                        onClick={() =>

                                          f.onChange(selectedIds.filter((i) => i !== id))

                                        }

                                        className='hover:bg-gray-200 rounded-full p-0.5 transition-colors'>

                                        <X className='w-3 h-3' />

                                      </button>

                                    </Badge>

                                  );

                                })}

                              </div>

                              <Combobox

                                options={items

                                  .filter((i: any) => !selectedIds.includes(i.id))

                                  .map((item: any) => ({

                                    value: item.id,

                                    label: item.label,

                                  }))}

                                onValueChange={(val) => {

                                  if (val && !selectedIds.includes(val)) {

                                    f.onChange([...selectedIds, val]);

                                  }

                                }}

                                placeholder={`Add ${field.label}...`}

                                searchPlaceholder={`Search ${field.label.toLowerCase()}...`}

                              />

                            </div>

                          );

                        }

            
            return (
              <Combobox
                options={items.map((item: any) => ({
                  value: item.id,
                  label: item.label,
                }))}
                value={f.value}
                onValueChange={f.onChange}
                placeholder={`Select ${field.label}`}
                searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
              />
            );
          }}
        />
      )}

      {/* Component */}
      {field.type === "component" && field.component && (
        <Controller
          name={field.name}
          control={control}
          render={({ field: f }) => {
            const compDef = components[field.component?.component || ""];
            if (!compDef) return <p className='text-gray-500 text-sm'>Component not found</p>;

            if (field.component?.repeatable) {
              const items = (f.value as Record<string, unknown>[]) || [];
              return (
                <div className='space-y-3'>
                  {items.map((item, idx) => (
                    <div key={idx} className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2 text-gray-400'>
                          <GripVertical className='w-4 h-4' />
                          <span className='text-sm font-medium text-gray-700'>{compDef.displayName} #{idx + 1}</span>
                        </div>
                        <button type='button' onClick={() => f.onChange(items.filter((_, i) => i !== idx))} className='p-1 text-gray-400 hover:text-red-500'><Trash2 className='w-4 h-4' /></button>
                      </div>
                      <div className='space-y-4'>
                        {compDef.fields?.map((cf: Field) => (
                          <div key={cf.name}>
                            <label className='block text-xs font-medium text-gray-600 mb-1'>{cf.label}</label>
                            <input
                              type='text'
                              value={(item[cf.name] as string) || ""}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], [cf.name]: e.target.value };
                                f.onChange(newItems);
                              }}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                              placeholder={cf.placeholder}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type='button' onClick={() => f.onChange([...items, {}])} className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium'><Plus className='w-4 h-4' />Add {compDef.displayName}</button>
                </div>
              );
            }
            const value = (f.value as Record<string, unknown>) || {};
            return (
              <div className='border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4'>
                {compDef.fields?.map((cf: Field) => (
                  <div key={cf.name}>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>{cf.label}</label>
                    <input
                      type='text'
                      value={(value[cf.name] as string) || ""}
                      onChange={(e) => f.onChange({ ...value, [cf.name]: e.target.value })}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                      placeholder={cf.placeholder}
                    />
                  </div>
                ))}
              </div>
            );
          }}
        />
      )}

      {error && <p className='text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1'>{error.message?.toString() || "This field is required"}</p>}
    </div>
  );
}
