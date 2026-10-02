# SmartHire — Enterprise Full-Stack Recruitment SaaS Platform

SmartHire is a portfolio-grade recruitment platform built with a **Spring Boot 3.4** backend, **MySQL** database, **JJWT** security, and a **React (Vite + Tailwind CSS)** frontend.

The platform provides role-tailored dashboards and workflows for **Candidates**, **Recruiters**, and **System Admins**.

---

## Architecture Overview

```text
                  SMART HIRE ARCHITECTURE
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
Candidate               Recruiter                 Admin
Dashboard               Dashboard               Dashboard
     │                       │                       │
     └───────────────────────┼───────────────────────┘
                             │
                      REST API (Axios)
                             │
                   Spring Security Filter
                             │
                    JWT Validation & RBAC
                             │
                   Spring Boot Controllers
                             │
                  Services & Business Logic
                             │
                   Spring Data JPA Repositories
                             │
                       MySQL Database
```

---

## Technology Stack

### Backend
* **Language/SDK:** Java 21
* **Framework:** Spring Boot 3.4.1 (Spring Web, Spring Data JPA, Spring Security, Spring Mail, Bean Validation)
* **Security & Auth:** JJWT 0.12.6, BCrypt Password Encoder
* **Database:** MySQL Relational Database (`smarthire`)
* **Utilities & Tooling:** Lombok, Spring Boot DevTools, Maven (`mvnw.cmd`)

### Frontend
* **Core:** React, Vite, JavaScript
* **Styling & Icons:** Tailwind CSS, Lucide React
* **Charts & Analytics:** Recharts
* **Routing & HTTP:** React Router DOM, Axios

---

## Project Structure

```text
SmartHire/
│
├── smart-hire-backend/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smarthire/
│   │   │   │   ├── config/              # Security & App Configuration
│   │   │   │   ├── controller/          # REST Controllers
│   │   │   │   ├── dto/                 # Auth, Candidate, Recruiter, Admin DTOs
│   │   │   │   ├── entity/              # JPA Database Entities
│   │   │   │   ├── enums/               # Domain Enums (Role, ApplicationStatus, JobType...)
│   │   │   │   ├── exception/           # GlobalExceptionHandler & Custom Exceptions
│   │   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   │   ├── security/            # JwtService, JwtFilter, UserPrincipal
│   │   │   │   ├── service/             # Business Logic & Email/Notification Services
│   │   │   │   └── SmartHireBackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/java/com/smarthire/     # Unit & Integration Tests
│   └── mvnw.cmd
│
├── smart-hire-frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── api/                         # Centralized Axios Client & Interceptors
│   │   ├── components/                  # Navbar, Sidebar, Badges, Modals, Pagination
│   │   ├── context/                     # AuthContext & NotificationContext
│   │   ├── layouts/                     # Public, Candidate, Recruiter, Admin Layouts
│   │   ├── pages/                       # Auth, Candidate, Recruiter, Admin Portals
│   │   ├── services/                    # API Service Modules
│   │   ├── App.jsx
│   │   └── index.css
│   └── dist/
│
├── docs/
│   └── API.md                           # Comprehensive REST API Specification
└── README.md
```

---

## Application Roles & Permissions

1. **CANDIDATE (`ROLE_CANDIDATE`)**
   * Browse and search jobs with multi-criteria filters & server-side pagination.
   * Apply for jobs with cover letter & track status timeline (`APPLIED` → `SHORTLISTED` → `INTERVIEW` → `HIRED`).
   * Bookmark/Save jobs for later.
   * Manage profile (skills, experience, education, bio, resume URL).
   * View upcoming interviews with Google Meet links.
   * Receive in-app notifications and email updates.

2. **RECRUITER (`ROLE_RECRUITER`)**
   * Post, update, and deactivate job listings (strictly enforced data ownership).
   * Review applicants per job, inspect candidate profiles & resumes.
   * Advance candidate status with audit log history notes.
   * Schedule technical interview rounds with meeting links & notes.
   * Customize company profile & branding.
   * View recruitment dashboard analytics (applicant pipeline bar charts).

3. **ADMIN (`ROLE_ADMIN`)**
   * Platform-wide user management (Search, filter by role, activate/deactivate, delete).
   * Job moderation console (Approve, reject, or deactivate listings).
   * System-wide analytical reports (user demographics, application funnel, hiring trends).

