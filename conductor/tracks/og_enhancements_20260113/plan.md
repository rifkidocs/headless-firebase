# Plan: Open Graph (OG) Enhancements

## Phase 1: Foundation & Cloudinary Integration [checkpoint: 4ac7e58]
- [x] Task: Create `lib/og.ts` utility for Cloudinary URL generation. (5e44184)
    - Implement a function `getOgImageUrl(title, subtitle)` that constructs a Cloudinary URL with text overlays.
    - Configure branding overlays (collection name as subtitle).
- [x] Task: Create `lib/metadata-utils.ts` for centralized Next.js `generateMetadata` logic. (1c6ba1b)
    - Implement `constructMetadata` helper to simplify recurring OG/Twitter tags.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md) (4ac7e58)

## Phase 2: Global and Static Page Enhancements [checkpoint: 7c6e4fc]
- [x] Task: Update Root Layout (`app/layout.tsx`) with global SEO fallbacks. (7c6e4fc)
- [x] Task: Implement metadata for the Home page (`app/page.tsx`). (7c6e4fc)
- [x] Task: Implement metadata for the Admin Login page (`app/admin/login/page.tsx`). (7c6e4fc)
- [x] Task: Implement metadata for the Documentation page (`app/docs/page.tsx`). (7c6e4fc)
- [x] Task: Conductor - User Manual Verification 'Phase 2: Static Pages' (Protocol in workflow.md) (7c6e4fc)

## Phase 3: Dynamic Collection Metadata [checkpoint: 81d7448]
- [x] Task: Implement `generateMetadata` for dynamic collection list pages (`app/admin/[collection]/page.tsx`). (81d7448)
- [x] Task: Implement `generateMetadata` for dynamic collection entry pages (`app/admin/[collection]/[id]/page.tsx`). (81d7448)
    - Logic to fetch entry data and map "Title" and "Description" automatically from fields.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Dynamic Collections' (Protocol in workflow.md) (81d7448)

## Phase 4: Final Review & Quality Gates [checkpoint: 61d9d03]
- [x] Task: Verify OG tag rendering using a local metadata inspector or `curl`. (61d9d03)
- [x] Task: Ensure all Quality Gates (coverage > 80%, linting, mobile check) are met for new code. (61d9d03)
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Review' (Protocol in workflow.md) (61d9d03)
