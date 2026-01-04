import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;
        const resourceType = request.nextUrl.searchParams.get("resourceType") as "image" | "video" | "raw" || "image";

        // Decode the public ID (it might be URL encoded)
        const decodedPublicId = decodeURIComponent(publicId);

        const result = await deleteFromCloudinary(decodedPublicId, resourceType);

        if (result.result === "ok" || result.result === "not found") {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
