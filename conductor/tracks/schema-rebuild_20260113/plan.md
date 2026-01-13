# Plan: Schema Editor UI/UX Rebuild

This plan covers the rebuilding of the schema creation and editing interface to improve space, visibility, and overall UX, as defined in `spec.md`.

## Phase 1: Foundation & Empty State [checkpoint: c05244e]
Focus on the initial view and preparing the infrastructure for the new modal system.

- [x] Task: Create unit tests for the enhanced Empty State component. 4ffa465
- [x] Task: Redesign the "Click 'Add Field' to start" card to occupy full viewport height. 506afc9
- [x] Task: Implement basic layout adjustments for `/admin/schema/new` to support full-height content. 789d666
- [x] Task: Conductor - User Manual Verification 'Phase 1: Foundation & Empty State' (Protocol in workflow.md)

## Phase 2: Full-Screen Field Modal [checkpoint: f91ead3]
Implement the core "Add Field" experience using a large modal and two-column layout.

- [x] Task: Create unit tests for the new `FieldModal` component (focusing on visibility and auto-focus). 06de83d
- [x] Task: Implement the `FieldModal` component using a large-scale modal (e.g., Headless UI Dialog). dd2d5a0
- [x] Task: Implement the two-column grid layout for field configuration inputs inside the modal. 47af547
- [x] Task: Add auto-focus logic to the "Display Name" input field within the modal. 512a59a
- [x] Task: Conductor - User Manual Verification 'Phase 2: Full-Screen Field Modal' (Protocol in workflow.md)

## Phase 3: Drag-and-Drop Reordering [checkpoint: 2e53a4b]
Add interactive reordering to the schema field list.

- [x] Task: Create unit tests for the drag-and-drop reordering logic. ad33d01
- [x] Task: Integrate a drag-and-drop library (e.g., `@dnd-kit` or `react-beautiful-dnd`) into the field list. 38d0593
- [x] Task: Implement the UI feedback for dragging (sortable list, drag handles, animations). 3e53e0c
- [x] Task: Conductor - User Manual Verification 'Phase 3: Drag-and-Drop Reordering' (Protocol in workflow.md)

## Phase 4: Integration & Polishing
Ensure all components work together seamlessly and meet the visual standards.

- [x] Task: Create integration tests for the full "Add -> Reorder -> Edit" flow. 7fad925
- [x] Task: Connect the new Modal and Reordering logic to the existing schema state management. 38952bb
- [ ] Task: Apply final styling polishes and transitions (Tailwind CSS).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Integration & Polishing' (Protocol in workflow.md)
