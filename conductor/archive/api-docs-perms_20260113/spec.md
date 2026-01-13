# Specification: API Documentation & Public Access Control

## Overview
This track focuses on two main objectives: 1) Providing an interactive REST API documentation interface for developers, and 2) Implementing a granular permission system to control Public API access for each Collection Type.

## Track Type
Feature

## Functional Requirements

### 1. API Documentation
*   **Library:** Use **Scalar** (`@scalar/api-reference`) for rendering the API documentation.
*   **Access Control:** The documentation page must be **Authenticated Only** (accessible only to logged-in admin users).
*   **Content:** The documentation should automatically reflect the available endpoints based on the defined collections.

### 2. Public API Permissions
*   **Configuration Interface:** Integrate a new "Public API" permission configuration within the existing **Roles & Permissions** section (or a closely related area).
*   **Granularity:**
    *   Display a list of all Content Types.
    *   For each Content Type, provide checkboxes for the following actions:
        *   **FIND (GET)**
        *   **FIND ONE (GET)**
        *   **CREATE (POST)**
        *   **UPDATE (PUT/PATCH)**
        *   **DELETE (DELETE)**
*   **Behavior:**
    *   If a checkbox is checked (e.g., "READ"), the corresponding public API endpoint (e.g., `GET /api/v1/posts`) becomes accessible without an API key or auth token.
    *   If unchecked, the endpoint requires authentication (or returns 403 Forbidden).

## Non-Functional Requirements
*   **Security:** Ensure that enabling a public permission *only* exposes the specific method selected and nothing else.
*   **Performance:** Permission checks should be efficient and not add significant latency to API requests.
*   **UI/UX:** The permission matrix should be intuitive and clearly labeled (e.g., "Public Access Control").

## Acceptance Criteria
- [ ] Admin users can access a `/admin/docs` (or similar) route to view Scalar API docs.
- [ ] Non-authenticated users are redirected to login when trying to access docs.
- [ ] A new section/interface exists for "Public API Permissions".
- [ ] Admins can toggle FIND, FIND ONE, CREATE, UPDATE, DELETE permissions for each collection.
- [ ] Public requests to a "checked" endpoint succeed.
- [ ] Public requests to an "unchecked" endpoint fail with 401/403.

## Out of Scope
- API Key management (this track focuses on *Public* anonymous access permissions).
