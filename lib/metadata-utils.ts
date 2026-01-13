import { Metadata } from "next";
import { getOgImageUrl } from "./og";

interface MetadataOptions {
  title?: string;
  description?: string;
  imageSubtitle?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = "Headless Firebase CMS",
  description = "A flexible and scalable headless CMS built with Next.js, Firebase, and Cloudinary.",
  imageSubtitle,
  noIndex = false,
}: MetadataOptions = {}): Metadata {
  const ogImageUrl = getOgImageUrl(title, imageSubtitle);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
