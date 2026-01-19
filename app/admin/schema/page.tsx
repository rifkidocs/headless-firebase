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
  Database,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { StrictConfirmDialog } from "@/components/ui/StrictConfirmDialog";
import { CollectionConfig } from "@/lib/types";
import { auth } from "@/lib/firebase";

export default function SchemaListPage() {
  const [collections, setCollections] = useState<CollectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    collection: CollectionConfig | null;
  }>({
    open: false,
    collection: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        slug: doc.id,
        ...doc.data(),
      })) as CollectionConfig[];
      setCollections(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (col: CollectionConfig) => {
    setDeleting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const token = await user.getIdToken();

      const response = await fetch(`/api/schema/${col.slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete content type";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error("Non-JSON API Error:", text);
          errorMessage = `API Error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success("Content type and all data deleted successfully");
      setDeleteDialog({ open: false, collection: null });
    } catch (error: any) {
      console.error("Error deleting collection:", error);
      toast.error(error.message || "Failed to delete content type");
    } finally {
      setDeleting(false);
    }
  };

  const collectionTypes = collections.filter((c) => c.kind !== "singleType");
  const singleTypes = collections.filter((c) => c.kind === "singleType");

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
            Content Types
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Define and manage the structure of your content.
          </p>
        </div>
        <Link
          href='/admin/schema/new'
          className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20'>
          <Plus className='w-4 h-4' />
          Create New
        </Link>
      </div>

      {loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-gray-500'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mb-3' />
          <p>Loading content types...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-16 flex flex-col items-center justify-center text-center'>
          <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
            <Database className='w-8 h-8 text-gray-300' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-1'>
            No content types defined
          </h3>
          <p className='text-gray-500 max-w-xs mb-6'>
            Create your first content type to start managing content.
          </p>
          <Link
            href='/admin/schema/new'
            className='text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline'>
            Create new content type →
          </Link>
        </div>
      ) : (
        <div className='space-y-8'>
          {/* Collection Types */}
          {collectionTypes.length > 0 && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50'>
                <h2 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                  <Database className='w-4 h-4 text-gray-500' />
                  Collection Types
                </h2>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Content types with multiple entries
                </p>
              </div>
              <div className='divide-y divide-gray-100'>
                {collectionTypes.map((col) => (
                  <div
                    key={col.slug}
                    className='flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group'>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center'>
                        <Database className='w-5 h-5 text-blue-600' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>{col.label}</p>
                        <div className='flex items-center gap-2 mt-0.5'>
                          <span className='text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded'>
                            {col.slug}
                          </span>
                          <span className='text-xs text-gray-400'>
                            {col.fields?.length || 0} fields
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Link
                        href={`/admin/${col.slug}`}
                        className='px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
                        View Entries
                      </Link>
                      <Link
                        href={`/admin/schema/${col.slug}`}
                        className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors'
                        title='Configure'>
                        <Settings className='w-4 h-4' />
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteDialog({ open: true, collection: col })
                        }
                        className='p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors'
                        title='Delete'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Types */}
          {singleTypes.length > 0 && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50'>
                <h2 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-gray-500' />
                  Single Types
                </h2>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Content types with a single entry
                </p>
              </div>
              <div className='divide-y divide-gray-100'>
                {singleTypes.map((col) => (
                  <div
                    key={col.slug}
                    className='flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group'>
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center'>
                        <FileText className='w-5 h-5 text-indigo-600' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>{col.label}</p>
                        <div className='flex items-center gap-2 mt-0.5'>
                          <span className='text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded'>
                            {col.slug}
                          </span>
                          <span className='text-xs text-gray-400'>
                            {col.fields?.length || 0} fields
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Link
                        href={`/admin/single/${col.slug}`}
                        className='px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
                        Edit
                      </Link>
                      <Link
                        href={`/admin/schema/${col.slug}`}
                        className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors'
                        title='Configure'>
                        <Settings className='w-4 h-4' />
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteDialog({ open: true, collection: col })
                        }
                        className='p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors'
                        title='Delete'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <StrictConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({
            open,
            collection: open ? deleteDialog.collection : null,
          })
        }
        title='Delete Content Type'
        description={`Are you sure you want to delete "${deleteDialog.collection?.label}"? This will permanently delete the content type configuration and all associated data, including media.`}
        confirmText='Delete'
        variant='danger'
        expectedValue={deleteDialog.collection?.label || ""}
        onConfirm={() => {
          if (deleteDialog.collection) {
            handleDelete(deleteDialog.collection);
          }
        }}
        loading={deleting}
      />
    </div>
  );
}
