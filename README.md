# Employee Scheduling Application

A comprehensive scheduling application for businesses to manage employee shifts and schedules.

## Overview

This application provides a complete solution for managing employee schedules, shifts, and time tracking. It includes features for:

- User management with role-based access control
- Organization management
- Shift scheduling and assignment
- Time tracking and reporting
- Schedule preferences and availability

## Project Structure

- `/backend`: NestJS API server that interfaces with Supabase
- `/frontend`: React/NextJS frontend application

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Note your Supabase URL and API keys (anon key and service role key)
3. Execute the SQL in `/backend/src/database/init-supabase.sql` in the Supabase SQL Editor to create the necessary tables

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the `/backend` directory
   - Add the following environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=development
```

4. Start the development server:

```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the `/frontend` directory
   - Add the following environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
```

## Using the API

The backend provides a RESTful API with endpoints for:

- Authentication (login, register, logout)
- Users (CRUD operations)
- Organizations (CRUD operations)
- Shifts (CRUD operations)
- Schedules (CRUD operations)

All API endpoints are available at `http://localhost:3000/api`.

## API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login an existing user
- `POST /auth/logout` - Logout the user

### User Endpoints

- `GET /users` - Get all users
- `GET /users/:id` - Get a user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

### Organization Endpoints

- `GET /organizations` - Get all organizations
- `GET /organizations/:id` - Get an organization by ID
- `POST /organizations` - Create a new organization
- `PUT /organizations/:id` - Update an organization
- `DELETE /organizations/:id` - Delete an organization
- `GET /organizations/:id/members` - Get all members of an organization

### Shift Endpoints

- `GET /shifts` - Get all shifts (with optional filters)
- `GET /shifts/:id` - Get a shift by ID
- `POST /shifts` - Create a new shift
- `PUT /shifts/:id` - Update a shift
- `DELETE /shifts/:id` - Delete a shift
- `PUT /shifts/:id/assign` - Assign a user to a shift
- `PUT /shifts/:id/unassign` - Unassign a user from a shift

### Schedule Endpoints

- `GET /schedules` - Get all schedules (with optional filters)
- `GET /schedules/:id` - Get a schedule by ID
- `POST /schedules` - Create a new schedule
- `PUT /schedules/:id` - Update a schedule
- `DELETE /schedules/:id` - Delete a schedule
- `GET /schedules/:id/shifts` - Get all shifts in a schedule
- `POST /schedules/:id/preferences` - Save schedule preferences
- `GET /schedules/:id/preferences` - Get schedule preferences

## Security Notes

- Never commit your `.env` files to version control
- Always use environment variables for sensitive information
- Review Supabase Row Level Security (RLS) policies for your tables

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
