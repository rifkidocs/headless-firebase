"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, deleteDoc, doc, query, getDoc } from "firebase/firestore";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";

export interface CollectionConfig {
  label: string;
  slug: string;
  fields: {
    name: string;
    label: string;
    type: string;
  }[];
}

export default function CollectionListPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection: collectionSlug } = use(params);
  
  const [collectionConfig, setCollectionConfig] = useState<CollectionConfig | null>(null);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch dynamic config first
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, "_collections", collectionSlug));
        if (configDoc.exists()) {
          setCollectionConfig(configDoc.data() as CollectionConfig);
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

  if (configLoading) {
     return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!collectionConfig) {
    return notFound();
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, collectionSlug, id));
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document");
      }
    }
  };

  const displayFields = collectionConfig.fields?.slice(0, 4) || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize tracking-tight">{collectionConfig.label}</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your {collectionConfig.label.toLowerCase()} content</p>
        </div>
        <Link
          href={`/admin/${collectionSlug}/new`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Entry
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Toolbar (Placeholder for future search/filter) */}
        <div className="p-4 border-b border-gray-200 flex gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            {/* Future Filter Button */}
            {/* <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
            </button> */}
        </div>

        {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                <p>Loading content...</p>
            </div>
        ) : documents.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No content yet</h3>
            <p className="text-gray-500 max-w-xs mb-6">Get started by creating your first entry for this collection.</p>
            <Link
                href={`/admin/${collectionSlug}/new`}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
            >
                Create new entry &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                    {displayFields.map((field) => (
                    <th key={field.name} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {field.label}
                    </th>
                    ))}
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                    <tr key={doc.id as string} className="group hover:bg-blue-50/30 transition-colors">
                    {displayFields.map((field) => (
                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {field.type === 'boolean' ? (
                            doc[field.name] ? 
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Published
                                </span> : 
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Draft
                                </span>
                        ) : (
                            <span className="block truncate max-w-[200px]" title={String(doc[field.name] || '')}>
                                {String(doc[field.name] || '-')}
                            </span>
                        )}
                        </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                        <Link
                            href={`/admin/${collectionSlug}/${doc.id}`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                            title="Edit"
                        >
                            <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(doc.id as string)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
        
        {/* Footer with pagination placeholder */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
             <span>Showing {documents.length} entries</span>
             {/* Pagination can go here */}
        </div>

      </div>
    </div>
  );
}
