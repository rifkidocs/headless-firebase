"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";
import {
  Plus,
  Settings,
  Trash2,
  Loader2,
  Component as ComponentIcon,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ComponentDefinition } from "@/lib/types";

export default function ComponentsListPage() {
  const [components, setComponents] = useState<ComponentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    component: ComponentDefinition | null;
  }>({
    open: false,
    component: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "_components"), orderBy("displayName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ComponentDefinition[];
      setComponents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (component: ComponentDefinition) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "_components", component.id));
      toast.success("Component deleted successfully");
      setDeleteDialog({ open: false, component: null });
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component");
    } finally {
      setDeleting(false);
    }
  };

  // Group components by category
  const groupedComponents = components.reduce((acc, comp) => {
    const category = comp.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(comp);
    return acc;
  }, {} as Record<string, ComponentDefinition[]>);

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
            Components
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Create reusable field groups for your content types.
          </p>
        </div>
        <Link
          href='/admin/components/new'
          className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20'>
          <Plus className='w-4 h-4' />
          Create Component
        </Link>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='p-12 flex flex-col items-center justify-center text-gray-500'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600 mb-3' />
            <p>Loading components...</p>
          </div>
        ) : components.length === 0 ? (
          <div className='p-16 flex flex-col items-center justify-center text-center'>
            <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
              <ComponentIcon className='w-8 h-8 text-gray-300' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>
              No components yet
            </h3>
            <p className='text-gray-500 max-w-xs mb-6'>
              Components let you create reusable groups of fields that can be
              used across multiple content types.
            </p>
            <Link
              href='/admin/components/new'
              className='text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline'>
              Create your first component →
            </Link>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {Object.entries(groupedComponents).map(([category, comps]) => (
              <div key={category}>
                <div className='px-6 py-3 bg-gray-50/50 border-b border-gray-100'>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    {category}
                  </p>
                </div>
                {comps.map((comp) => (
                  <div
                    key={comp.id}
                    className='flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group'>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center'>
                        <ComponentIcon className='w-5 h-5 text-indigo-600' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>
                          {comp.displayName}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {comp.fields?.length || 0} fields
                          {comp.description && ` • ${comp.description}`}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Link
                        href={`/admin/components/${comp.id}`}
                        className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors'
                        title='Edit'>
                        <Settings className='w-4 h-4' />
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteDialog({ open: true, component: comp })
                        }
                        className='p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors'
                        title='Delete'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({
            open,
            component: open ? deleteDialog.component : null,
          })
        }
        title='Delete Component'
        description={`Are you sure you want to delete "${deleteDialog.component?.displayName}"? This may affect content types using this component.`}
        confirmText='Delete'
        variant='danger'
        onConfirm={() => {
          if (deleteDialog.component) {
            handleDelete(deleteDialog.component);
          }
        }}
        loading={deleting}
      />
    </div>
  );
}
