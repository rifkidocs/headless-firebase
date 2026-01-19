# Implementation Plan - Cascading Delete

## Phase 1: Backend Foundation & API
- [x] Task: Initialize Firebase Admin SDK 0d3ff3d
    - [x] Create `lib/firebase-admin.ts` to export initialized admin app.
    - [x] Ensure environment variables for Service Account are properly handled/documented.
- [x] Task: Create Cascading Delete API Endpoint c7ea779
    - [x] Create `__tests__/api/schema/delete.test.ts` (Integration Test).
        - Test: Should return 401 if unauthorized.
        - Test: Should delete Cloudinary assets (mocked).
        - Test: Should batch delete Firestore documents (mocked).
        - Test: Should delete the schema document (mocked).
    - [x] Implement `DELETE /api/schema/[slug]/route.ts`.
        - Verify Admin Authentication.
        - Fetch schema definition to find 'media' type fields.
        - Query all documents in the target collection.
        - Extract Cloudinary `public_id`s from media fields.
        - Execute `cloudinary.api.delete_resources` (or similar from `lib/cloudinary`).
        - Execute Firestore Batch Delete for content documents.
        - Delete the Schema definition document.
- [ ] Task: Conductor - User Manual Verification 'Backend Foundation & API' (Protocol in workflow.md)

## Phase 2: Frontend UI & Integration
- [ ] Task: Create Strict Confirmation Dialog
    - [ ] Create `__tests__/components/ui/StrictConfirmDialog.test.tsx`.
        - Test: specific input validation (must match name).
        - Test: Delete button disabled until match.
    - [ ] Implement `components/ui/StrictConfirmDialog.tsx`.
        - Props: `isOpen`, `onClose`, `onConfirm`, `title`, `collectionName`.
- [ ] Task: Integrate Deletion Logic in Schema List
    - [ ] Modify `app/admin/schema/page.tsx`.
        - Replace `ConfirmDialog` with `StrictConfirmDialog`.
        - Update `handleDelete` to call `DELETE /api/schema/[slug]`.
        - Add loading state handling during the async API call.
        - Add success/error toast notifications.
- [ ] Task: Conductor - User Manual Verification 'Frontend UI & Integration' (Protocol in workflow.md)