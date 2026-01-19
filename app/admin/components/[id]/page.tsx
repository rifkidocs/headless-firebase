"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  GripVertical,
  Type,
  AlignLeft,
  Hash,
  ToggleLeft,
  Calendar,
  Mail,
  Image,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { toast } from "@/components/ui/Toast";
import { FieldType, FIELD_TYPE_CONFIG } from "@/lib/types";

interface ComponentField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
}

interface ComponentForm {
  name: string;
  displayName: string;
  category: string;
  description: string;
  fields: ComponentField[];
}

const BASIC_FIELD_TYPES: { type: FieldType; icon: React.ElementType }[] = [
  { type: "text", icon: Type },
  { type: "textarea", icon: AlignLeft },
  { type: "number", icon: Hash },
  { type: "boolean", icon: ToggleLeft },
  { type: "date", icon: Calendar },
  { type: "email", icon: Mail },
  { type: "media", icon: Image },
];

export default function ComponentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComponentForm>({
    defaultValues: {
      name: "",
      displayName: "",
      category: "general",
      description: "",
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  // Auto-generate name from displayName
  const displayNameValue = watch("displayName");
  useEffect(() => {
    if (isNew && displayNameValue) {
      const name = displayNameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("name", name);
    }
  }, [displayNameValue, isNew, setValue]);

  useEffect(() => {
    if (isNew) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "_components", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as ComponentForm;
          setValue("name", data.name);
          setValue("displayName", data.displayName);
          setValue("category", data.category || "general");
          setValue("description", data.description || "");
          setValue("fields", data.fields || []);
        }
      } catch (error) {
        console.error("Error fetching component:", error);
        toast.error("Failed to load component");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, setValue]);

  const onSubmit = async (data: ComponentForm) => {
    setSaving(true);
    try {
      const docId = isNew ? data.name : id;
      const sanitizedData = JSON.parse(JSON.stringify(data));

      await setDoc(doc(db, "_components", docId), {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
        ...(isNew && { createdAt: serverTimestamp() }),
      });

      toast.success(isNew ? "Component created!" : "Component updated!");
      router.push("/admin/components");
    } catch (error) {
      console.error("Error saving component:", error);
      toast.error("Failed to save component");
    } finally {
      setSaving(false);
    }
  };

  const generateKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^(.)/, (c) => c.toLowerCase());
  };

  if (loading) {
    return (
      <div className='flex justify-center p-8 h-96 items-center'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href='/admin/components'
          className='p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
            {isNew ? "Create Component" : "Edit Component"}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Define a reusable group of fields.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        {/* Basic Info */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 bg-gray-50/50'>
            <h2 className='text-base font-semibold text-gray-900'>
              Basic Information
            </h2>
          </div>
          <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Display Name
              </label>
              <input
                {...register("displayName", { required: true })}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900'
                placeholder='e.g. SEO Metadata'
              />
              {errors.displayName && (
                <p className='text-red-500 text-xs mt-1.5'>
                  Display name is required
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Component ID
              </label>
              <input
                {...register("name", { required: true })}
                readOnly={!isNew}
                className={clsx(
                  "w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-all text-gray-900",
                  !isNew && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
                placeholder='e.g. seo-metadata'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Category
              </label>
              <select
                {...register("category")}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900'>
                <option value='general'>General</option>
                <option value='seo'>SEO</option>
                <option value='media'>Media</option>
                <option value='layout'>Layout</option>
                <option value='content'>Content</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Description (optional)
              </label>
              <input
                {...register("description")}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900'
                placeholder='Brief description of this component'
              />
            </div>
          </div>
        </div>

        {/* Fields Builder */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center'>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                Component Fields
              </h2>
              <p className='text-sm text-gray-500 mt-0.5'>
                Add fields that will be included in this component.
              </p>
            </div>
          </div>

          <div className='p-6'>
            {/* Quick Add Buttons */}
            <div className='flex flex-wrap gap-2 mb-6'>
              {BASIC_FIELD_TYPES.map(({ type, icon: Icon }) => {
                const config = FIELD_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    type='button'
                    onClick={() =>
                      append({
                        name: "",
                        label: "",
                        type,
                        required: false,
                      })
                    }
                    className='inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'>
                    <Icon className='w-4 h-4' />
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* Fields List */}
            <div className='space-y-3'>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className='flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50'>
                  <GripVertical className='w-5 h-5 text-gray-400 cursor-grab' />
                  <div className='flex-1 grid grid-cols-3 gap-4'>
                    <div>
                      <input
                        {...register(`fields.${index}.label` as const, {
                          required: true,
                          onChange: (e) => {
                            const currentName = watch(`fields.${index}.name`);
                            if (!currentName) {
                              setValue(
                                `fields.${index}.name`,
                                generateKey(e.target.value)
                              );
                            }
                          },
                        })}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                        placeholder='Label'
                      />
                    </div>
                    <div>
                      <input
                        {...register(`fields.${index}.name` as const, {
                          required: true,
                        })}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono text-gray-900'
                        placeholder='fieldKey'
                      />
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='text-xs text-gray-500 uppercase'>
                        {FIELD_TYPE_CONFIG[field.type]?.label}
                      </span>
                      <label className='flex items-center gap-1.5'>
                        <input
                          type='checkbox'
                          {...register(`fields.${index}.required` as const)}
                          className='w-4 h-4 text-blue-600 rounded'
                        />
                        <span className='text-xs text-gray-600'>Required</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => remove(index)}
                    className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg'>
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}

              {fields.length === 0 && (
                <div className='text-center py-12 border-2 border-dashed border-gray-200 rounded-lg'>
                  <p className='text-gray-500 text-sm'>
                    No fields added yet. Click the buttons above to add fields.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex justify-end pt-4 pb-20'>
          <Link
            href='/admin/components'
            className='px-6 py-2.5 mr-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all'>
            Cancel
          </Link>
          <button
            type='submit'
            disabled={saving}
            className='bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center gap-2 disabled:bg-blue-400 shadow-lg shadow-blue-600/20'>
            {saving ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='w-4 h-4' />
                Save Component
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
