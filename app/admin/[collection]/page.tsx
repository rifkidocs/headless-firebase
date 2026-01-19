import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CollectionConfig } from "@/lib/types";
import { constructMetadata } from "@/lib/metadata-utils";
import CollectionListContent from "./CollectionListContent";

async function getCollectionConfig(slug: string): Promise<CollectionConfig | null> {
  try {
    const configDoc = await getDoc(doc(db, "_collections", slug));
    if (configDoc.exists()) {
      return { slug, ...configDoc.data() } as CollectionConfig;
    }
  } catch (e) {
    // This will likely fail on server without Admin SDK
    console.error(e)
    console.warn("Server-side metadata fetch failed, using defaults.");
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

  if (!config) {
    return constructMetadata({ 
      title: `${collectionSlug.charAt(0).toUpperCase() + collectionSlug.slice(1)} | Admin CMS`,
      imageSubtitle: "Collection" 
    });
  }

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

  return (
    <CollectionListContent 
      collectionSlug={collectionSlug} 
    />
  );
}
