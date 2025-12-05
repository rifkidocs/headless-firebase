"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export interface CollectionConfig {
  label: string;
  slug: string;
  fields: {
    name: string;
    label: string;
    type: "text" | "textarea" | "boolean" | "number" | "date";
    required?: boolean;
  }[];
}

export default function CollectionFormPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection: collectionSlug, id } = use(params);
  
  const isNew = id === "new";
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // 1. Fetch Config First
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "_collections", collectionSlug));
        if (configDoc.exists()) {
          setCollectionConfig(configDoc.data() as CollectionConfig);
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

  // 2. Fetch Data if Edit Mode
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!collectionConfig) {
    return notFound();
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (isNew) {
        await addDoc(collection(db, collectionSlug), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, collectionSlug, id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      }
      router.push(`/admin/${collectionSlug}`);
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/${collectionSlug}`}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isNew ? `Create ${collectionConfig.label}` : `Edit ${collectionConfig.label}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
             {isNew ? `Add a new entry to ${collectionConfig.label}` : `Update existing ${collectionConfig.label}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-6">
          {collectionConfig.fields?.map((field) => (
            <div key={field.name} className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === "textarea" ? (
                <textarea
                  {...register(field.name, { required: field.required })}
                  className={clsx(
                    "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[150px] resize-y text-gray-900 placeholder:text-gray-400",
                    errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  )}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              ) : field.type === "boolean" ? (
                  <div className="flex items-center h-10">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        {...register(field.name)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">{field.label}</span>
                    </label>
                  </div>
              ) : field.type === "date" ? (
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Calendar className="h-5 w-5 text-gray-400" />
                   </div>
                   <input
                      type="date"
                      {...register(field.name, { required: field.required })}
                      className={clsx(
                        "w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400",
                        errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                      )}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  {...register(field.name, { required: field.required })}
                  className={clsx(
                    "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400",
                    errors[field.name] ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  )}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  This field is required
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href={`/admin/${collectionSlug}`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-300 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isNew ? "Create Entry" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
