import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CollectionConfig } from "@/lib/types";
import { constructMetadata } from "@/lib/metadata-utils";
import CollectionFormContent from "./CollectionFormContent";

async function getCollectionConfig(slug: string): Promise<CollectionConfig | null> {
  const configDoc = await getDoc(doc(db, "_collections", slug));
  if (configDoc.exists()) {
    return { slug, ...configDoc.data() } as CollectionConfig;
  }
  return null;
}

async function getEntryData(collectionSlug: string, id: string): Promise<Record<string, any> | null> {
  if (id === "new") return null;
  const docSnap = await getDoc(doc(db, collectionSlug, id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}): Promise<Metadata> {
  const { collection: collectionSlug, id } = await params;
  const config = await getCollectionConfig(collectionSlug);
  
  if (!config) return constructMetadata({ title: "Collection Not Found" });
  if (id === "new") {
    return constructMetadata({
      title: `New ${config.label} | Admin CMS`,
      imageSubtitle: config.label,
    });
  }

  const entryData = await getEntryData(collectionSlug, id);
  if (!entryData) return constructMetadata({ title: "Entry Not Found" });

  // Map title and description automatically
  const titleField = config.fields?.find(f => f.name === "title" || f.name === "name" || f.label.toLowerCase() === "title")?.name || "id";
  const descField = config.fields?.find(f => f.type === "textarea" || f.type === "richtext")?.name;

  const entryTitle = String(entryData[titleField] || id);
  let entryDesc = descField ? String(entryData[descField] || "") : "";
  
  // Clean HTML if it's rich text
  entryDesc = entryDesc.replace(/<[^>]*>?/gm, "").substring(0, 160);

  return constructMetadata({
    title: `${entryTitle} | ${config.label}`,
    description: entryDesc || `Editing entry in ${config.label}`,
    imageSubtitle: config.label,
  });
}

export default async function CollectionFormPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: collectionSlug, id } = await params;
  const config = await getCollectionConfig(collectionSlug);
  const entryData = await getEntryData(collectionSlug, id);

  if (!config) {
    return notFound();
  }

  return (
    <CollectionFormContent 
      collectionSlug={collectionSlug} 
      id={id}
      initialConfig={config}
      initialData={entryData}
    />
  );
}