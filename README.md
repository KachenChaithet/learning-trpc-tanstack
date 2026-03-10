# Task Management System

<p align="center">
  <img src="public/images/dashboard.jpg" width="900">
</p>

A full-stack task management application designed for managing projects, assigning tasks, and collaborating with team members.
The system supports task workflows, comments, filtering, and project-based collaboration.

---

# Features

## Task Management

* Create tasks inside projects
* Assign tasks to project members
* Update task status (TODO → DONE)
* Archive tasks to remove them from active lists
* Filter tasks by:

  * Today
  * This week
  * Overdue
  * Completed

## Collaboration

* Comment system for each task
* Project member management
* View tasks assigned to you or created by you

## Activity & Productivity

* Task priority levels (Low, Medium, High)
* Due date tracking
* Activity logs for task actions
* Task sorting by date

---

# Screenshots

## Dashboard

<p align="center">
  <img src="public/images/dashboard.png" width="850">
</p>

<!-- Add more screenshots if you have them -->

<!--
## Create Task
<p align="center">
  <img src="public/images/create-task.jpg" width="850">
</p>

## Task Detail
<p align="center">
  <img src="public/images/task-detail.jpg" width="850">
</p>

## Comments System
<p align="center">
  <img src="public/images/comments.jpg" width="850">
</p>
-->

---

# Tech Stack

## Frontend

* Next.js (App Router)
* React
* Tailwind CSS

## Backend

* tRPC
* Prisma ORM

## Database

* PostgreSQL

## Other Tools

* React Query (via tRPC)
* Zod for validation
* Sonner for notifications
* Socket.io (for realtime features)

---

# Architecture

The project uses a **full-stack TypeScript architecture with tRPC** to ensure type-safe communication between frontend and backend.

```
Frontend → tRPC API → Prisma ORM → PostgreSQL
```

---

# Key Concepts Implemented

* Type-safe APIs using **tRPC**
* Database schema design with **Prisma**
* Server-side filtering and querying
* Cache invalidation using **React Query**
* Custom React hooks for API calls
* Modular feature-based architecture

---

# Getting Started

## 1. Clone the repository

```
git clone https://github.com/yourusername/task-management-system.git
```

## 2. Install dependencies

```
npm install
```

## 3. Setup environment variables

Create a `.env` file in the root of the project and add the following variables.

```
DATABASE_URL=""

BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

# Environment Variables

| Variable             | Description                                          |
| -------------------- | ---------------------------------------------------- |
| DATABASE_URL         | PostgreSQL database connection string used by Prisma |
| BETTER_AUTH_SECRET   | Secret key used for authentication                   |
| BETTER_AUTH_URL      | Base URL of the authentication server                |
| GITHUB_CLIENT_ID     | GitHub OAuth client ID                               |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret                           |
| GOOGLE_CLIENT_ID     | Google OAuth client ID                               |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret                           |

---

# Example `.env`

```
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"

BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID="xxxx"
GITHUB_CLIENT_SECRET="xxxx"

GOOGLE_CLIENT_ID="xxxx"
GOOGLE_CLIENT_SECRET="xxxx"
```

---

## 4. Run database migrations

```
npx prisma migrate dev
```

## 5. Start the development server

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Future Improvements

* Realtime comments using WebSockets
* Role-based permissions (Admin / Member)
* Task editing and attachments
* Notifications system

---

# Author

**Kachen Chaithet**
