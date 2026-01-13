# Plan: Shadcn/UI Select & Combobox Migration

## Phase 1: Component Installation & Setup
- [x] Task: Install shadcn/ui dependencies. (15856)
- [~] Task: Create `components/ui/Combobox.tsx` wrapper.
    - Implement a reusable Combobox component using Popover and Command primitives for easier integration.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Setup' (Protocol in workflow.md)

## Phase 2: Core Form Component Migration
- [ ] Task: Update `CollectionFormContent.tsx` to use Shadcn Select.
    - Replace native `<select>` for Enumeration fields.
- [ ] Task: Implement Searchable Combobox for Single Relations.
    - Update `CollectionFormContent.tsx` relation logic.
- [ ] Task: Implement Badge-Style Multi-Select for Multiple Relations.
    - Update `CollectionFormContent.tsx` relation logic to show badges and a combobox.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Form Migration' (Protocol in workflow.md)

## Phase 3: Schema & System UI Migration
- [ ] Task: Update Field Modal (`components/cms/FieldModal.tsx` or similar).
    - Replace native selects for field type and relation target selection.
- [ ] Task: Update remaining system selects (e.g., Role selection in Users page).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: System UI' (Protocol in workflow.md)

## Phase 4: Final Polishing & Quality Gates
- [ ] Task: Verify form validation and keyboard accessibility across all new inputs.
- [ ] Task: Ensure all Quality Gates (coverage > 80%, linting, mobile check) are met.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Review' (Protocol in workflow.md)
