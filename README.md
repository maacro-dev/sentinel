# Humay – Web

**The web application component of Hum-i**: A web and mobile-based multi-stage data acquisition and analysis system for rice cultivation.

🛠️ _This is an internal tool intended for use by partner agricultural organizations and research institutions._

---

## Overview

Humay Web serves as a centralized platform for managing, analyzing, and visualizing rice cultivation data across various stages. It supports seamless integration with mobile clients, enabling real-time monitoring, comprehensive reporting, and informed decision-making for agricultural stakeholders.

### Key Features:

- **Secure Authentication**
  Role-based access control ensures only authorized users can perform actions aligned with their roles.

- **Dashboard & Analytics**
  Real-time KPI tracking, seasonal summaries, historical trends, and regional comparisons offer actionable insights.

- **Data Management**

  - View and verify field data by Monitoring Field ID (MFID) and crop growth stage
  - Conduct quality checks: completeness, outlier detection, inconsistency flagging
  - Generate barcoded MFIDs to link farmer and field records

- **Farmer & Field Profiles**
  Manage demographic and geographic information for farmers and fields.

- **Form Data Sync & Review**
  Monitor incoming field data submissions, review entries, and mark them as “Verified” or “Incomplete.”

- **Reporting & Exporting**

  - Generate compliance reports, damage assessments, and data summaries
  - Export in PDF/CSV formats for external use

- **System Configuration**
  Customize validation rules, form templates, sync policies, and configure smart alerts for data issues or delays.

- **User & Role Management**
  Create, update, disable, or delete user accounts; assign roles and permissions accordingly.

- **Yield Analysis & Farming Insights**
  Analyze yield performance by season, geography, rice variety, and crop establishment method.
  Track fertilizer usage, planting practices, and regional land use statistics.

- **System Monitoring & Maintenance**
  Audit logs, manual backups, and system usage reports ensure operational transparency and reliability.

---

## Getting Started

### Prerequisites

Ensure you have the following installed before proceeding:

- Node.js (v18 or higher)
- npm (v8 or higher)
- A modern browser (Chrome, Firefox, Safari)

---

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd humay
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following content:

   ```
   VITE_SUPABASE_KEY=your-anon-key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Access the app at:
   [http://localhost:5173](http://localhost:5173)

---

## Usage Guide

### Authentication

- Sign in using provided credentials
- Registration may be restricted based on deployment settings

### Data Collection

- View submitted forms from mobile clients
- Monitor real-time field data ingestion
- Import datasets from approved sources

### Data Analysis

- Generate custom reports filtered by season, region, crop stage, etc.
- Visualize trends such as yield performance, fertilizer usage, and farming practices
- Export graphs, charts, and summaries for offline analysis

### Profile Management

- Update or delete farmer profiles
- Manage associated field records and geographic data

### Reporting & Export

- Export compliance reports, damage assessments, and statistical summaries
- Choose from multiple formats: PDF, CSV

---

## System Administration

Administrators have elevated access to manage:

- **User Accounts**: Create, edit, or disable users and assign roles
- **System Logs**: Review audit trails for logins, updates, and synchronization events
- **Backups**: Perform manual or scheduled database backups
- **Notifications**: Set up alerts for missing data, incomplete forms, or sync failures

---

## Analytics Module

### Mobile App Integration

- Submit, view, update, and delete collected form data via the mobile client

### Web App Capabilities

- Manage and analyze data on:
  - Yield performance
  - Damage assessment
  - Fertilizer usage
  - Crop establishment methods
  - Farmer demographics
  - Field distribution and land use

---

## License

This project is **proprietary and confidential**, intended solely for authorized use by affiliated agricultural organizations.

All rights reserved © 2025 Humay.
