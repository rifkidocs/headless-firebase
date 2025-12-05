"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Save, Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// Define types
type FieldType = "text" | "textarea" | "boolean" | "number" | "date";

interface Field {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
}

interface SchemaForm {
  label: string;
  slug: string;
  fields: Field[];
}

export default function SchemaEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<SchemaForm>({
    defaultValues: {
      label: "",
      slug: "",
      fields: [{ name: "title", label: "Title", type: "text", required: true }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields"
  });

  // Auto-generate slug from label if new
  const labelValue = watch("label");
  useEffect(() => {
    if (isNew && labelValue) {
      const slug = labelValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [labelValue, isNew, setValue]);

  useEffect(() => {
    if (isNew) return;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "_collections", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SchemaForm;
          setValue("label", data.label);
          setValue("slug", data.slug);
          setValue("fields", data.fields);
        }
      } catch (error) {
        console.error("Error fetching schema:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, setValue]);

  const onSubmit = async (data: SchemaForm) => {
    setSaving(true);
    try {
      // If new, use the generated slug as ID
      const docId = isNew ? data.slug : id;
      
      await setDoc(doc(db, "_collections", docId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      router.push("/admin/schema");
    } catch (error) {
      console.error("Error saving schema:", error);
      alert("Failed to save schema");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8 h-96 items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/schema" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isNew ? "Create Content Type" : "Edit Content Type"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Define the structure for your content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
              <input
                {...register("label", { required: true })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. Blog Posts"
              />
              {errors.label && <p className="text-red-500 text-xs mt-1.5">Label is required</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Collection Slug (ID)</label>
              <input
                {...register("slug", { required: true })}
                readOnly={!isNew}
                className={clsx(
                  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400",
                  !isNew && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
                placeholder="e.g. blog-posts"
              />
            </div>
          </div>
        </div>

        {/* Fields Builder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Fields Structure</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add and configure fields for your content type.</p>
            </div>
            <button
              type="button"
              onClick={() => append({ name: "", label: "", type: "text", required: false })}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Field
            </button>
          </div>

          <div className="p-6 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-200 rounded-l-lg group-hover:bg-blue-500 transition-colors"></div>
                 
                 <div className="flex gap-4 items-start pl-3">
                    <div className="mt-3 text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Label</label>
                            <input
                            {...register(`fields.${index}.label` as const, { required: true })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                            placeholder="e.g. Article Title"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Field Key</label>
                            <input
                            {...register(`fields.${index}.name` as const, { required: true })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-gray-900 placeholder:text-gray-400"
                            placeholder="camelCase"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data Type</label>
                            <div className="relative">
                                <select
                                {...register(`fields.${index}.type` as const)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white text-gray-900"
                                >
                                <option value="text">Short Text</option>
                                <option value="textarea">Long Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean (Switch)</option>
                                <option value="date">Date Picker</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 flex items-center h-full pt-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                {...register(`fields.${index}.required` as const)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-600">Required</span>
                            </label>
                        </div>
                    </div>

                    <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove field"
                    >
                    <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}

            {fields.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-sm">No fields added yet. Click &quot;Add Field&quot; to start.</p>
                </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-20">
          <Link
             href="/admin/schema"
             className="px-6 py-2.5 mr-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
             Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
          >
            {saving ? (
                <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Saving Content Type...
                </>
            ) : (
                <>
                 <Save className="w-4 h-4" />
                 Save Content Type
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
