# Specification: Cascading Delete for Schemas

## 1. Overview
This feature implements a "Cascading Delete" mechanism for the Content Management System. When an administrator deletes a Collection Type or Single Type schema, the system will now automatically and permanently delete all associated content documents from Firestore and their linked media assets from Cloudinary. This action is irreversible and protected by a strict UI confirmation step.

## 2. Functional Requirements

### 2.1. Schema Deletion Workflow
-   **Trigger:** Admin initiates deletion of a schema (Collection Type or Single Type) from the Schema Management interface.
-   **Strict Confirmation:**
    -   A modal/dialog must appear warning of permanent data loss.
    -   The user is **required** to type the exact name of the schema/collection to enable the "Delete" button.
-   **Synchronous Execution:**
    -   Upon confirmation, the UI displays a loading state (e.g., spinner, progress bar) and blocks interaction.
    -   The client waits for the server/API to complete the entire deletion process before returning control.

### 2.2. Data Cleanup (Backend)
-   **Firestore Documents:**
    -   Query and permanently hard-delete all documents belonging to the target collection/single type.
-   **Cloudinary Media:**
    -   Iterate through the deleted documents to identify media fields.
    -   Extract `public_id`s from media objects.
    -   Permanently delete these assets from Cloudinary.
    -   **Constraint:** Deletion is performed without checking for references in other collections (per user requirement: media is not shared).

## 3. Non-Functional Requirements
-   **Performance:** The synchronous operation should handle typical collection sizes within a reasonable timeout. (Note: Extremely large collections might face timeout issues, but acceptable for current scale).
-   **Safety:** The "Type name to confirm" step is non-bypassable.
-   **Feedback:** Success or Error notifications must be displayed immediately after the process completes.

## 4. Acceptance Criteria
-   [ ] **Verify UI:** Clicking "Delete" on a schema opens a modal requiring the schema name input.
-   [ ] **Verify Firestore:** After deletion, no documents for that collection ID exist in Firestore.
-   [ ] **Verify Cloudinary:** Media files associated with the deleted documents are removed from the Cloudinary dashboard.
-   [ ] **Verify Sync Flow:** The UI waits and shows a "Deleting..." state until the backend confirms completion.

## 5. Out of Scope
-   **Background Jobs:** Asynchronous queue processing is explicitly excluded (Synchronous required).
-   **Reference Checking:** No logic to check if media is used elsewhere before deletion.
-   **Soft Deletes:** No archive or restore functionality.
