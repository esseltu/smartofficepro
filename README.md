# SmartOffice-Pro (Local Demo)

This repository contains a comprehensive HR / office management demo app designed to automate and streamline office operations.

## Project Objectives

- **Automate document handling and workflow processes** – Streamline repetitive tasks and improve workflow efficiency.
- **Improve communication and task tracking** – Centralize team communication and provide clear task visibility.
- **Securely store and retrieve office data** – Maintain organized, accessible records of employees, attendance, leaves, and tasks.
- **Increase overall office efficiency and accountability** – Provide transparency and accountability across departments.

## System Overview

SmartOffice-Pro provides a central platform for office activities:
- Users can manage documents, tasks, and communication in one place.
- Supports multiple user roles including **Admin** (full management) and **Employee** (personal tasks and leave requests).
- Modern UI with glassmorphism design for a professional appearance.
- Real-time filtering and search across all modules.

---

## Core Features

### Workflow Automation
- Automatically route tasks and approvals through the system.
- Task assignment and status tracking to ensure accountability.
- Notification and reminder system for pending actions.
- Support for integration with external automation tools (e.g., Zapier).

### Document Management
- **Centralized digital storage** – All organizational documents in one secure location.
- **Version control** – Track document changes and maintain history.
- **Category indexing** – Organize documents by type (Reports, Policies, HR, Finance, Projects).
- **Access control** – Share documents with specific departments or company-wide.
- **Easy retrieval** – Search and filter documents by name, category, or uploader.

### Data Management & Storage
- **Secure data persistence** – Data stored in localStorage or optional backend database (data.json).
- **Structured data handling** – Manage employees, attendance, leaves, tasks, and documents.
- **Scalable architecture** – Ready to integrate with enterprise databases.
- **Data integrity** – Validation and error handling for all data operations.

### Communication & Collaboration
- **Centralized platform** – All team activities in one place.
- **Task assignment and tracking** – Facilitate team collaboration.
- **Document sharing** – Share information across teams and departments.
- **User information** – Employee contact details readily available.

### Scheduling & Task Management
- **Digital task board** – Create, assign, and monitor tasks.
- **Due date tracking** – Set deadlines and receive reminders.
- **Priority levels** – Categorize tasks by High, Medium, Low priority.
- **Status tracking** – Monitor task progress (To Do, In Progress, Completed).
- **Leave calendar** – Track employee leave requests and approvals.

### Analytics & Reporting
- **Dashboard overview** – Key metrics at a glance (total employees, present today, pending leaves, active tasks).
- **Department distribution** – Visualize organizational structure.
- **Task statistics** – Monitor task completion rates and team workload.
- **Attendance insights** – Track attendance patterns and trends.
- **Financial reports** – Generate budget and expense analysis reports.

### Financial Management
- **Budget tracking** – Monitor department and project budgets.
- **Expense management** – Record and categorize expenses (Salaries, Equipment, Travel, Training, Utilities).
- **Approval workflow** – Admin review and approval of submitted expenses.
- **Financial reporting** – Generate budget utilization and expense summaries.
- **Department allocation** – Distribute budgets across departments and cost centers.

---

## Automated Functions

### Information Processing
- **Automatic data gathering** – Collect employee, attendance, and task information.
- **Real-time filtering** – Search across all modules with instant results.
- **Data retrieval** – Quickly access relevant information from centralized storage.
- **Categorization** – Automatically organize documents and tasks.

### Calculations & Analysis
- **Attendance statistics** – Auto-calculate present/absent/late counts.
- **Leave tracking** – Monitor leave balances and utilization.
- **Task metrics** – Calculate completion rates and team productivity.
- **Department statistics** – Generate department-wise insights.
- **Budget calculations** – Auto-compute spent vs. remaining budget.

### Document Processing
- **Automatic organization** – Files categorized by type on upload.
- **Search indexing** – Full-text search across document names and descriptions.
- **Access logging** – Track who uploaded and when documents were shared.
- **Version control** – Maintain document change history and versions.

