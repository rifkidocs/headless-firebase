# Technology Stack - Headless Firebase CMS

## Core Frameworks
- **Next.js (App Router):** Modern React framework for both the admin interface and the content API.
- **React:** Component-based UI library.
- **TypeScript:** Typed JavaScript for improved developer experience and code reliability.

## Backend & Infrastructure
- **Firebase:** Comprehensive backend suite.
    - **Firestore:** NoSQL database for content storage and schema definitions.
    - **Authentication:** Secure user management and authentication.
    - **Storage:** Initial file storage (supplemented by Cloudinary).
    - **Admin SDK:** Server-side operations and administrative tasks.

## Media & Content
- **Cloudinary:** Primary service for media management, providing optimized image and video delivery.
- **Tiptap:** Headless rich text editor for content creation.

## UI & UX
- **Tailwind CSS:** Utility-first CSS framework for efficient styling.
- **Radix UI:** Unstyled, accessible primitives for complex UI components like dialogs and menus.
- **Framer Motion:** Library for smooth animations and transitions.
- **Lucide React:** Icon set for consistent visual language.
- **React Hot Toast:** Notification system for immediate user feedback.

## Data Management
- **React Hook Form:** Efficient form handling for schema building and content entry.
- **Zod:** Schema validation for both client-side and server-side data integrity.
- **Bcryptjs:** Secure password hashing (where applicable).
