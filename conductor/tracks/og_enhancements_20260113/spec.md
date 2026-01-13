# Specification: Open Graph (OG) Enhancements

## Overview
Improve the social sharing experience and SEO across the Headless Firebase CMS by implementing comprehensive Open Graph (OG) and Twitter metadata. This includes dynamically generated preview images using Cloudinary for all pages, including dynamic content collections.

## Functional Requirements
- **Centralized Metadata Logic:** Create a robust utility to handle metadata generation using Next.js `generateMetadata` API.
- **Dynamic Cloudinary OG Images:** 
    - Implement a service to construct Cloudinary URLs with dynamic text overlays.
    - Images for collection entries must include the collection name (e.g., "Blog", "Products") as a prominent branding element.
    - Images should feature the entry's title or the page name.
- **Content Mapping:**
    - For Dynamic Collections: Automatically map the "Title" to the entry's primary title field and "Description" to a truncated version of the first available text/rich-text field.
- **Page-Specific Metadata:**
    - **Home Page:** High-level branding and site description.
    - **Admin Login:** Professional "Admin Portal" branding.
    - **Public Documentation:** Clear titles indicating the specific API or guide section.
- **Fallback Mechanisms:** Implement sensible defaults for descriptions and images if specific content is missing.

## Non-Functional Requirements
- **Performance:** Ensure metadata generation does not significantly impact page load times.
- **Maintainability:** Use a consistent pattern that can easily be extended to new page types.

## Acceptance Criteria
- [ ] Social sharing previews (Meta/Facebook, Twitter, LinkedIn) correctly display dynamic titles and descriptions.
- [ ] OG images are successfully generated and rendered with dynamic text overlays.
- [ ] Dynamic collection entries show their respective collection name on the OG image.
- [ ] The "Description" for entries accurately reflects the beginning of their content.
- [ ] All pages (Home, Login, Docs, Admin) have valid OG tags in the `<head>`.

## Out of Scope
- Implementation of a full SEO dashboard for users to manually override all tags (this is handled by "Automatic Mapping").
- Generation of non-OG metadata (like JSON-LD) unless required for basic SEO.