---

## Pre-seeded Development Accounts

On initial backend startup, if the database is empty, the startup `DataInitializer` populates pre-seeded accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smarthire.com` | `Admin@123` |
| **Recruiter (TechCorp)** | `rachel.recruiter@smarthire.com` | `Recruiter@123` |
| **Recruiter (InnovateLabs)** | `marcus.recruiter@smarthire.com` | `Recruiter@123` |
| **Candidate (Alex)** | `alex.candidate@smarthire.com` | `Candidate@123` |
| **Candidate (Sarah)** | `sarah.candidate@smarthire.com` | `Candidate@123` |

*(Note: The login page includes quick 1-click test fill buttons for these demo credentials)*

---

## Environment Variables

### Backend (`smart-hire-backend`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://localhost:3306/smarthire?createDatabaseIfNotExist=true&useSSL=false` | MySQL Connection URL |
| `DB_USERNAME` | `root` | MySQL Database Username |
| `DB_PASSWORD` | `root` | MySQL Database Password |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit Secret Key for signing JWTs |
| `JWT_EXPIRATION` | `86400000` (24 Hours) | JWT Expiration in milliseconds |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP Mail Server Host |
| `MAIL_PORT` | `587` | SMTP Mail Server Port |
| `MAIL_USERNAME` | `dev@smarthire.com` | SMTP Username |
| `MAIL_PASSWORD` | `devpassword` | SMTP Password |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend Origin for CORS policy |

### Frontend (`smart-hire-frontend`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Base URL for API requests |

---

## Running the Application Locally

### Prerequisites
* **Java 21** JDK installed
* **Node.js** (v18+) & **npm** installed
* **MySQL Server** running at `localhost:3306`

---

### Step 1: Start MySQL Database
Create database `smarthire` (or let Spring Boot automatically create it):
```sql
CREATE DATABASE IF NOT EXISTS smarthire;
```

---

### Step 2: Start Spring Boot Backend
Open a terminal in the `smart-hire-backend` directory:
```powershell
cd smart-hire-backend
.\mvnw.cmd spring-boot:run
```
The backend server starts on `http://localhost:8080`.

---

### Step 3: Run Backend Unit Tests
To run unit and integration tests:
```powershell
cd smart-hire-backend
.\mvnw.cmd test
```

---

### Step 4: Start React Frontend
Open another terminal in the `smart-hire-frontend` directory:
```powershell
cd smart-hire-frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Key Technical Workflows

### 1. JWT Authentication & RBAC Flow
1. User logs in at `POST /api/auth/login`.
2. Backend authenticates credentials using Spring Security `DaoAuthenticationProvider` and returns a signed JJWT containing `userId`, `email`, and `role`.
3. React stores the JWT in `localStorage` and `AuthContext`.
4. Axios request interceptor attaches header `Authorization: Bearer <JWT>`.
5. Spring Security `JwtAuthenticationFilter` validates token per request and sets `SecurityContextHolder`. Endpoint rules block unauthorized role access (e.g. Candidate calling `/api/admin/**` returns HTTP 403 Forbidden).

### 2. Candidate Application & Audit History Flow
1. Candidate applies for a job via `POST /api/candidate/jobs/{jobId}/apply`.
2. Backend checks for duplicate applications (`existsByCandidateProfileIdAndJobId`).
3. Application created with status `APPLIED` and an audit entry recorded in `ApplicationStatusHistory`.
4. Recruiter updates status to `SHORTLISTED`, `INTERVIEW`, or `HIRED`. Audit entry is logged, candidate receives email notification and in-app notification.

### 3. Interview Scheduling
1. Recruiter schedules interview via `POST /api/interviews` specifying application ID, date/time, meeting link, and notes.
2. Application status transitions to `INTERVIEW`.
3. HTML Email dispatched to candidate with date & meeting URL.

---

## Production Deployment Guidance
* Change `spring.jpa.hibernate.ddl-auto` to `validate` or `none` and introduce schema migration tools like **Flyway** or **Liquibase**.
* Inject strong, random 256-bit `JWT_SECRET` and database credentials via secure environment variables or secret managers (AWS Secrets Manager, HashiCorp Vault).
