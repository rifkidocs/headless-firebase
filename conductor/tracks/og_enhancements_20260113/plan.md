# Plan: Open Graph (OG) Enhancements

## Phase 1: Foundation & Cloudinary Integration [checkpoint: 4ac7e58]
- [x] Task: Create `lib/og.ts` utility for Cloudinary URL generation. (5e44184)
    - Implement a function `getOgImageUrl(title, subtitle)` that constructs a Cloudinary URL with text overlays.
    - Configure branding overlays (collection name as subtitle).
- [x] Task: Create `lib/metadata-utils.ts` for centralized Next.js `generateMetadata` logic. (1c6ba1b)
    - Implement `constructMetadata` helper to simplify recurring OG/Twitter tags.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation' (Protocol in workflow.md) (4ac7e58)

## Phase 2: Global and Static Page Enhancements
- [~] Task: Update Root Layout (`app/layout.tsx`) with global SEO fallbacks.
- [~] Task: Implement metadata for the Home page (`app/page.tsx`).
- [~] Task: Implement metadata for the Admin Login page (`app/admin/login/page.tsx`).
- [~] Task: Implement metadata for the Documentation page (`app/docs/page.tsx`).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Static Pages' (Protocol in workflow.md)

## Phase 3: Dynamic Collection Metadata
- [~] Task: Implement `generateMetadata` for dynamic collection list pages (`app/admin/[collection]/page.tsx`).
- [~] Task: Implement `generateMetadata` for dynamic collection entry pages (`app/admin/[collection]/[id]/page.tsx`).
    - Logic to fetch entry data and map "Title" and "Description" automatically from fields.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dynamic Collections' (Protocol in workflow.md)

## Phase 4: Final Review & Quality Gates
- [ ] Task: Verify OG tag rendering using a local metadata inspector or `curl`.
- [ ] Task: Ensure all Quality Gates (coverage > 80%, linting, mobile check) are met for new code.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Review' (Protocol in workflow.md)
