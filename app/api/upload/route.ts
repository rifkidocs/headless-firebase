import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, UploadResult } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES: Record<string, string[]> = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    video: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    audio: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm"],
    raw: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
};

function getResourceType(mimeType: string): "image" | "video" | "raw" {
    if (ALLOWED_TYPES.image.includes(mimeType)) return "image";
    if (ALLOWED_TYPES.video.includes(mimeType)) return "video";
    return "raw";
}

function isAllowedType(mimeType: string): boolean {
    return Object.values(ALLOWED_TYPES).flat().includes(mimeType);
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "cms-media";

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size exceeds 50MB limit" },
                { status: 400 }
            );
        }

        if (!isAllowedType(file.type)) {
            return NextResponse.json(
                { error: `File type ${file.type} is not allowed` },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const resourceType = getResourceType(file.type);

        const result: UploadResult = await uploadToCloudinary(buffer, {
            folder,
            resource_type: resourceType,
        });

        return NextResponse.json({
            success: true,
            data: {
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                resourceType: result.resource_type,
                format: result.format,
                bytes: result.bytes,
                width: result.width,
                height: result.height,
                duration: result.duration,
                folder: result.folder,
                originalFilename: result.original_filename,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
