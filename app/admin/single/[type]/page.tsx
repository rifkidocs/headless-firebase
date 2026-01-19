"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import { MediaPicker } from "@/components/cms/MediaPicker";
import { CollectionConfig } from "@/lib/types";
import clsx from "clsx";

export default function SingleTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<CollectionConfig | null>(null);

  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors },
  } = useForm();

  // Fetch config and data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get config
        const configDoc = await getDoc(doc(db, "_collections", type));
        if (!configDoc.exists() || configDoc.data()?.kind !== "singleType") {
          setConfig(null);
          setLoading(false);
          return;
        }

        const configData = configDoc.data() as CollectionConfig;
        setConfig(configData);

        // Get single entry data
        const dataDoc = await getDoc(doc(db, `_single_${type}`, "data"));
        if (dataDoc.exists()) {
          reset(dataDoc.data());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, reset]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (!config) {
    return notFound();
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const sanitizedData = JSON.parse(JSON.stringify(data));
      await setDoc(doc(db, `_single_${type}`, "data"), {
        ...sanitizedData,
        updatedAt: serverTimestamp(),
      });
      toast.success("Saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const baseInputClass = (hasError: boolean) =>
    clsx(
      "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400",
      hasError
        ? "border-red-300 bg-red-50"
        : "border-gray-200 hover:border-gray-300"
    );

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href='/admin'
          className='p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
            {config.label}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Edit your {config.label.toLowerCase()} content
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-8 space-y-6'>
          {config.fields?.map((field) => (
            <div key={field.name} className='group'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                {field.label}{" "}
                {field.required && <span className='text-red-500'>*</span>}
              </label>
              {field.description && (
                <p className='text-xs text-gray-500 mb-2'>
                  {field.description}
                </p>
              )}

              {field.type === "text" && (
                <input
                  type='text'
                  {...register(field.name, { required: field.required })}
                  className={baseInputClass(!!errors[field.name])}
                  placeholder={field.placeholder}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  {...register(field.name, { required: field.required })}
                  className={clsx(
                    baseInputClass(!!errors[field.name]),
                    "min-h-[120px] resize-y"
                  )}
                  placeholder={field.placeholder}
                />
              )}

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

              {field.type === "boolean" && (
                <div className='flex items-center h-10'>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      {...register(field.name)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className='ml-3 text-sm font-medium text-gray-700'>
                      {field.label}
                    </span>
                  </label>
                </div>
              )}

              {field.type === "media" && (
                <Controller
                  name={field.name}
                  control={control}
                  rules={{ required: field.required }}
                  render={({ field: f }) => (
                    <MediaPicker
                      value={f.value}
                      onChange={f.onChange}
                      multiple={false}
                    />
                  )}
                />
              )}

              {errors[field.name] && (
                <p className='text-red-500 text-xs mt-1.5 font-medium'>
                  This field is required
                </p>
              )}
            </div>
          ))}

          {(!config.fields || config.fields.length === 0) && (
            <div className='text-center py-8 text-gray-500'>
              <p>No fields defined for this single type.</p>
              <Link
                href={`/admin/schema/${type}`}
                className='text-blue-600 hover:underline text-sm'>
                Configure fields →
              </Link>
            </div>
          )}
        </div>

        <div className='px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end'>
          <button
            type='submit'
            disabled={saving}
            className='bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center gap-2 disabled:bg-blue-400 shadow-sm shadow-blue-600/20'>
            {saving ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='w-4 h-4' />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
