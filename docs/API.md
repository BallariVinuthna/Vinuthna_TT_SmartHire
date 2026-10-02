# SmartHire REST API Specification

This document details all REST endpoints provided by the SmartHire Spring Boot backend.

Base URL: `http://localhost:8080/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register Candidate
* **Endpoint:** `POST /api/auth/register/candidate`
* **Auth:** Public
* **Request Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "Password123",
  "phone": "+1 555-0101",
  "location": "San Francisco, CA",
  "title": "Full Stack Java Developer",
  "bio": "Experienced software developer",
  "education": "B.S. Computer Science",
  "experience": "4 years of software development",
  "experienceYears": 4,
  "skills": ["Java", "Spring Boot", "React"]
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 5,
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "role": "ROLE_CANDIDATE",
      "active": true
    },
    "profileId": 3
  },
  "status": 200
}
```

---

### 1.2 Register Recruiter
* **Endpoint:** `POST /api/auth/register/recruiter`
* **Auth:** Public
* **Request Body:**
```json
{
  "name": "Rachel Green",
  "email": "rachel@company.com",
  "password": "Password123",
  "phone": "+1 555-0199",
  "title": "Senior Technical Recruiter",
  "companyName": "TechCorp Solutions",
  "companyDescription": "Enterprise software solution provider",
  "companyWebsite": "https://techcorp.example.com"
}
```

---

### 1.3 Login
* **Endpoint:** `POST /api/auth/login`
* **Auth:** Public
* **Request Body:**
```json
{
  "email": "alex.candidate@smarthire.com",
  "password": "Candidate@123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": 4,
      "name": "Alex Johnson",
      "email": "alex.candidate@smarthire.com",
      "role": "ROLE_CANDIDATE"
    },
    "profileId": 1
  }
}
```

---

### 1.4 Get Current User Profile (`Me`)
* **Endpoint:** `GET /api/auth/me`
* **Auth:** Authenticated (Bearer JWT)

---

### 1.5 Forgot Password Request
* **Endpoint:** `POST /api/auth/forgot-password`
* **Auth:** Public
* **Request Body:** `{ "email": "user@example.com" }`

---

### 1.6 Reset Password
* **Endpoint:** `POST /api/auth/reset-password`
* **Auth:** Public
* **Request Body:** `{ "token": "uuid-reset-token", "newPassword": "NewPassword123" }`

---

## 2. Public Jobs Endpoints (`/api/jobs/public`)

### 2.1 Search Public Jobs
* **Endpoint:** `GET /api/jobs/public`
* **Auth:** Public
* **Query Parameters:**
  * `query` (optional string)
  * `location` (optional string)
  * `jobType` (optional enum: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`)
  * `workMode` (optional enum: `ON_SITE`, `HYBRID`, `REMOTE`)
  * `skill` (optional string)
  * `page` (default 0)
  * `size` (default 10)
  * `sortBy` (default `createdAt`)
  * `sortDir` (default `desc`)

---

### 2.2 Get Job Details
* **Endpoint:** `GET /api/jobs/public/{id}`
* **Auth:** Public

---

## 3. Candidate Endpoints (`/api/candidate`)

* **Auth:** Required `ROLE_CANDIDATE`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/candidate/profile` | `GET` | Get candidate profile & completion percentage |
| `/api/candidate/profile` | `PUT` | Update profile fields & skills |
| `/api/candidate/jobs/{id}/apply` | `POST` | Apply for job with cover letter |
| `/api/candidate/applications` | `GET` | Get pageable candidate applications |
| `/api/candidate/applications/{id}/withdraw` | `PATCH` | Withdraw job application |
| `/api/candidate/jobs/{id}/save` | `POST` | Bookmark/save job |
| `/api/candidate/jobs/{id}/save` | `DELETE` | Remove job bookmark |
| `/api/candidate/saved-jobs` | `GET` | List saved jobs |
| `/api/candidate/dashboard` | `GET` | Get candidate dashboard metrics |

---

## 4. Recruiter Endpoints (`/api/recruiter`)

* **Auth:** Required `ROLE_RECRUITER`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/recruiter/profile` | `GET` | Get recruiter profile & company details |
| `/api/recruiter/company` | `PUT` | Update company branding & details |
| `/api/recruiter/jobs` | `POST` | Post new job listing |
| `/api/recruiter/jobs` | `GET` | List recruiter's posted jobs |
| `/api/recruiter/jobs/{id}` | `PUT` | Update existing job listing |
| `/api/recruiter/jobs/{id}` | `DELETE` | Deactivate job listing |
| `/api/recruiter/jobs/{jobId}/applications` | `GET` | List applicants for job |
| `/api/recruiter/applications/{id}/status` | `PATCH` | Update application status (`SHORTLISTED`, `INTERVIEW`, `HIRED`, `REJECTED`) |
| `/api/recruiter/dashboard` | `GET` | Get recruiter dashboard stats & pipeline analytics |

---

## 5. Interview Endpoints (`/api/interviews`)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/interviews` | `POST` | `ROLE_RECRUITER` | Schedule interview for applicant |
| `/api/interviews/candidate` | `GET` | `ROLE_CANDIDATE` | List candidate's scheduled interviews |
| `/api/interviews/recruiter` | `GET` | `ROLE_RECRUITER` | List recruiter's scheduled interviews |

---

## 6. Admin Endpoints (`/api/admin`)

* **Auth:** Required `ROLE_ADMIN`

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/admin/dashboard` | `GET` | Get platform-wide metrics & analytical charts |
| `/api/admin/users` | `GET` | List all users (optional `role` filter) |
| `/api/admin/users/{id}/status` | `PATCH` | Toggle user active/inactive status |
| `/api/admin/users/{id}` | `DELETE` | Delete user account |
| `/api/admin/jobs` | `GET` | List all platform jobs (optional `status` filter) |
| `/api/admin/jobs/{id}/status` | `PATCH` | Moderate job status (`APPROVED`, `REJECTED`, `DEACTIVATED`) |

---

## 7. Notification Endpoints (`/api/notifications`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/notifications` | `GET` | List user notifications |
| `/api/notifications/unread-count` | `GET` | Get unread notifications counter |
| `/api/notifications/{id}/read` | `PATCH` | Mark single notification as read |
| `/api/notifications/read-all` | `PATCH` | Mark all notifications as read |

---

## 8. Common Error Payload Format

When an error occurs, the server returns a standardized JSON payload:

```json
{
  "success": false,
  "message": "Resource not found with ID: 99",
  "status": 404,
  "timestamp": "2026-09-15T14:00:00"
}
```
