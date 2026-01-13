# Plan: Shadcn/UI Select & Combobox Migration

## Phase 1: Component Installation & Setup [checkpoint: fdcebe1]
- [x] Task: Install shadcn/ui dependencies. (15856)
- [x] Task: Create `components/ui/Combobox.tsx` wrapper. (fdcebe1)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup' (Protocol in workflow.md) (fdcebe1)

## Phase 2: Core Form Component Migration
- [x] Task: Update `CollectionFormContent.tsx` to use Shadcn Select. (295a6cd)
- [x] Task: Implement Searchable Combobox for Single Relations. (295a6cd)
- [x] Task: Implement Badge-Style Multi-Select for Multiple Relations. (fdcebe1)
    - Update `CollectionFormContent.tsx` relation logic to show badges and a combobox.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Form Migration' (Protocol in workflow.md) (fdcebe1)

## Phase 3: Schema & System UI Migration
- [x] Task: Update Field Modal (`components/cms/FieldModal.tsx` or similar). (fdcebe1)
    - Replace native selects for field type and relation target selection.
- [x] Task: Update remaining system selects (e.g., Role selection in Users page). (fdcebe1)
- [x] Task: Conductor - User Manual Verification 'Phase 3: System UI' (Protocol in workflow.md) (fdcebe1)

## Phase 4: Final Review & Quality Gates [checkpoint: fdcebe1]
- [x] Task: Verify form validation and keyboard accessibility across all new inputs. (fdcebe1)
- [x] Task: Ensure all Quality Gates (coverage > 80%, linting, mobile check) are met. (fdcebe1)
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Review' (Protocol in workflow.md) (fdcebe1)
