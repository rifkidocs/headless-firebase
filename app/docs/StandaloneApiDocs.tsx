"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CollectionConfig } from "@/lib/types";
import { generateOpenApiSpec } from "@/lib/openapi";
import { Loader2 } from "lucide-react";

export default function StandaloneApiDocs() {
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

  // Use the Scalar API Reference through a script tag for maximum stability
  useEffect(() => {
    if (!loading && spec) {
      const script = document.createElement("script");
      script.id = "api-reference";
      script.type = "application/json";
      script.innerHTML = JSON.stringify(spec);
      document.body.appendChild(script);

      const scalarScript = document.createElement("script");
      scalarScript.src = "https://cdn.jsdelivr.net/npm/@scalar/api-reference";
      document.body.appendChild(scalarScript);

      return () => {
        const s1 = document.getElementById("api-reference");
        if (s1) s1.remove();
        scalarScript.remove();
        // Clean up scalar injected elements
        const scalarApp = document.querySelector(".scalar-app");
        if (scalarApp) scalarApp.remove();
      };
    }
  }, [loading, spec]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div id="scalar-target"></div>
      <style jsx global>{`
        /* Reset for Scalar CDN */
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: auto !important;
        }
      `}</style>
    </>
  );
}
