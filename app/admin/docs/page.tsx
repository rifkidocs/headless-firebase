"use client";

import { useState, useEffect } from "react";
import { ApiReferenceReact } from "@scalar/nextjs-api-reference";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CollectionConfig } from "@/lib/types";
import { generateOpenApiSpec } from "@/lib/openapi";
import { Loader2, FileText } from "lucide-react";

export default function ApiDocsPage() {
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Generating API Documentation...</p>
      </div>
    );
  }

  if (!spec || Object.keys(spec.paths).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Collections Found</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Create some content types in the Schema builder to generate API documentation.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] -mx-8 -mb-8 border-t border-gray-200">
      <ApiReferenceReact
        configuration={{
          spec: {
            content: spec,
          },
          theme: "bluePlanet",
          showSidebar: true,
        }}
      />
    </div>
  );
}
