# Roadmap

## Authentication

- [x] Login page implementation
- [x] Protected routes
- [x] Zustand state management
- [x] Supabase Auth integration
- [x] Role-based redirection after login (Data Manager / Admin)
- [ ] Remember me / persistent session handling

## Dashboard & Analytics (Data Manager Module)

- [x] Protected route
- [ ] Basic layout (sidebar, navbar, responsive design)
- [ ] Supabase integration for fetching KPIs and trends
- [ ] Data visualization components (charts, graphs)
  - [ ] Yield performance over time
  - [ ] Regional comparisons
  - [ ] Seasonal summaries
- [ ] Collection progress tracking by day/week/month
- [ ] User activity and submission monitoring

## Data Review Module

- [ ] View field data by Monitoring Field ID (MFID) and crop growth stage
- [ ] Mark entries as "Verified" or "Incomplete"
- [ ] Conduct quality checks:
  - [ ] Completeness validation
  - [ ] Outlier detection
  - [ ] Inconsistency flagging
- [ ] Sync status indicators for mobile-submitted data

## Farmer & Field Profile Management

- [ ] Import/export farmer lists (CSV/PDF)
- [ ] Update demographic and geographic info
- [ ] Search/filter farmers by region, gender, age group
- [ ] View associated fields per farmer
- [ ] Manage field records: location, size, crop stage

## MFID Generation & Assignment

- [ ] Generate barcoded MFIDs
- [ ] Assign MFIDs to link farmer-field records
- [ ] Track MFID usage history
- [ ] Export MFID list

## Reporting & Export Features

- [ ] Export compliance reports (PDF/CSV)
- [ ] Export damage assessments
- [ ] Export data summaries by season/geography
- [ ] Export analytics visuals as images or PDFs

## System Configuration

- [ ] Configure validation rules for form inputs
- [ ] Customize form templates
- [ ] Set up sync policies (manual/auto)
- [ ] Manage smart alerts for missing data/delays

## Admin Panel

### Access Control

- [x] Protected route
- [ ] Admin-specific features
- [ ] Admin dashboard overview

### User Management

- [ ] Add/edit/delete users (Data Collectors, Managers)
- [ ] Assign roles and permissions
- [ ] Track user activity and submission history
- [ ] Enable/disable accounts

### System Monitoring & Maintenance

- [ ] Audit logs (logins, updates, sync events)
- [ ] Manual/scheduled database backups
- [ ] System usage reports
- [ ] Performance metrics tracking

## Analytics Module

- [ ] Basic layout
- [ ] Protected route
- [ ] Yield Analysis
  - [ ] Overall yield
  - [ ] By season (dry/wet)
  - [ ] By geography (province, municipality, barangay)
  - [ ] By crop establishment method
  - [ ] By rice variety
- [ ] Damage Assessment
  - [ ] Overall and by cause
  - [ ] By season and geography
- [ ] Fertilizer Use
  - [ ] Frequency per hectare
  - [ ] Common types and brands
  - [ ] Average NPK inputs
- [ ] Farming Practices
  - [ ] Crop establishment methods
  - [ ] Plant spacing practices
  - [ ] Most planted rice varieties
- [ ] Farmer & Field Statistics
  - [ ] Total registered farmers
  - [ ] Distribution by location, age group, and gender
  - [ ] Total land under rice cultivation
  - [ ] Field and yield comparisons by region

## Technical Status

- [x] Project structure setup (modular & feature-based)
- [x] Routing system using TanStack Router
- [x] State management via Zustand
- [x] Authentication system (Supabase Auth + Zustand store)
- [ ] Form handling with React Hook Form + Zod validation
- [ ] Login flow with error/loading states
- [ ] Full dashboard functionality
- [ ] Complete admin features
- [ ] Data visualization (charts/graphs)
- [ ] Real-time sync from mobile app (via Supabase Realtime)
- [ ] Error boundaries and global error handling
- [ ] Unit/integration tests for core components
