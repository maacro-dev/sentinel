## Goal

### 1. **Authentication (Supabase)**

- [ ] Email/password login
- [ ] Store user session
- [ ] Logout

### 2. **Routing**

- [ ] Pages: `/login`, `/dashboard`
- [ ] Route protection (only logged-in users)
- [ ] Conditional dashboard UI based on role

### 3. **User Roles**

- [ ] `profiles` table with `role` field (`admin`, `manager`)
- [ ] Fetch/store role after login
- [ ] Show/hide UI or pages based on role

### 4. **Basic UI**

- [ ] Tailwind + shadcn/ui
- [ ] Basic layout: sidebar + header + main content
- [ ] Responsive design (mobile-friendly)

### 5. **Data Fetching + Display**

- [ ] Fetch data from Supabase (e.g., `submissions`, `metrics`)
- [ ] Display in:
  - Table view
  - Summary cards (e.g., total submissions, averages)
  - Basic charts (e.g., bar, line using Recharts)

### 6. **User Management (Admin only)**

- [ ] Admin can:

  - View users list
  - Add/edit/delete users
  - Assign roles

