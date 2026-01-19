import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    public_id: string;
    secure_url: string;
    url: string;
    resource_type: "image" | "video" | "raw";
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
    folder: string;
    original_filename: string;
}

export interface UploadOptions {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
    transformation?: Record<string, unknown>;
}

export async function uploadToCloudinary(
    file: string | Buffer,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const { folder = "cms-media", resource_type = "auto", ...rest } = options;

    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type,
            ...rest,
        };

        if (typeof file === "string" && file.startsWith("data:")) {
            // Base64 data URL
            cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
                if (error) reject(error);
                else if (!result) reject(new Error("Upload failed"));
                else resolve(result as unknown as UploadResult);
            });
        } else if (Buffer.isBuffer(file)) {
            // Buffer upload via stream
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) reject(error);
                    else if (!result) reject(new Error("Upload failed"));
                    else resolve(result as unknown as UploadResult);
                }
            );
            uploadStream.end(file);
        } else {
            // URL or file path
            cloudinary.uploader.upload(file as string, uploadOptions, (error, result) => {
                if (error) reject(error);
                else if (!result) reject(new Error("Upload failed"));
                else resolve(result as unknown as UploadResult);
            });
        }
    });
}

export async function deleteFromCloudinary(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
): Promise<{ result: string }> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            publicId,
            { resource_type: resourceType },
            (error, result) => {
                if (error) reject(error);
                else resolve(result as { result: string });
            }
        );
    });
}

export async function deleteResources(
    publicIds: string[],
    resourceType: "image" | "video" | "raw" = "image"
): Promise<{ deleted: Record<string, string> }> {
    if (publicIds.length === 0) return { deleted: {} };
    
    return new Promise((resolve, reject) => {
        cloudinary.api.delete_resources(
            publicIds,
            { resource_type: resourceType },
            (error, result) => {
                if (error) reject(error);
                else resolve(result as { deleted: Record<string, string> });
            }
        );
    });
}

export function getCloudinaryUrl(
    publicId: string,
    options: Record<string, unknown> = {}
): string {
    return cloudinary.url(publicId, {
        secure: true,
        ...options,
    });
}

export function getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number,
    quality: number = 80
): string {
    const transformation: Record<string, unknown> = {
        quality: `auto:${quality > 80 ? "best" : quality > 50 ? "good" : "eco"}`,
        fetch_format: "auto",
    };

    if (width) transformation.width = width;
    if (height) transformation.height = height;
    if (width || height) transformation.crop = "fill";

    return cloudinary.url(publicId, {
        secure: true,
        transformation,
    });
}

export { cloudinary };
