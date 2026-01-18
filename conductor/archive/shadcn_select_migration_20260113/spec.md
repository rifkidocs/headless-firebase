# Specification: Shadcn/UI Select & Combobox Migration

## Overview
Replace all browser-native `<select>` elements and standard selection lists throughout the Admin portal with modern, accessible components from shadcn/ui. This includes standard dropdowns, searchable comboboxes for relations, and a badge-style multi-select interface.

## Functional Requirements
- **Standard Select Replacement:** Replace all fixed-list dropdowns (e.g., Enumeration fields, field types, etc.) with the shadcn/ui `Select` component.
- **Searchable Combobox:** Replace single-selection dynamic lists (e.g., Single Relation fields) with a searchable `Combobox` (using Popover and Command primitives).
- **Badge-Style Multi-Select:** Replace multiple-selection lists (e.g., "Has Many" or "Many to Many" relations) with an interface where selected items appear as removable badges, and new items are added via a searchable combobox.
- **Form Integration:** Ensure all new components integrate seamlessly with `react-hook-form` and maintain existing validation logic.
- **Accessibility:** All new components must meet ARIA standards for accessibility, supporting keyboard navigation and screen readers.

## Non-Functional Requirements
- **Consistency:** Ensure the visual style matches the existing shadcn-like theme (clean, minimal, white).
- **Performance:** Optimize the searchable combobox for large lists of dynamic data.

## Acceptance Criteria
- [ ] All native `<select>` tags in the admin forms are replaced.
- [ ] Relation fields are searchable and provide a better UX for large collections.
- [ ] Multi-select relations display selected items as clear, removable badges.
- [ ] Keyboard navigation (Tab, Arrow keys, Enter) works correctly for all new selection inputs.
- [ ] Forms submit successfully with the new components.

## Out of Scope
- Modification of non-input dropdowns (like navigation menus) unless they use native select elements.
- Implementation of complex drag-and-drop within the multi-select (this remains a separate enhancement).
