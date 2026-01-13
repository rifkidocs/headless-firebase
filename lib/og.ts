/**
 * Generates a URL for the dynamic Open Graph image API.
 * 
 * @param title The main title to display on the image
 * @param subtitle Optional subtitle (e.g., collection name)
 * @returns A URL pointing to the local OG image generator API
 */
export function getOgImageUrl(title: string, subtitle?: string): string {
  // In production, we should use a absolute URL. 
  // Next.js Metadata API handles relative URLs if metadataBase is set,
  // but for the twitter:image and og:image tags, it's safer to provide the path.
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const params = new URLSearchParams();
  params.set('title', title);
  if (subtitle) params.set('subtitle', subtitle);

  return `${baseUrl}/api/og?${params.toString()}`;
}
