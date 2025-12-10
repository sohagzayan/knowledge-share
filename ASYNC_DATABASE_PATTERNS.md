# Async Database Patterns & Best Practices

This document outlines the async database patterns, optimizations, and best practices used in this codebase.

## Overview

The application uses **Prisma** as the ORM with **PostgreSQL** as the database. All database operations are asynchronous and follow specific patterns for reliability, performance, and error handling.

## Key Components

### 1. Database Connection (`lib/db.ts`)

The database connection is managed through a singleton Prisma client with:
- **Connection pooling optimization** for Neon databases
- **Retry wrapper** (`withRetry`) for handling transient failures
- **Connection health checks** for monitoring
- **Graceful shutdown** handling

#### Features:
- Automatic connection string optimization for Neon pooler
- Exponential backoff retry logic
- Connection timeout handling
- Process cleanup on termination

### 2. Retry Logic (`withRetry`)

```typescript
await withRetry(async () => {
  return await prisma.user.findMany({...});
}, 3, 1000); // 3 retries, 1s initial delay
```

**When to use:**
- Complex queries with multiple nested relations
- Queries that might timeout under load
- Critical operations that must succeed
- Operations prone to connection pool exhaustion

**Retryable errors:**
- Connection pool timeouts
- Database server unreachable
- Prisma error codes: P1001, P1008
- Network timeouts (ECONNREFUSED, ETIMEDOUT)

### 3. Query Patterns

#### Simple Queries
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, email: true }
});
```

#### Complex Nested Queries
```typescript
const teachers = await prisma.user.findMany({
  where: { courses: { some: {} } },
  select: {
    id: true,
    courses: {
      select: {
        id: true,
        chapter: {
          select: {
            id: true, // ⚠️ Always select at least one field from parent model
            lessons: { select: { id: true } }
          }
        }
      }
    }
  }
});
```

**⚠️ Important:** When using `select` on relations, you MUST select at least one field from the parent model. This was the bug fixed in `app/api/superadmin/teachers/performance/route.ts`.

#### Batch Operations
```typescript
// Use findMany with where.in for batch lookups
const lessons = await prisma.lesson.findMany({
  where: {
    id: { in: lessonIds }
  }
});
```

### 4. Error Handling Patterns

#### API Routes
```typescript
export async function GET() {
  try {
    const data = await withRetry(async () => {
      return await prisma.model.findMany({...});
    }, 3, 1000);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Operation failed:", error);
    
    // Handle specific error types
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    );
  }
}
```

#### Server Actions
```typescript
"use server";

export async function action() {
  try {
    const result = await prisma.model.create({...});
    return { status: "success", data: result };
  } catch (error) {
    console.error("Action failed:", error);
    return { status: "error", message: "Failed to perform action" };
  }
}
```

### 5. Performance Optimizations

#### Selective Field Selection
Always use `select` instead of fetching entire models:
```typescript
// ✅ Good - only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, firstName: true }
});

// ❌ Bad - fetches all fields
const user = await prisma.user.findUnique({ where: { id } });
```

#### Parallel Queries
When queries are independent, run them in parallel:
```typescript
const [user, course, enrollment] = await Promise.all([
  prisma.user.findUnique({ where: { id: userId } }),
  prisma.course.findUnique({ where: { id: courseId } }),
  prisma.enrollment.findUnique({ where: { userId_courseId: {...} } })
]);
```

#### Query Batching
Instead of N+1 queries, batch related data:
```typescript
// ❌ Bad - N+1 queries
for (const course of courses) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id }
  });
}

// ✅ Good - Single query
const allEnrollments = await prisma.enrollment.findMany({
  where: { courseId: { in: courses.map(c => c.id) } }
});
```

### 6. Complex Query Examples

#### Teacher Performance Query
Located in: `app/api/superadmin/teachers/performance/route.ts`

This query demonstrates:
- Deeply nested relations (User → Courses → Chapters → Lessons → Progress)
- Aggregation in application code
- Retry logic for reliability
- Proper error handling

#### Course Sidebar Data
Located in: `app/data/course/get-course-sidebar-data.ts`

This query demonstrates:
- Multiple parallel queries
- Complex business logic in application layer
- Efficient data transformation

### 7. Common Pitfalls & Solutions

#### ❌ Missing Parent Field in Select
```typescript
chapter: {
  select: {
    lessons: { select: { id: true } } // ❌ Missing chapter field
  }
}
```

#### ✅ Correct
```typescript
chapter: {
  select: {
    id: true, // ✅ Required parent field
    lessons: { select: { id: true } }
  }
}
```

#### ❌ No Retry Logic for Complex Queries
```typescript
const data = await prisma.user.findMany({
  // Complex nested query
}); // ❌ May fail on transient errors
```

#### ✅ With Retry
```typescript
const data = await withRetry(async () => {
  return await prisma.user.findMany({
    // Complex nested query
  });
}, 3, 1000); // ✅ Handles transient failures
```

#### ❌ Fetching Unnecessary Data
```typescript
const user = await prisma.user.findUnique({
  where: { id }
}); // ❌ Fetches all fields
```

#### ✅ Selective Fetching
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true } // ✅ Only needed fields
});
```

### 8. Monitoring & Debugging

#### Connection Health Check
```typescript
import { checkDatabaseConnection } from "@/lib/db";

const health = await checkDatabaseConnection();
console.log(health); // { connected: true, latency: 45 }
```

#### Query Logging
Prisma automatically logs queries in development mode (configured in `lib/db.ts`):
- Development: `["error", "warn", "query"]`
- Production: `["error"]`

### 9. Best Practices Summary

1. **Always use `select`** to fetch only needed fields
2. **Use `withRetry`** for complex or critical queries
3. **Handle errors gracefully** with appropriate HTTP status codes
4. **Batch queries** when possible to avoid N+1 problems
5. **Use parallel queries** for independent operations
6. **Select at least one field** from parent models in nested selects
7. **Monitor connection health** in production
8. **Log errors** with context for debugging
9. **Use connection pooling** (automatically configured for Neon)
10. **Test error scenarios** including connection failures

### 10. Database Schema Relationships

Key relationships to understand:
- `User` → `Course[]` (one-to-many: user creates courses)
- `Course` → `Chapter[]` → `Lesson[]` (hierarchical)
- `User` → `Enrollment[]` → `Course` (many-to-many through Enrollment)
- `Lesson` → `LessonProgress[]` (tracks user completion)
- `Lesson` → `Assignment` → `AssignmentSubmission[]`
- `Lesson` → `Quiz` → `QuizSubmission[]`

Understanding these relationships helps write efficient queries.

## Recent Fixes

### Fixed: Invalid Prisma Query in Teacher Performance Route
**File:** `app/api/superadmin/teachers/performance/route.ts`

**Issue:** The `chapter` select was missing a required field from the Chapter model.

**Fix:** Added `id: true` to the chapter select statement.

**Before:**
```typescript
chapter: {
  select: {
    lessons: { select: {...} } // ❌ Missing chapter field
  }
}
```

**After:**
```typescript
chapter: {
  select: {
    id: true, // ✅ Added required field
    lessons: { select: {...} }
  }
}
```

**Also Added:**
- Retry logic with `withRetry` wrapper
- Better error handling and logging

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Prisma Error Codes](https://www.prisma.io/docs/reference/api-reference/error-reference)
