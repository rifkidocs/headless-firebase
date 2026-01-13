import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CollectionConfig } from "@/lib/types";
import { constructMetadata } from "@/lib/metadata-utils";
import CollectionListContent from "./CollectionListContent";

// Note: In a real production app with high traffic, 
// we should use firebase-admin on the server side for better performance 
// and to avoid client-side SDK initialization on every metadata request.
// For this prototype, we'll use the client SDK as it's already configured.

async function getCollectionConfig(slug: string): Promise<CollectionConfig | null> {
  const configDoc = await getDoc(doc(db, "_collections", slug));
  if (configDoc.exists()) {
    return { slug, ...configDoc.data() } as CollectionConfig;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: collectionSlug } = await params;
  const config = await getCollectionConfig(collectionSlug);

  if (!config) return constructMetadata({ title: "Collection Not Found" });

  return constructMetadata({
    title: `${config.label} | Admin CMS`,
    description: `Manage entries for the ${config.label} collection.`,
    imageSubtitle: "Collection",
  });
}

export default async function CollectionListPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: collectionSlug } = await params;
  const config = await getCollectionConfig(collectionSlug);

  if (!config) {
    return notFound();
  }

  return (
    <CollectionListContent 
      collectionSlug={collectionSlug} 
      initialConfig={config} 
    />
  );
}