# Plan: Create User Authentication Flow

## Phase 1: Foundation & Setup [checkpoint: 2a87a65]
- [x] Task: Create Login Page Structure 6fa26be
    - [x] Subtask: Create `/app/admin/login/page.tsx` skeleton.
    - [x] Subtask: Implement basic layout using Tailwind CSS.
- [x] Task: Set up Auth Context/Hooks 07ede34
    - [x] Subtask: Create a custom hook `useAuth` wrapping Firebase `onAuthStateChanged`.
    - [x] Subtask: Create an AuthProvider component if necessary for global state.

## Phase 2: Login Form Implementation
- [x] Task: Implement Login Form with Validation 6750ee4
    - [x] Subtask: Define Zod schema for login (email, password).
    - [x] Subtask: Create form component using `react-hook-form` and `zod-resolver`.
    - [x] Subtask: Implement input fields with error states.
- [x] Task: Integrate Firebase Authentication 31b6fb3
    - [x] Subtask: Connect form submission to `signInWithEmailAndPassword`.
    - [x] Subtask: Handle loading states (disable button, show spinner).
    - [x] Subtask: Handle specific Firebase errors (e.g., `auth/user-not-found`, `auth/wrong-password`) and display user-friendly messages via `react-hot-toast`.

## Phase 3: Route Protection & Redirection
- [x] Task: Implement Route Protection [Completed by User]
    - [x] Subtask: Create a utility or High-Order Component (HOC) to check auth state.
    - [x] Subtask: Apply protection to `/admin` layout or pages.
    - [x] Subtask: Implement logic to redirect unauthenticated users to `/admin/login`.
    - [x] Subtask: Implement logic to redirect already authenticated users from `/login` to `/admin`.

## Phase 4: Verification
- [x] Task: Manual Verification [Completed by User]
    - [x] Subtask: Test login with valid credentials.
    - [x] Subtask: Test login with invalid credentials (wrong password, non-existent user).
    - [x] Subtask: Verify redirection when accessing protected routes directly.
    - [x] Task: Conductor - User Manual Verification 'Verification' (Protocol in workflow.md)