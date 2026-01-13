import { cloudinary } from "./cloudinary";

/**
 * Generates a Cloudinary URL for a dynamic Open Graph image with text overlays.
 * 
 * @param title The main title to display on the image
 * @param subtitle Optional subtitle (e.g., collection name)
 * @returns A signed or unsigned Cloudinary URL
 */
export function getOgImageUrl(title: string, subtitle?: string): string {
  // Use a solid color or a base image. 
  // For now, we'll use a neutral background if no base image is specified.
  const baseImage = "og-base"; 

  const transformations: any[] = [
    { width: 1200, height: 630, crop: "fill" },
  ];

  // Title overlay
  transformations.push({
    overlay: {
      font_family: "Arial",
      font_size: 60,
      font_weight: "bold",
      text: title, // Cloudinary SDK handles encoding
    },
    color: "white",
    gravity: "center",
    y: subtitle ? -40 : 0,
  });

  // Subtitle overlay
  if (subtitle) {
    transformations.push({
      overlay: {
        font_family: "Arial",
        font_size: 30,
        text: subtitle,
      },
      color: "rgba:255:255:255:0.8",
      gravity: "center",
      y: 60,
    });
  }

  return cloudinary.url(baseImage, {
    secure: true,
    transformation: transformations,
  });
}