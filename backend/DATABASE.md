# Database Setup and Troubleshooting

This document provides guidance on setting up and troubleshooting the PostgreSQL database for the AYAS application.

## Common Issues

### "relation 'CarerWeeklySchedule' does not exist" or "relation 'carers' does not exist"

If you encounter errors indicating that certain tables do not exist, follow these troubleshooting steps:

## Solution 1: Check Database Connection

First, check that your database connection is working properly:

```bash
npm run db:check
```

This will:
1. Test the connection to your database
2. List all existing tables
3. Check for specific required tables

## Solution 2: Force Sync Database

If the required tables are missing, you can force create them:

```bash
npm run db:sync
```

**WARNING:** This will drop and recreate all tables, resulting in data loss. Only use in development or when setting up a new database.

## Solution 3: Manual Database Setup

If the automatic sync doesn't work, you can manually create the required tables:

```sql
-- Create userTypes table
CREATE TABLE IF NOT EXISTS public."userTypes" (
    "UserTypeID" INTEGER PRIMARY KEY,
    "UserTypeName" VARCHAR(50) NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS public."users" (
    "UserID" SERIAL PRIMARY KEY,
    "FirstName" VARCHAR(50) NOT NULL,
    "LastName" VARCHAR(50),
    "EmailID" VARCHAR(50) NOT NULL,
    "Password" VARCHAR(100) NOT NULL,
    "ResetPasswordCode" VARCHAR(10),
    "ResetPasswordCodeValidUpto" TIMESTAMP WITH TIME ZONE,
    "Active" BOOLEAN DEFAULT TRUE NOT NULL,
    "CreatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" INTEGER REFERENCES public."users"("UserID"),
    "UpdatedBy" INTEGER REFERENCES public."users"("UserID"),
    "UserType" SMALLINT DEFAULT 1 NOT NULL REFERENCES public."userTypes"("UserTypeID")
);

-- Create carers table
CREATE TABLE IF NOT EXISTS public."carers" (
    "CarerID" SERIAL PRIMARY KEY,
    "CarerName" VARCHAR(100) NOT NULL UNIQUE,
    "Descr" TEXT NOT NULL,
    "ProfilePic" BYTEA,
    "Color" VARCHAR(10) NOT NULL,
    "Active" BOOLEAN DEFAULT TRUE NOT NULL,
    "CreatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" INTEGER REFERENCES public."users"("UserID"),
    "UpdatedBy" INTEGER REFERENCES public."users"("UserID")
);

-- Create CarerWeeklySchedule table
CREATE TABLE IF NOT EXISTS public."CarerWeeklySchedule" (
    "CarerWeeklyScheduleID" SERIAL PRIMARY KEY,
    "CarerID" INTEGER NOT NULL REFERENCES public."carers"("CarerID") ON DELETE CASCADE,
    "Weekday" SMALLINT NOT NULL CHECK ("Weekday" >= 0 AND "Weekday" <= 6),
    "StartTime" TIME WITHOUT TIME ZONE NOT NULL,
    "EndTime" TIME WITHOUT TIME ZONE NOT NULL,
    "CreatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedOn" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Database Model Relationships

### User and UserType
- `users` table has a foreign key to `userTypes` (UserType field)

### Carer and User
- `carers` table has foreign keys to `users` (CreatedBy and UpdatedBy fields)

### CarerWeeklySchedule and Carer
- `CarerWeeklySchedule` table has a foreign key to `carers` (CarerID field)
- When a carer is deleted, all their weekly schedules are also deleted (CASCADE)

## Environment Configuration

Make sure your `.env` file has the correct database connection details:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=ayas_calendar_dev
DB_PORT=5432
``` 