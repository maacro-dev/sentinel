# Changelog

All notable changes to this project will be documented in this section. Follows the convention: **Added**, **Changed**, **Removed**, **Deprecated**, **Fixed**, and **Security**.

## [0.0.2a] – June 18, 2025

### Added

- **Shared layout for Manager and Admin dashboards**
  Introduced `HumayBaseLayout` (sidebar, header, content slots) to unify protected pages.
- **Dynamic sidebar generation**
  Sidebar items now auto-generated from `staticData.metadata` (TanStack Router) using shared `RouteMetadata`. Supports:
  - Role‑based visibility (`for`)
  - Grouping (`group`)
  - Ordering & visibility (`sidebarOptions`)
  - Title & icon via metadata
    Added `useSidebarData` hook to build per‑role sidebar groups.
- **Manager dashboard scaffolding**
  - Placeholder routes for key form sections (Cultural Management, Damage Assessment, Field Profile, Monitoring, Nutrient Management, Production, Rice/Non‑Rice Classification)
  - Working sidebar nav, breadcrumb integration, footer with user profile dropdown.
- **Role & access utilities**
  - `getRedirectPath`: maps roles → default dashboards
  - `roleHasAccess`: checks route permissions per role
- **Sidebar metadata & typing**
  - `groupOrderMap` for sidebar sort order (e.g. Core, Forms)
  - `mapRole` for user‑friendly role labels
  - Shared TypeScript types: `Role` (with wildcard `*`), `RouteGroup`, `RouteMetadata`, `SidebarRouteOptions`, `SidebarDataItem`, `SidebarDataGroup`

### Changed

- Refactored Manager dashboard routes into directory‑based layout
- Enhanced session & access control with stricter role type safety
- Updated `ProtectedRoute` to leverage `roleHasAccess` for centralized, cleaner logic

### Removed

- Unused placeholder components and redundant utilities

---

## [0.0.1] - June 17, 2025

### Added

- Integrated [TanStack Router](https://tanstack.com/router/latest) for routing.
- Integrated [Zustand](https://zustand-demo.pmnd.rs/) for state management.
- Integrated [TanStack Query](https://tanstack.com/query/latest) for data fetching and caching.
- Integrated [Supabase](https://supabase.com/dashboard/) for backend services.
- Added initial route definitions with placeholder pages.
- Developed `HumayForm` – a wrapper around `shadcn/ui` forms and `react-hook-form` to simplify form handling.
- Developed `HumayTextField` – a generic form input component with label, error message, and input type support.
- Implemented login flow with form validation using `zod` and `react-hook-form`.
- Created `LoginPage` with loading and error handling using `useSignIn` mutation.
- Added `LoginForm` component with reusable form fields (`HumayTextField`, `HumayForm`).
- Added `useSignIn` hook for authenticating users and mapping Supabase user data.
- Defined Zod schema (`loginFormSchema`) and `LoginFields` type for login validation.
- Created `useAuthStore` with Zustand for managing authenticated user state.
- Implemented `ProtectedRoute` component to guard routes based on user role.

### Changed

- Adopted a modular and feature-based project file structure.
- Moved core setup & config files into the `/app` directory.
- Refactored login logic to use a modular and composable hook (`useSignIn`).
- Centralized form handling logic using custom `HumayForm` components to promote consistency and reuse.
