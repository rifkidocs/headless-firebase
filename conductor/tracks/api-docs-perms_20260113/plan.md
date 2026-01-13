# Plan: API Documentation & Public Access Control

This plan covers the implementation of automated API documentation using Scalar and a granular public access control system for the REST API.

## Phase 1: API Permissions Backend & Infrastructure
Focus on the data model and permission checking logic.

- [x] Task: Create unit tests for the Public Permission storage and retrieval. b4fbcb1
- [x] Task: Extend the `_collections` (or create a dedicated `_permissions`) collection in Firestore to store public access toggles. 535fb6f
- [ ] Task: Implement a centralized middleware or utility function to check public access permissions for a given route and method.
- [ ] Task: Integrate the permission check into the existing API routes (`app/api/v1/...`).
- [ ] Task: Conductor - User Manual Verification 'Phase 1: API Permissions Backend & Infrastructure' (Protocol in workflow.md)

## Phase 2: Public API Permissions UI
Build the interface for admins to manage public access.

- [ ] Task: Create unit tests for the API Permission Matrix UI component.
- [ ] Task: Create a new `ApiPermissions` component that displays the Content Type / CRUD matrix.
- [ ] Task: Integrate the `ApiPermissions` component into the "Roles & Permissions" (admin/roles) section.
- [ ] Task: Implement save functionality to persist permission changes to Firestore.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Public API Permissions UI' (Protocol in workflow.md)

## Phase 3: Scalar API Documentation
Implement the interactive documentation interface.

- [ ] Task: Create unit tests for the OpenAPI specification generator.
- [ ] Task: Implement a dynamic OpenAPI spec generator that iterates through existing Firestore collection schemas.
- [ ] Task: Install `@scalar/api-reference` and create the `/admin/docs` page.
- [ ] Task: Secure the `/admin/docs` route to ensure it's only accessible to authenticated admin users.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Scalar API Documentation' (Protocol in workflow.md)

## Phase 4: Integration & Validation
Final testing and polishing.

- [ ] Task: Create integration tests verifying that public endpoints are correctly allowed/blocked.
- [ ] Task: Perform a security audit of the permission check logic.
- [ ] Task: Apply final UI polishes to the permission matrix.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Integration & Validation' (Protocol in workflow.md)
