"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  getDoc,
} from "firebase/firestore";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CollectionConfig } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export default function CollectionListContent({
  collectionSlug,
}: {
  collectionSlug: string;
}) {
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig | null>(null);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    doc: Record<string, unknown> | null;
  }>({
    open: false,
    doc: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch dynamic config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "_collections", collectionSlug));
        if (configDoc.exists()) {
          setCollectionConfig({ slug: collectionSlug, ...configDoc.data() } as CollectionConfig);
        } else {
          setCollectionConfig(null);
        }
      } catch (e) {
        console.error("Error fetching config", e);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, [collectionSlug]);

  useEffect(() => {
    if (configLoading || !collectionConfig) return;

    const q = query(collection(db, collectionSlug));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionSlug, collectionConfig, configLoading]);

  // Filter and paginate
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents;
    const queryStr = searchQuery.toLowerCase();
    return documents.filter((docItem) => {
      return Object.values(docItem).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(queryStr)
      );
    });
  }, [documents, searchQuery]);

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (configLoading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  if (!collectionConfig) {
    return notFound();
  }

  const handleDelete = async (docToDelete: Record<string, unknown>) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, collectionSlug, docToDelete.id as string));
      toast.success("Entry deleted successfully");
      setDeleteDialog({ open: false, doc: null });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete entry");
    } finally {
      setDeleting(false);
    }
  };

  const displayFields = collectionConfig.fields?.slice(0, 4) || [];

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 capitalize tracking-tight'>
            {collectionConfig.label}
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            {filteredDocuments.length}{" "}
            {filteredDocuments.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Link
          href={`/admin/${collectionSlug}/new`}
          className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20'>
          <Plus className='w-4 h-4' />
          Create Entry
        </Link>
      </div>

      {/* Main Content Card */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {/* Toolbar */}
        <div className='p-4 border-b border-gray-200 flex gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className='w-full pl-9 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        {loading ? (
          <div className='p-12 flex flex-col items-center justify-center text-gray-500'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600 mb-3' />
            <p>Loading content...</p>
          </div>
        ) : paginatedDocuments.length === 0 ? (
          <div className='p-16 flex flex-col items-center justify-center text-center'>
            <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
              <Plus className='w-8 h-8 text-gray-300' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>
              {searchQuery ? "No results found" : "No content yet"}
            </h3>
            <p className='text-gray-500 max-w-xs mb-6'>
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by creating your first entry for this collection."}
            </p>
            {!searchQuery && (
              <Link
                href={`/admin/${collectionSlug}/new`}
                className='text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline'>
                Create new entry →
              </Link>
            )}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead className='bg-gray-50/50 border-b border-gray-200'>
                <tr>
                  {displayFields.map((field) => (
                    <th
                      key={field.name}
                      className='px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      {field.label}
                    </th>
                  ))}
                  <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {paginatedDocuments.map((docItem) => (
                  <tr
                    key={docItem.id as string}
                    className='group hover:bg-blue-50/30 transition-colors'>
                    {displayFields.map((field) => (
                      <td
                        key={field.name}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>
                        {field.type === "boolean" ? (
                          docItem[field.name] ? (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                              Yes
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                              No
                            </span>
                          )
                        ) : field.type === "media" ? (
                          docItem[field.name] ? (
                            <span className='text-xs text-gray-500'>
                              [Media]
                            </span>
                          ) : (
                            "-"
                          )
                        ) : field.type === "richtext" ? (
                          <span
                            className='block truncate max-w-[200px]'
                            title={String(docItem[field.name] || "").replace(
                              /<[^>]*>?/gm,
                              ""
                            )}>
                            {String(docItem[field.name] || "")
                              .replace(/<[^>]*>?/gm, "")
                              .substring(0, 50) || "-"}
                          </span>
                        ) : field.type === "component" ? (
                          <span className='text-xs text-gray-500'>
                            [Component]
                          </span>
                        ) : field.type === "json" ? (
                          <span className='text-xs text-gray-500'>[JSON]</span>
                        ) : field.type === "relation" ? (
                          <span className='text-xs text-gray-500'>
                            [Relation]
                          </span>
                        ) : (
                          <span
                            className='block truncate max-w-[200px]'
                            title={String(docItem[field.name] || "")}>
                            {String(docItem[field.name] || "-")}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Link
                          href={`/admin/${collectionSlug}/${docItem.id}`}
                          className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors'
                          title='Edit'>
                          <Pencil className='w-4 h-4' />
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteDialog({ open: true, doc: docItem })
                          }
                          className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors'
                          title='Delete'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between'>
            <span className='text-sm text-gray-500'>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)}{" "}
              of {filteredDocuments.length} entries
            </span>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'>
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-sm text-gray-600'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'>
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, doc: open ? deleteDialog.doc : null })
        }
        title='Delete Entry'
        description='Are you sure you want to delete this entry? This action cannot be undone.'
        confirmText='Delete'
        variant='danger'
        onConfirm={() => {
          if (deleteDialog.doc) {
            handleDelete(deleteDialog.doc);
          }
        }}
        loading={deleting}
      />
    </div>
  );
}