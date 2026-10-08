# SmartHire Backend API

Enterprise recruitment platform backend built with **Spring Boot 3 (Java 21)**, **Spring Security (JWT)**, **MySQL**, and **AI RAG (Google Gemini + Pinecone Vector Store)**.

---

## Tech Stack

- **Java 21**
- **Spring Boot 3.4.1** (Web, Security, Data JPA, Validation)
- **Database**: MySQL 8.0
- **Vector DB**: Pinecone (for resume embeddings & semantic search)
- **AI Models**: Google Gemini 2.0 Flash & Google text-embedding-004
- **Containerization**: Docker & Docker Compose

---

## Getting Started

### Prerequisites

- Java 21 JDK
- Maven 3.9+ (or use `./mvnw`)
- MySQL 8.0 or Docker

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Key variables to configure:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: MySQL connection details
- `JWT_SECRET`: Secret key for JWT token generation
- `GEMINI_API_KEY`: Google AI Studio API key
- `PINECONE_API_KEY`, `PINECONE_HOST`: Pinecone vector database configuration
- `FRONTEND_URL`: URL of the frontend application (for CORS)

### 2. Run with Maven

```bash
./mvnw clean spring-boot:run
```

The server will start on port `8080`.

---

## Run with Docker

### Using Docker Compose (Recommended - includes MySQL)

```bash
docker compose up --build
```

### Using Dockerfile Directly

```bash
docker build -t smarthire-backend .
docker run -p 8080:8080 --env-file .env smarthire-backend
```

---

## API Documentation

- **Base URL**: `http://localhost:8080/api`
- **Auth Endpoints**:
  - `POST /api/auth/register` - Register a candidate or recruiter
  - `POST /api/auth/login` - Authenticate and receive JWT token
  - `POST /api/auth/forgot-password` - Request password reset link
  - `POST /api/auth/reset-password` - Reset password with token
- **Job Endpoints**:
  - `GET /api/jobs` - Browse active job listings
  - `POST /api/jobs` - Create job listing (Recruiter/Admin)
- **AI Endpoints**:
  - `POST /api/ai/chat` - Global RAG chatbot with resume & job knowledge
  - `POST /api/ai/analyze-resume` - AI Resume analysis & scoring
  - `POST /api/ai/match-job` - Job-resume match score and gaps
