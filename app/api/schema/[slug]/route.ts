import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { deleteResources } from "@/lib/cloudinary";
import { CollectionConfig } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Auth Check
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        await adminAuth.verifyIdToken(token);
    } catch (e) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Get Schema
    const schemaDoc = await adminDb.collection("_collections").doc(slug).get();
    if (!schemaDoc.exists) {
      return NextResponse.json({ error: "Schema not found" }, { status: 404 });
    }
    const schema = schemaDoc.data() as CollectionConfig;

    // 3. Identify Media Fields
    const mediaFields = schema.fields?.filter((f) => f.type === "media") || [];

    // 4. Fetch All Documents
    const snapshot = await adminDb.collection(slug).get();
    const docs = snapshot.docs;

    // 5. Collect Media Public IDs
    const publicIds: string[] = [];
    if (mediaFields.length > 0) {
      docs.forEach((doc) => {
        const data = doc.data();
        mediaFields.forEach((field) => {
          const value = data[field.name];
          if (value) {
            if (Array.isArray(value)) {
               value.forEach((item: any) => {
                 if (item?.publicId) publicIds.push(item.publicId);
               });
            } else if (value?.publicId) {
               publicIds.push(value.publicId);
            }
          }
        });
      });
    }

    // 6. Delete Media from Cloudinary
    // Remove duplicates
    const uniquePublicIds = Array.from(new Set(publicIds));
    if (uniquePublicIds.length > 0) {
      const chunk_size = 100;
      for (let i = 0; i < uniquePublicIds.length; i += chunk_size) {
         const chunk = uniquePublicIds.slice(i, i + chunk_size);
         try {
             await deleteResources(chunk);
         } catch (e) {
             console.error("Failed to delete media chunk:", e);
             // Continue deletion of other assets/docs even if some media fails?
             // Specification says "synchronously" and implies atomicity?
             // Firestore doesn't support transaction across Cloudinary.
             // Best effort: log and continue.
         }
      }
    }

    // 7. Batch Delete Firestore Docs
    const batchSize = 500;
    const chunks = [];
    for (let i = 0; i < docs.length; i += batchSize) {
      chunks.push(docs.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      const batch = adminDb.batch();
      chunk.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // 8. Delete Schema Definition
    await adminDb.collection("_collections").doc(slug).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Schema Error:", error);
    return NextResponse.json(
      { error: "Failed to delete schema and content" },
      { status: 500 }
    );
  }
}
