# Plan: API Documentation & Public Access Control

This plan covers the implementation of automated API documentation using Scalar and a granular public access control system for the REST API.

## Phase 1: API Permissions Backend & Infrastructure [checkpoint: cd65a9f]
Focus on the data model and permission checking logic.

- [x] Task: Create unit tests for the Public Permission storage and retrieval. b4fbcb1
- [x] Task: Extend the `_collections` (or create a dedicated `_permissions`) collection in Firestore to store public access toggles. 535fb6f
- [x] Task: Implement a centralized middleware or utility function to check public access permissions for a given route and method. 535fb6f
- [x] Task: Integrate the permission check into the existing API routes (`app/api/...`). 70bf99b
- [x] Task: Conductor - User Manual Verification 'Phase 1: API Permissions Backend & Infrastructure'

## Phase 2: Public API Permissions UI [checkpoint: c0891d8]
Build the interface for admins to manage public access.

- [x] Task: Create unit tests for the API Permission Matrix UI component. e50ac8c
- [x] Task: Create a new `ApiPermissions` component that displays the Content Type / CRUD matrix. e50ac8c
- [x] Task: Integrate the `ApiPermissions` component into the "Roles & Permissions" (admin/roles) section. ddf2392
- [x] Task: Implement save functionality to persist permission changes to Firestore. c0891d8
- [x] Task: Conductor - User Manual Verification 'Phase 2: Public API Permissions UI'

## Phase 3: Scalar API Documentation [checkpoint: c0f7be0]
Implement the interactive documentation interface.

- [x] Task: Create unit tests for the OpenAPI specification generator. 628c96c
- [x] Task: Implement a dynamic OpenAPI spec generator that iterates through existing Firestore collection schemas. c2ea0a3
- [x] Task: Install `@scalar/api-reference` and create the `/admin/docs` page. c2ea0a3
- [x] Task: Secure the `/admin/docs` route to ensure it's only accessible to authenticated admin users. c2ea0a3
- [x] Task: Conductor - User Manual Verification 'Phase 3: Scalar API Documentation'

## Phase 4: Integration & Validation [checkpoint: c0f7be0]
Final testing and polishing.

- [x] Task: Create integration tests verifying that public endpoints are correctly allowed/blocked. 53e9052
- [x] Task: Perform a security audit of the permission check logic. 53e9052
- [x] Task: Apply final UI polishes to the permission matrix. 53e9052
- [x] Task: Conductor - User Manual Verification 'Phase 4: Integration & Validation'
