# DevPulse

A collaborative backend API for software teams to report bugs, suggest features, and coordinate resolutions. Built with Express.js, TypeScript, and PostgreSQL.

**Live URL:** [https://devpulse-api.vercel.app](https://devpulse-api.vercel.app)

---

## Features

- User registration and authentication with JWT
- Role-based access control (Contributor and Maintainer)
- Create, read, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Secure password hashing with bcrypt
- Input validation on all endpoints
- Centralized error handling

---

## Tech Stack

| Technology    | Purpose                          |
| ------------- | -------------------------------- |
| Node.js       | Runtime environment              |
| TypeScript    | Type-safe development            |
| Express.js    | Web framework with modular routing |
| PostgreSQL    | Relational database              |
| pg            | Native PostgreSQL driver (raw SQL) |
| bcrypt        | Password hashing                 |
| jsonwebtoken  | JWT authentication               |
| dotenv        | Environment variable management  |
| cors          | Cross-origin resource sharing    |
| tsup          | TypeScript bundler for production |

---

## Getting Started

### Prerequisites

- Node.js (v24.x or higher)
- PostgreSQL database (NeonDB, Supabase, or local)

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the development server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

---

## API Endpoints

### Authentication

| Method | Endpoint            | Access | Description                        |
| ------ | ------------------- | ------ | ---------------------------------- |
| POST   | `/api/auth/signup`  | Public | Register a new user account        |
| POST   | `/api/auth/login`   | Public | Authenticate and receive JWT token |

### Issues

| Method | Endpoint            | Access                            | Description                        |
| ------ | ------------------- | --------------------------------- | ---------------------------------- |
| POST   | `/api/issues`       | Authenticated                     | Create a new issue                 |
| GET    | `/api/issues`       | Public                            | Get all issues (with filters)      |
| GET    | `/api/issues/:id`   | Public                            | Get a single issue by ID           |
| PATCH  | `/api/issues/:id`   | Authenticated (permission-based)  | Update an issue                    |
| DELETE | `/api/issues/:id`   | Maintainer only                   | Delete an issue                    |

### Query Parameters for GET /api/issues

| Param    | Values                             | Default  |
| -------- | ---------------------------------- | -------- |
| `sort`   | `newest`, `oldest`                 | `newest` |
| `type`   | `bug`, `feature_request`           | none     |
| `status` | `open`, `in_progress`, `resolved`  | none     |

### Request and Response Examples

**Register a User**

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

Response (201):

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

**Login**

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

Response (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

**Create an Issue**

```
POST /api/issues
Authorization: <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

Response (201):

```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 1,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

## Database Schema

### users

| Column     | Type                      | Constraints                               |
| ---------- | ------------------------- | ----------------------------------------- |
| id         | SERIAL                    | PRIMARY KEY                               |
| name       | VARCHAR(255)              | NOT NULL                                  |
| email      | VARCHAR(255)              | UNIQUE, NOT NULL                          |
| password   | VARCHAR(255)              | NOT NULL                                  |
| role       | VARCHAR(20)               | NOT NULL, DEFAULT 'contributor', CHECK IN ('contributor', 'maintainer') |
| created_at | TIMESTAMP WITH TIME ZONE  | DEFAULT NOW()                             |
| updated_at | TIMESTAMP WITH TIME ZONE  | DEFAULT NOW()                             |

### issues

| Column      | Type                      | Constraints                               |
| ----------- | ------------------------- | ----------------------------------------- |
| id          | SERIAL                    | PRIMARY KEY                               |
| title       | VARCHAR(150)              | NOT NULL                                  |
| description | TEXT                      | NOT NULL                                  |
| type        | VARCHAR(20)               | NOT NULL, CHECK IN ('bug', 'feature_request') |
| status      | VARCHAR(20)               | NOT NULL, DEFAULT 'open', CHECK IN ('open', 'in_progress', 'resolved') |
| reporter_id | INTEGER                   | NOT NULL                                  |
| created_at  | TIMESTAMP WITH TIME ZONE  | DEFAULT NOW()                             |
| updated_at  | TIMESTAMP WITH TIME ZONE  | DEFAULT NOW()                             |

---

## User Roles

| Role          | Permissions                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| Contributor   | Register, login, create issues, view issues, update own issues (if open)    |
| Maintainer    | All contributor permissions, update any issue, delete any issue             |

---

## Project Structure

```
src/
├── config/
│   ├── db.ts            # Database pool and query helper
│   ├── env.ts           # Environment variable loader
│   └── initDb.ts        # Table creation on startup
├── middleware/
│   ├── auth.middleware.ts   # JWT authentication and role authorization
│   └── error.middleware.ts  # Global error handler
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts  # Signup and login handlers
│   │   ├── auth.routes.ts      # Auth route definitions
│   │   └── auth.types.ts       # Auth interfaces
│   └── issues/
│       ├── issues.controller.ts  # Issue CRUD handlers
│       ├── issues.routes.ts      # Issue route definitions
│       └── issues.types.ts       # Issue interfaces
├── utils/
│   ├── response.ts      # Standardized response helpers
│   └── validate.ts      # Input validation functions
└── server.ts            # Application entry point
```

---

## Error Handling

All errors follow a consistent response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

| Status Code | Usage                                        |
| ----------- | -------------------------------------------- |
| 200         | Successful GET, PATCH, DELETE                |
| 201         | Successful POST (resource created)           |
| 400         | Validation errors, invalid input             |
| 401         | Missing or invalid JWT token                 |
| 403         | Insufficient permissions                     |
| 404         | Resource not found                           |
| 409         | Business logic conflict                      |
| 500         | Internal server error                        |
