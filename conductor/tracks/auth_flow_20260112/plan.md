# Plan: Create User Authentication Flow

## Phase 1: Foundation & Setup [checkpoint: 2a87a65]
- [x] Task: Create Login Page Structure 6fa26be
    - [ ] Subtask: Create `/app/admin/login/page.tsx` skeleton.
    - [ ] Subtask: Implement basic layout using Tailwind CSS.
- [x] Task: Set up Auth Context/Hooks 07ede34
    - [ ] Subtask: Create a custom hook `useAuth` wrapping Firebase `onAuthStateChanged`.
    - [ ] Subtask: Create an AuthProvider component if necessary for global state.

## Phase 2: Login Form Implementation
- [x] Task: Implement Login Form with Validation 6750ee4
    - [ ] Subtask: Define Zod schema for login (email, password).
    - [ ] Subtask: Create form component using `react-hook-form` and `zod-resolver`.
    - [ ] Subtask: Implement input fields with error states.
- [ ] Task: Integrate Firebase Authentication
    - [ ] Subtask: Connect form submission to `signInWithEmailAndPassword`.
    - [ ] Subtask: Handle loading states (disable button, show spinner).
    - [ ] Subtask: Handle specific Firebase errors (e.g., `auth/user-not-found`, `auth/wrong-password`) and display user-friendly messages via `react-hot-toast`.

## Phase 3: Route Protection & Redirection
- [ ] Task: Implement Route Protection
    - [ ] Subtask: Create a utility or High-Order Component (HOC) to check auth state.
    - [ ] Subtask: Apply protection to `/admin` layout or pages.
    - [ ] Subtask: Implement logic to redirect unauthenticated users to `/admin/login`.
    - [ ] Subtask: Implement logic to redirect already authenticated users from `/login` to `/admin`.

## Phase 4: Verification
- [ ] Task: Manual Verification
    - [ ] Subtask: Test login with valid credentials.
    - [ ] Subtask: Test login with invalid credentials (wrong password, non-existent user).
    - [ ] Subtask: Verify redirection when accessing protected routes directly.
    - [ ] Task: Conductor - User Manual Verification 'Verification' (Protocol in workflow.md)
