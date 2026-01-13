"use client";

import { useState, useEffect } from "react";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CollectionConfig } from "@/lib/types";
import { generateOpenApiSpec } from "@/lib/openapi";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StandaloneApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const collections = snapshot.docs.map((doc) => ({
        slug: doc.id,
        ...doc.data(),
      })) as CollectionConfig[];

      const generatedSpec = generateOpenApiSpec(collections);
      setSpec(generatedSpec);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium mt-4">Generating API Documentation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Standalone Header */}
      <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-blue-600"
            title="Back to CMS"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">API Documentation</h1>
        </div>
        <div className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
          v1.0.0
        </div>
      </div>

      {/* Scalar Fullscreen Content */}
      <div className="flex-1">
        <ApiReferenceReact
          configuration={{
            spec: {
              content: spec,
            },
            theme: "default",
            showSidebar: true,
          }}
        />
      </div>

      <style jsx global>{`
        /* Clean up Scalar for standalone mode */
        .scalar-app {
          height: calc(100vh - 4rem) !important;
        }
        body {
            margin: 0;
            padding: 0;
        }
      `}</style>
    </div>
  );
}
