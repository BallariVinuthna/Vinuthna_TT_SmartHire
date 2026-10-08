# SmartHire Frontend Application

Interactive modern UI for the **SmartHire AI** recruitment platform, built with **React 19**, **Vite**, **Tailwind CSS v4**, **Lucide React Icons**, and **Axios**.

---

## Features

- **Candidate Portal**: Browse jobs, apply with resumes, track application status, view interview invites, and access AI resume review & job match feedback.
- **Recruiter Portal**: Post jobs, review applicants, evaluate AI match scores, schedule interviews, and use the Recruiter AI Assistant.
- **Admin Portal**: User and job governance, analytics, and platform oversight.
- **Global AI Assistant**: Floating AI chatbot with speech-to-text (voice mic) capabilities, powered by RAG on backend documentation.

---

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs the application locally at `http://localhost:5173`.
By default, the Vite dev proxy forwards `/api` requests to `http://localhost:8080`.

### Production Build

```bash
npm run build
```

The production output is built in the `dist` folder.

---

## Environment Variables

Configure `.env` (refer to `.env.example`):

```env
VITE_API_BASE_URL=/api
```

When deploying separately from the backend (e.g., frontend on Vercel and backend on Render), set `VITE_API_BASE_URL` to your backend's API URL (e.g., `https://your-backend.onrender.com/api`).