### Financial Management
- **Budget tracking** – Support for financial data management (Finance module).
- **Expense categorization** – Organize financial documents by type.
- **Report generation** – Create financial summaries and reports.
- **Approval tracking** – Monitor pending and approved expenses.

### Inventory & Resource Management
- **Task allocation** – Automatically assign tasks to team members.
- **Resource tracking** – Monitor team workload and availability.
- **Leave management** – Track resource availability based on leave requests.

---

## Supported Modules

The system currently supports the following modules:

1. **Employees** – Manage employee records and information.
2. **Attendance** – Track daily attendance with time-in/time-out.
3. **Leaves** – Request and approve leave with status tracking.
4. **Tasks** – Create, assign, and track task completion.
5. **Documents** – Centralized document storage with versioning support.
6. **Finance** – Budget and expense tracking with approval workflows.

---

## Architecture & Technology Stack

- UI: static HTML files + `styles.css` (modern glassmorphism theme).
- Client logic: `script.js` (localStorage-backed data layer, simple auth, UI helpers).
- Optional local API: `server.js` (Express server persisting to `data.json`).
- Entry point: `index.html` (login page).

## How data is stored
- By default the app uses `localStorage` keys:
  - `smartoffice_employees`, `smartoffice_attendance`, `smartoffice_leaves`, `smartoffice_tasks`, `smartoffice_documents`, `smartoffice_finances`
- `script.js` seeds mock data on first run.
- To use the optional API server, set `localStorage.smartoffice_api_base` to `http://localhost:3000`.

## Getting Started

### Quick Start (Browser Only)
1. Open `index.html` in a browser.
2. Login with demo credentials:
   - **Admin**: username `admin`, password `admin123`
   - **Employee**: use any employee ID (e.g., `CSC/22/01/0011`) and last 4 digits as password (e.g., `0011`)

### Run with Local API Server
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:3000`.

3. In browser console, enable the API:
   ```javascript
   localStorage.setItem('smartoffice_api_base', 'http://localhost:3000')
   ```

4. Refresh the page and use the app.

## Project Structure

```
SmartOffice-Pro/
├── index.html                    # Login page
├── dashboard.html                # Main dashboard
├── admin-*.html                  # Admin-specific pages (11 files)
├── employee-*.html               # Employee-specific pages
├── employees.html, attendance.html, leaves.html, tasks.html, documents.html, finance.html  # Shared pages
├── script.js                     # Core client logic (auth, data, UI helpers)
├── styles.css                    # Global styling (glassmorphism theme)
├── server.js                     # Optional Express API server with finance endpoints
├── package.json                  # Dependencies (express, cors)
└── README.md                     # This file
```

## API Endpoints (when using server.js)

### Health Check
- `GET /health` – Server health status

### Employees
- `GET /employees` – List all employees
- `POST /employees` – Create new employee
- `PUT /employees/:id` – Update employee
- `DELETE /employees/:id` – Delete employee

### Attendance
- `GET /attendance` – List attendance records
- `POST /attendance` – Create attendance record
- `PATCH /attendance/:id/status` – Update status

### Leaves
- `GET /leaves` – List leave requests
- `POST /leaves` – Create leave request
- `PATCH /leaves/:id/status` – Update approval status

### Tasks
- `GET /tasks` – List tasks
- `POST /tasks` – Create task
- `PUT /tasks/:id` – Update task
- `PATCH /tasks/:id/status` – Update task status
- `DELETE /tasks/:id` – Delete task

### Documents
- `GET /documents` – List documents
- `POST /documents` – Upload document
- `DELETE /documents/:id` – Delete document

### Finances
- `GET /finances` – List expenses
- `POST /finances` – Create expense
- `PUT /finances/:id` – Update expense (with version history)
- `DELETE /finances/:id` – Delete expense

## Notes

- This project is a **demo/prototype**. Replace client-side auth and localStorage persistence with secure backend for production.
- `package.json` lists dependencies; JSON format does not support comments. See this README for context.
- Data persists in localStorage by default; optionally use the Express server to persist to `data.json`.
- The Finance module supports version tracking of expense records to maintain audit trails.
