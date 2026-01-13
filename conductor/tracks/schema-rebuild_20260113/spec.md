# Specification: Schema Editor UI/UX Rebuild

## Overview
This track focuses on rebuilding the schema creation and editing interface (specifically `/admin/schema/new`) to resolve usability issues related to cramped space and poor visibility. The goal is to provide a more spacious, intuitive, and modern experience for building content schemas.

## Track Type
Feature / UI-UX Refactor

## Functional Requirements
1.  **Full-Screen "Add Field" Modal:** Replace the narrow side drawer with a centered, large-scale modal for adding and editing fields.
2.  **Two-Column Configuration Layout:** Organize field settings (Name, Key, Type, Validation, etc.) into a two-column grid within the modal to maximize visibility and reduce vertical scrolling.
3.  **Drag-and-Drop Reordering:** Enable users to reorder existing fields within the main schema view using drag-and-drop interactions.
4.  **Auto-focus Enhancement:** Automatically focus the "Display Name" input field immediately upon opening the field modal.
5.  **Enhanced Empty State:** Redesign the "Click 'Add Field' to start" card to occupy the full height of the viewport, providing a clearer call to action.

## Non-Functional Requirements
- **Responsive Design:** Ensure the new modal and grid layout adapt gracefully to different screen sizes.
- **Smooth Animations:** Implement polished transitions for modal entry/exit and drag-and-drop reordering.
- **Consistency:** Maintain design alignment with the existing admin dashboard and `tech-stack.md` (likely using Tailwind CSS and Headless UI or similar).

## Acceptance Criteria
- [ ] Clicking "Add Field" opens a large modal instead of a side drawer.
- [ ] The configuration form inside the modal is displayed in two columns.
- [ ] The "Display Name" field receives focus as soon as the modal is opened.
- [ ] Fields in the schema list can be successfully reordered by dragging.
- [ ] The empty state card fills the page height as requested.

## Out of Scope
- Backend database schema changes (this is a UI/UX refactor of the existing structure).
- Adding complex new field types beyond what is currently supported.
