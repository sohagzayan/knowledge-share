# Database Design Documentation
## Edupeak LMS - Deep Dive

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Technology](#database-technology)
3. [Architecture Overview](#architecture-overview)
4. [Core Entities & Relationships](#core-entities--relationships)
5. [Detailed Schema Documentation](#detailed-schema-documentation)
6. [Enums & Constants](#enums--constants)
7. [Indexes & Performance](#indexes--performance)
8. [Data Integrity & Constraints](#data-integrity--constraints)
9. [Business Logic & Workflows](#business-logic--workflows)
10. [Security Considerations](#security-considerations)

---

## Overview

**Edupeak** is a comprehensive Learning Management System (LMS) built with **PostgreSQL** and managed through **Prisma ORM**. The database supports:

- **Multi-tenant workspace architecture**
- **Course management & enrollment system**
- **User authentication & authorization**
- **Payment processing integration (Stripe)**
- **Blog & content management**
- **Analytics & tracking**
- **Support & help desk features**

### Key Statistics
- **Total Models**: 40+ database tables
- **Database Provider**: PostgreSQL
- **ORM**: Prisma
- **Primary Use Case**: Educational platform with social features

---

## Database Technology

### Technology Stack
- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **Connection**: Neon (with connection pooling support)
- **Migration System**: Prisma Migrate

### Configuration
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}
```

---

## Architecture Overview

### Core Modules

1. **User Management Module**
   - User accounts, authentication, sessions
   - Roles & permissions
   - User profiles & social links

2. **Course Management Module**
   - Courses, chapters, lessons
   - Content hierarchy
   - Publishing workflow

3. **Learning Module**
   - Enrollments
   - Progress tracking
   - Assignments & quizzes
   - Certificates

4. **Social & Community Module**
   - Blogs
   - Comments & reactions
   - Notifications

5. **Administration Module**
   - Workspaces & memberships
   - Announcements
   - Teacher applications
   - Support calls

6. **Analytics & Tracking Module**
   - Search analytics
   - Watch analytics
   - Activity logs
   - Login history

7. **Payment & Billing Module**
   - Payment transactions
   - Billing addresses
   - Stripe integration

---

## Core Entities & Relationships

### Entity Relationship Diagram (Conceptual)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├───┐
       │   │
       ▼   ▼
┌─────────────┐    ┌──────────────┐
│  Enrollment │───▶│    Course     │
└─────────────┘    └───────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Chapter    │
                    └───────┬──────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Lesson    │
                     └───────┬──────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
            ┌──────────────┐   ┌──────────────┐
            │  Assignment  │   │     Quiz      │
            └──────────────┘   └──────────────┘
```

### Primary Relationships

1. **User → Course** (One-to-Many)
   - A user can create multiple courses
   - Cascade delete: Deleting a user deletes their courses

2. **Course → Chapter** (One-to-Many)
   - A course contains multiple chapters
   - Cascade delete: Deleting a course deletes all chapters

3. **Chapter → Lesson** (One-to-Many)
   - A chapter contains multiple lessons
   - Cascade delete: Deleting a chapter deletes all lessons

4. **User → Enrollment** (One-to-Many)
   - A user can enroll in multiple courses
   - Unique constraint: One enrollment per user per course

5. **Lesson → Assignment/Quiz** (One-to-One)
   - Each lesson can have one assignment OR one quiz
   - Optional relationship

---

## Detailed Schema Documentation

### 1. User Management Tables

#### `user` Table
**Purpose**: Core user account information

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key | Unique user identifier |
| `firstName` | String | Required | User's first name |
| `lastName` | String | Optional | User's last name |
| `email` | String | Unique, Required | User's email address |
| `username` | String | Unique, Optional | Username for login |
| `phoneNumber` | String | Optional | Contact phone number |
| `designation` | String | Optional | Job title/role |
| `bio` | String | Optional | User biography |
| `socialWebsite` | String | Optional | Personal website URL |
| `socialGithub` | String | Optional | GitHub profile URL |
| `socialFacebook` | String | Optional | Facebook profile URL |
| `socialTwitter` | String | Optional | Twitter/X profile URL |
| `socialLinkedin` | String | Optional | LinkedIn profile URL |
| `emailVerified` | Boolean | Required | Email verification status |
| `image` | String | Optional | Profile image URL/key |
| `createdAt` | DateTime | Required | Account creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |
| `stripeCustomerId` | String | Unique, Optional | Stripe customer ID |
| `role` | String | Optional | User role (admin, teacher, student) |
| `banned` | Boolean | Optional | Account ban status |
| `banReason` | String | Optional | Reason for ban |
| `banExpires` | DateTime | Optional | Ban expiration date |
| `points` | Int | Default: 0 | User points/rewards |

**Relationships**:
- One-to-One: `BillingAddress`
- One-to-Many: `Course`, `Enrollment`, `Blog`, `Notification`, `Membership`, etc.

**Business Rules**:
- Email must be unique across all users
- Username is optional but must be unique if provided
- Points start at 0 and can be earned/spent

---

#### `billing_address` Table
**Purpose**: Store billing information for payments

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique identifier |
| `firstName` | String | Required | Billing first name |
| `lastName` | String | Required | Billing last name |
| `companyName` | String | Optional | Company name |
| `phoneNumber` | String | Optional | Contact phone |
| `email` | String | Required | Billing email |
| `addressLine1` | String | Required | Primary address |
| `addressLine2` | String | Optional | Secondary address |
| `city` | String | Required | City |
| `state` | String | Required | State/Province |
| `postalCode` | String | Required | ZIP/Postal code |
| `country` | String | Required | Country |
| `vatNumber` | String | Optional | VAT/Tax ID |
| `notes` | String | Optional | Additional notes |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `userId` | String | Unique, Foreign Key | References `user.id` |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Business Rules**:
- One billing address per user
- Deleted when user is deleted

---

#### `session` Table
**Purpose**: User authentication sessions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key | Session ID |
| `expiresAt` | DateTime | Required | Session expiration |
| `token` | String | Unique, Required | Session token |
| `createdAt` | DateTime | Required | Session creation |
| `updatedAt` | DateTime | Required | Last activity |
| `ipAddress` | String | Optional | Client IP address |
| `userAgent` | String | Optional | Browser/client info |
| `userId` | String | Foreign Key | References `user.id` |
| `impersonatedBy` | String | Optional | Admin impersonation ID |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Business Rules**:
- Sessions are automatically cleaned up when user is deleted
- Supports admin impersonation feature

---

#### `account` Table
**Purpose**: OAuth and authentication provider accounts

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key | Account ID |
| `accountId` | String | Required | Provider account ID |
| `providerId` | String | Required | Provider name (google, github, etc.) |
| `userId` | String | Foreign Key | References `user.id` |
| `accessToken` | String | Optional | OAuth access token |
| `refreshToken` | String | Optional | OAuth refresh token |
| `idToken` | String | Optional | ID token |
| `accessTokenExpiresAt` | DateTime | Optional | Token expiration |
| `refreshTokenExpiresAt` | DateTime | Optional | Refresh token expiration |
| `scope` | String | Optional | OAuth scopes |
| `password` | String | Optional | Hashed password (for email/password) |
| `createdAt` | DateTime | Required | Account creation |
| `updatedAt` | DateTime | Required | Last update |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Business Rules**:
- Supports multiple OAuth providers per user
- Password stored only for email/password authentication

---

#### `verification` Table
**Purpose**: Email verification and password reset tokens

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | String | Primary Key | Verification ID |
| `identifier` | String | Unique, Required | Email or identifier |
| `value` | String | Required | Verification token |
| `expiresAt` | DateTime | Required | Token expiration |
| `createdAt` | DateTime | Optional | Creation timestamp |
| `updatedAt` | DateTime | Optional | Last update |

**Business Rules**:
- Tokens expire after a set time
- One active token per identifier

---

### 2. Course Management Tables

#### `course` Table
**Purpose**: Course catalog and metadata

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique course ID |
| `title` | String | Required | Course title |
| `description` | String | Required | Full course description |
| `fileKey` | String | Required | S3 key for course thumbnail/image |
| `price` | Int | Required | Price in cents |
| `duration` | Int | Required | Course duration (minutes) |
| `level` | CourseLevel | Default: Beginner | Difficulty level |
| `stripePriceId` | String | Unique, Required | Stripe price ID |
| `category` | String | Required | Course category |
| `smallDescription` | String | Required | Short description |
| `slug` | String | Unique, Required | URL-friendly identifier |
| `status` | CourseStatus | Default: Draft | Publication status |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `userId` | String | Foreign Key | Course creator/teacher |

**Relationships**:
- Many-to-One: `User` (Cascade delete)
- One-to-Many: `Chapter`, `Enrollment`, `SupportCall`, `Blog`, `Announcement`, `CourseRating`

**Business Rules**:
- Slug must be unique for SEO
- Stripe price ID required for payment processing
- Status controls course visibility

---

#### `chapter` Table
**Purpose**: Course chapters/sections

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique chapter ID |
| `title` | String | Required | Chapter title |
| `position` | Int | Required | Order within course |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `courseId` | String | Foreign Key | References `course.id` |
| `releaseAt` | DateTime | Optional | Scheduled release date |
| `status` | ChapterStatus | Default: Draft | Publication status |

**Relationships**:
- Many-to-One: `Course` (Cascade delete)
- One-to-Many: `Lesson`, `EarlyUnlock`

**Business Rules**:
- Position determines display order
- Can be scheduled for future release
- Deleted when course is deleted

---

#### `lesson` Table
**Purpose**: Individual lessons within chapters

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique lesson ID |
| `title` | String | Required | Lesson title |
| `description` | String | Optional | Lesson description |
| `thumbnailKey` | String | Optional | S3 key for thumbnail |
| `videoKey` | String | Optional | S3 key for video |
| `position` | Int | Required | Order within chapter |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `chapterId` | String | Foreign Key | References `chapter.id` |
| `status` | LessonStatus | Default: Draft | Publication status |
| `releaseAt` | DateTime | Optional | Scheduled release date |

**Relationships**:
- Many-to-One: `Chapter` (Cascade delete)
- One-to-One: `Assignment`, `Quiz` (Optional)
- One-to-Many: `LessonProgress`, `EarlyUnlock`, `LessonWatchAnalytics`

**Business Rules**:
- Can have either an assignment OR a quiz, not both
- Position determines display order
- Supports scheduled publishing

---

### 3. Learning & Progress Tables

#### `enrollment` Table
**Purpose**: Student course enrollments

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique enrollment ID |
| `amount` | Int | Required | Enrollment price (cents) |
| `status` | EnrollmentStatus | Default: Pending | Enrollment status |
| `createdAt` | DateTime | Auto | Enrollment date |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `courseId` | String | Foreign Key | References `course.id` |
| `userId` | String | Foreign Key | References `user.id` |
| `banReason` | String | Optional | Reason for ban |
| `banType` | BanType | Optional | Temporary or permanent |
| `banUntil` | DateTime | Optional | Ban expiration |
| `banned` | Boolean | Optional | Ban status |
| `followUpEmailSent` | Boolean | Default: false | Marketing flag |
| `lastActivityAt` | DateTime | Optional | Last student activity |
| `certificateEarned` | Boolean | Default: false | Certificate status |
| `certificateIssuedAt` | DateTime | Optional | Certificate issue date |
| `certificateKey` | String | Unique, Optional | S3 key for certificate PDF |
| `certificateRevoked` | Boolean | Default: false | Revocation status |
| `certificateRevokedAt` | DateTime | Optional | Revocation date |
| `tags` | StudentTag[] | Array | Student classification tags |

**Relationships**:
- Many-to-One: `Course`, `User` (Cascade delete)
- One-to-Many: `LoginSession`, `StudentActivity`, `StudentBadge`, `PaymentTransaction`

**Constraints**:
- Unique constraint on `(userId, courseId)` - one enrollment per user per course

**Business Rules**:
- Students can be banned from specific courses
- Certificates can be issued and revoked
- Tracks student engagement through tags

---

#### `lesson_progress` Table
**Purpose**: Track lesson completion for students

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique progress ID |
| `completed` | Boolean | Default: false | Completion status |
| `createdAt` | DateTime | Auto | First access timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `userId` | String | Foreign Key | References `user.id` |
| `lessonId` | String | Foreign Key | References `lesson.id` |

**Relationships**:
- Many-to-One: `User`, `Lesson` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, lessonId)` - one progress record per user per lesson

**Business Rules**:
- Tracks individual lesson completion
- Used to calculate overall course progress

---

#### `early_unlock` Table
**Purpose**: Points-based early access to content

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique unlock ID |
| `unlockedAt` | DateTime | Auto | Unlock timestamp |
| `pointsSpent` | Int | Required | Points used for unlock |
| `userId` | String | Foreign Key | References `user.id` |
| `chapterId` | String | Optional, Foreign Key | References `chapter.id` |
| `lessonId` | String | Optional, Foreign Key | References `lesson.id` |

**Relationships**:
- Many-to-One: `User`, `Chapter?`, `Lesson?` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, chapterId, lessonId)`
- Either `chapterId` OR `lessonId` must be provided

**Business Rules**:
- Students can spend points to unlock content early
- Tracks points spent for analytics

---

### 4. Assessment Tables

#### `assignment` Table
**Purpose**: Course assignments

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique assignment ID |
| `title` | String | Required | Assignment title |
| `description` | String | Optional | Assignment description |
| `fileKey` | String | Optional | S3 key for assignment file |
| `points` | Int | Default: 100 | Maximum points |
| `dueDate` | DateTime | Optional | Due date |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `lessonId` | String | Unique, Foreign Key | References `lesson.id` |

**Relationships**:
- One-to-One: `Lesson` (Cascade delete)
- One-to-Many: `AssignmentSubmission`

**Business Rules**:
- One assignment per lesson
- Optional due date for time-sensitive assignments

---

#### `assignment_submission` Table
**Purpose**: Student assignment submissions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique submission ID |
| `fileKey` | String | Optional | S3 key for submission file |
| `status` | AssignmentSubmissionStatus | Default: Pending | Grading status |
| `grade` | Int | Optional | Points awarded |
| `feedback` | String | Optional | Teacher feedback |
| `submittedAt` | DateTime | Auto | Submission timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `assignmentId` | String | Foreign Key | References `assignment.id` |
| `userId` | String | Foreign Key | References `user.id` |
| `description` | String | Optional | Text submission |
| `link` | String | Optional | External link submission |
| `submissionCount` | Int | Default: 1 | Number of resubmissions |

**Relationships**:
- Many-to-One: `Assignment`, `User` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, assignmentId)` - one submission per user per assignment

**Business Rules**:
- Supports file, text, or link submissions
- Tracks resubmission count
- Status workflow: Pending → Graded → Returned

---

#### `quiz` Table
**Purpose**: Course quizzes

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique quiz ID |
| `title` | String | Optional | Quiz title |
| `points` | Int | Default: 10 | Total points |
| `required` | Boolean | Default: true | Mandatory completion |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `lessonId` | String | Unique, Foreign Key | References `lesson.id` |

**Relationships**:
- One-to-One: `Lesson` (Cascade delete)
- One-to-Many: `QuizQuestion`, `QuizSubmission`

**Business Rules**:
- One quiz per lesson
- Can be optional or required

---

#### `quiz_question` Table
**Purpose**: Quiz questions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique question ID |
| `question` | String | Required | Question text |
| `options` | String[] | Required | Array of answer options |
| `correctAnswer` | Int | Required | Index of correct answer (0-based) |
| `position` | Int | Required | Order within quiz |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `quizId` | String | Foreign Key | References `quiz.id` |

**Relationships**:
- Many-to-One: `Quiz` (Cascade delete)

**Constraints**:
- Unique constraint on `(quizId, position)` - ensures question order

**Business Rules**:
- Multiple choice questions only
- Correct answer stored as array index

---

#### `quiz_submission` Table
**Purpose**: Student quiz submissions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique submission ID |
| `score` | Int | Required | Percentage score |
| `totalQuestions` | Int | Required | Total questions |
| `correctAnswers` | Int | Required | Correct answers count |
| `pointsEarned` | Int | Required | Points awarded |
| `submittedAt` | DateTime | Auto | Submission timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `quizId` | String | Foreign Key | References `quiz.id` |
| `userId` | String | Foreign Key | References `user.id` |
| `answers` | JSON | Required | User's answers: `{questionId: selectedOptionIndex}` |

**Relationships**:
- Many-to-One: `Quiz`, `User` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, quizId)` - one submission per user per quiz

**Business Rules**:
- Answers stored as JSON object
- Score calculated automatically
- Points awarded based on performance

---

### 5. Student Engagement Tables

#### `student_activity` Table
**Purpose**: Track student engagement activities

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique activity ID |
| `type` | ActivityType | Required | Activity type enum |
| `description` | String | Optional | Activity description |
| `metadata` | JSON | Optional | Additional context data |
| `createdAt` | DateTime | Auto | Activity timestamp |
| `enrollmentId` | String | Foreign Key | References `enrollment.id` |

**Relationships**:
- Many-to-One: `Enrollment` (Cascade delete)

**Business Rules**:
- Tracks various student actions
- Metadata allows flexible data storage

---

#### `student_badge` Table
**Purpose**: Achievement badges for students

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique badge ID |
| `badgeType` | StudentBadgeType | Required | Badge type enum |
| `earnedAt` | DateTime | Auto | Badge earned timestamp |
| `metadata` | JSON | Optional | Additional badge data |
| `enrollmentId` | String | Foreign Key | References `enrollment.id` |

**Relationships**:
- Many-to-One: `Enrollment` (Cascade delete)

**Constraints**:
- Unique constraint on `(enrollmentId, badgeType)` - one badge per type per enrollment

**Business Rules**:
- Students earn badges for achievements
- Prevents duplicate badges

---

#### `login_session` Table
**Purpose**: Track student login sessions per enrollment

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique session ID |
| `device` | String | Optional | Device type |
| `browser` | String | Optional | Browser name |
| `country` | String | Optional | Login country |
| `ipAddress` | String | Optional | Client IP |
| `userAgent` | String | Optional | Browser user agent |
| `loggedInAt` | DateTime | Auto | Login timestamp |
| `enrollmentId` | String | Foreign Key | References `enrollment.id` |

**Relationships**:
- Many-to-One: `Enrollment` (Cascade delete)

**Business Rules**:
- Tracks detailed login information
- Used for security and analytics

---

### 6. Blog & Content Tables

#### `blog` Table
**Purpose**: User-generated blog posts

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique blog ID |
| `title` | String | Required | Blog title |
| `slug` | String | Unique, Required | URL-friendly identifier |
| `content` | String | Required | HTML content |
| `excerpt` | String | Optional | Short preview |
| `coverImageKey` | String | Optional | S3 key for cover image |
| `seoTitle` | String | Optional | SEO title |
| `seoDescription` | String | Optional | SEO description |
| `readingTime` | Int | Default: 0 | Estimated reading time (minutes) |
| `status` | BlogStatus | Default: Pending | Publication status |
| `isFeatured` | Boolean | Default: false | Featured flag |
| `isDraft` | Boolean | Default: false | Draft flag |
| `viewCount` | Int | Default: 0 | View counter |
| `likeCount` | Int | Default: 0 | Like counter |
| `commentCount` | Int | Default: 0 | Comment counter |
| `pointsRequired` | Int | Default: 5 | Points needed to post |
| `pointsSpent` | Int | Default: 0 | Points deducted |
| `pointsEarned` | Int | Default: 0 | Points earned from engagement |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `publishedAt` | DateTime | Optional | Publication timestamp |
| `rejectedAt` | DateTime | Optional | Rejection timestamp |
| `rejectionReason` | String | Optional | Rejection reason |
| `authorId` | String | Foreign Key | References `user.id` |
| `categoryId` | String | Optional, Foreign Key | References `blog_category.id` |
| `courseId` | String | Optional, Foreign Key | References `course.id` |

**Relationships**:
- Many-to-One: `User` (Cascade delete), `BlogCategory?`, `Course?`
- One-to-Many: `BlogTag`, `BlogComment`, `BlogReaction`

**Indexes**:
- `status`, `authorId`, `categoryId`, `isFeatured`, `createdAt`

**Business Rules**:
- Points-based posting system
- Moderation workflow: Pending → Approved/Rejected → Published
- Can be linked to a course

---

#### `blog_category` Table
**Purpose**: Blog post categories

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique category ID |
| `name` | String | Unique, Required | Category name |
| `slug` | String | Unique, Required | URL-friendly identifier |
| `description` | String | Optional | Category description |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- One-to-Many: `Blog`

**Business Rules**:
- Categories are reusable across blogs

---

#### `blog_tag` Table
**Purpose**: Blog post tags

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique tag ID |
| `name` | String | Required | Tag name |
| `slug` | String | Required | URL-friendly identifier |
| `blogId` | String | Foreign Key | References `blog.id` |
| `createdAt` | DateTime | Auto | Creation timestamp |

**Relationships**:
- Many-to-One: `Blog` (Cascade delete)

**Constraints**:
- Unique constraint on `(blogId, slug)` - one tag per slug per blog

**Indexes**:
- `slug` - for tag search

**Business Rules**:
- Multiple tags per blog
- Tags are blog-specific

---

#### `blog_comment` Table
**Purpose**: Blog post comments (threaded)

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique comment ID |
| `content` | String | Required | Comment text |
| `parentId` | String | Optional, Foreign Key | References `blog_comment.id` |
| `upvotes` | Int | Default: 0 | Upvote count |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `blogId` | String | Foreign Key | References `blog.id` |
| `authorId` | String | Foreign Key | References `user.id` |

**Relationships**:
- Many-to-One: `Blog`, `User` (Cascade delete)
- Self-referential: `BlogComment` (parent/replies)

**Indexes**:
- `blogId`, `authorId`, `parentId`

**Business Rules**:
- Supports threaded comments (replies)
- Upvote system for engagement

---

#### `blog_reaction` Table
**Purpose**: Blog post reactions (likes, etc.)

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique reaction ID |
| `type` | ReactionType | Required | Reaction type enum |
| `createdAt` | DateTime | Auto | Reaction timestamp |
| `blogId` | String | Foreign Key | References `blog.id` |
| `userId` | String | Foreign Key | References `user.id` |

**Relationships**:
- Many-to-One: `Blog`, `User` (Cascade delete)

**Constraints**:
- Unique constraint on `(blogId, userId)` - one reaction per user per blog

**Indexes**:
- `blogId`, `userId`

**Business Rules**:
- Multiple reaction types available
- One reaction per user per blog

---

### 7. Notification System

#### `notification` Table
**Purpose**: User notifications

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique notification ID |
| `type` | NotificationType | Required | Notification type enum |
| `title` | String | Required | Notification title |
| `message` | String | Required | Notification message |
| `link` | String | Optional | Related link URL |
| `read` | Boolean | Default: false | Read status |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `userId` | String | Foreign Key | References `user.id` |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Indexes**:
- `userId`, `read`

**Business Rules**:
- Tracks read/unread status
- Supports various notification types

---

### 8. Workspace & Multi-Tenancy Tables

#### `workspace` Table
**Purpose**: Multi-tenant workspaces

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique workspace ID |
| `name` | String | Default: "Default Workspace" | Workspace name |
| `slug` | String | Unique, Default: "default" | URL-friendly identifier |
| `description` | String | Optional | Workspace description |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- One-to-Many: `Membership`, `Invitation`

**Business Rules**:
- Supports multi-tenant architecture
- Default workspace for single-tenant setups

---

#### `membership` Table
**Purpose**: User workspace memberships

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique membership ID |
| `userId` | String | Foreign Key | References `user.id` |
| `workspaceId` | String | Foreign Key | References `workspace.id` |
| `role` | WorkspaceRole | Default: Member | User role in workspace |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `User`, `Workspace` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, workspaceId)` - one membership per user per workspace

**Indexes**:
- `userId`, `workspaceId`

**Business Rules**:
- Users can belong to multiple workspaces
- Role-based access control

---

#### `invitation` Table
**Purpose**: Workspace invitations

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique invitation ID |
| `token` | String | Unique, Required | Invitation token |
| `email` | String | Required | Invitee email |
| `userId` | String | Optional, Foreign Key | References `user.id` |
| `workspaceId` | String | Foreign Key | References `workspace.id` |
| `role` | WorkspaceRole | Required | Assigned role |
| `status` | InvitationStatus | Default: Pending | Invitation status |
| `invitedBy` | String | Required | Inviter user ID |
| `expiresAt` | DateTime | Required | Expiration timestamp |
| `acceptedAt` | DateTime | Optional | Acceptance timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `User?`, `Workspace` (Cascade delete)

**Indexes**:
- `token`, `email`, `userId`, `workspaceId`, `status`

**Business Rules**:
- Can invite existing or new users
- Token-based invitation system
- Expires after set time

---

### 9. Announcement System

#### `announcement` Table
**Purpose**: System announcements

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique announcement ID |
| `title` | String | Required | Announcement title |
| `body` | String | Required | HTML content |
| `createdById` | String | Foreign Key | References `user.id` |
| `targetRole` | AnnouncementTargetRole | Required | Target audience |
| `targetCourseId` | String | Optional, Foreign Key | References `course.id` |
| `targetUserIds` | String[] | Array | Specific user IDs |
| `scheduledAt` | DateTime | Optional | Scheduled publish time |
| `publishedAt` | DateTime | Optional | Actual publish time |
| `status` | AnnouncementStatus | Default: Draft | Publication status |
| `isUrgent` | Boolean | Default: false | Urgency flag |
| `attachmentKeys` | String[] | Array | S3 keys for attachments |
| `viewCount` | Int | Default: 0 | View counter |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `User` (creator), `Course?` (SetNull on delete)
- One-to-Many: `AnnouncementReadStatus`

**Indexes**:
- `createdById`, `targetCourseId`, `status`, `publishedAt`, `targetRole`

**Business Rules**:
- Supports targeted announcements
- Can be scheduled for future
- Tracks read status per user

---

#### `announcement_read_status` Table
**Purpose**: Track announcement read status

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique read status ID |
| `userId` | String | Foreign Key | References `user.id` |
| `announcementId` | String | Foreign Key | References `announcement.id` |
| `readAt` | DateTime | Auto | Read timestamp |

**Relationships**:
- Many-to-One: `User`, `Announcement` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, announcementId)` - one read status per user per announcement

**Indexes**:
- `userId`, `announcementId`

**Business Rules**:
- Tracks which users have read announcements

---

### 10. Support & Help Desk Tables

#### `support_call` Table
**Purpose**: Live support call sessions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique call ID |
| `courseId` | String | Foreign Key | References `course.id` |
| `createdBy` | String | Required | Admin/creator user ID |
| `streamCallId` | String | Unique, Optional | Stream.io call ID |
| `title` | String | Optional | Call title |
| `description` | String | Optional | Call description |
| `status` | SupportCallStatus | Default: Active | Call status |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |
| `endedAt` | DateTime | Optional | End timestamp |

**Relationships**:
- Many-to-One: `Course` (Cascade delete), `User` (creator)
- One-to-Many: `SupportCallRequest`

**Business Rules**:
- Integrates with Stream.io for video calls
- Supports queue system for requests

---

#### `support_call_request` Table
**Purpose**: Student support call requests

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique request ID |
| `supportCallId` | String | Foreign Key | References `support_call.id` |
| `userId` | String | Foreign Key | References `user.id` |
| `supportType` | String | Required | Type of support needed |
| `status` | SupportRequestStatus | Default: Pending | Request status |
| `position` | Int | Required | Queue position |
| `joinedAt` | DateTime | Optional | Join timestamp |
| `createdAt` | DateTime | Auto | Request timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `SupportCall`, `User` (Cascade delete)

**Constraints**:
- Unique constraint on `(supportCallId, userId)` - one request per user per call

**Business Rules**:
- Queue-based system
- Tracks position in queue

---

#### `help_request` Table
**Purpose**: General help/support tickets

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique request ID |
| `userId` | String | Foreign Key | References `user.id` |
| `subject` | String | Required | Request subject |
| `message` | String | Required | Request message |
| `userType` | HelpRequestUserType | Required | User type enum |
| `status` | HelpRequestStatus | Default: Pending | Request status |
| `response` | String | Optional | Admin response |
| `respondedAt` | DateTime | Optional | Response timestamp |
| `userReply` | String | Optional | User follow-up reply |
| `userRepliedAt` | DateTime | Optional | User reply timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Indexes**:
- `userId`, `status`, `createdAt`, `userType`

**Business Rules**:
- Supports multi-turn conversations
- Tracks user type for routing

---

### 11. Administration Tables

#### `teacher_application` Table
**Purpose**: Teacher application submissions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique application ID |
| `userId` | String | Foreign Key | References `user.id` |
| `status` | TeacherApplicationStatus | Default: Pending | Application status |
| `applicationData` | JSON | Required | Application form data |
| `rejectionReason` | String | Optional | Rejection reason |
| `reviewedBy` | String | Optional | Reviewer user ID |
| `reviewedAt` | DateTime | Optional | Review timestamp |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Constraints**:
- Unique constraint on `userId` - one application per user

**Indexes**:
- `status`, `createdAt`

**Business Rules**:
- Application data stored as flexible JSON
- Tracks review process

---

#### `activity_log` Table
**Purpose**: System activity logging

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique log ID |
| `userId` | String | Foreign Key | References `user.id` |
| `action` | String | Required | Action type (e.g., "lesson_uploaded") |
| `entityType` | String | Required | Entity type (e.g., "course") |
| `entityId` | String | Optional | Entity ID |
| `metadata` | JSON | Optional | Additional context |
| `ipAddress` | String | Optional | Client IP |
| `userAgent` | String | Optional | Browser info |
| `createdAt` | DateTime | Auto | Log timestamp |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Indexes**:
- `userId`, `action`, `createdAt`, `(entityType, entityId)`

**Business Rules**:
- Comprehensive audit trail
- Flexible metadata storage

---

### 12. Payment & Billing Tables

#### `payment_transaction` Table
**Purpose**: Payment transaction records

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique transaction ID |
| `enrollmentId` | String | Foreign Key | References `enrollment.id` |
| `amount` | Int | Required | Amount in cents |
| `currency` | String | Default: "usd" | Currency code |
| `stripePaymentId` | String | Unique, Optional | Stripe payment ID |
| `stripeSessionId` | String | Optional | Stripe session ID |
| `status` | PaymentTransactionStatus | Default: Pending | Transaction status |
| `paymentMethod` | String | Optional | Payment method |
| `refunded` | Boolean | Default: false | Refund status |
| `refundAmount` | Int | Optional | Refund amount |
| `refundReason` | String | Optional | Refund reason |
| `refundedAt` | DateTime | Optional | Refund timestamp |
| `metadata` | JSON | Optional | Additional data |
| `createdAt` | DateTime | Auto | Transaction timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `Enrollment` (Cascade delete)

**Indexes**:
- `enrollmentId`, `status`, `createdAt`, `stripePaymentId`

**Business Rules**:
- Integrates with Stripe
- Supports refunds
- Tracks payment lifecycle

---

### 13. Rating & Review Tables

#### `course_rating` Table
**Purpose**: Course ratings and reviews

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique rating ID |
| `courseId` | String | Foreign Key | References `course.id` |
| `userId` | String | Foreign Key | References `user.id` |
| `rating` | Int | Required | Rating (1-5) |
| `comment` | String | Optional | Review comment |
| `createdAt` | DateTime | Auto | Rating timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `Course`, `User` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, courseId)` - one rating per user per course

**Indexes**:
- `courseId`, `rating`, `createdAt`

**Business Rules**:
- 1-5 star rating system
- Optional text comments
- One rating per user per course

---

### 14. Analytics & Tracking Tables

#### `search_analytics` Table
**Purpose**: Search query analytics

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique analytics ID |
| `userId` | String | Optional, Foreign Key | References `user.id` |
| `query` | String | Required | Search query |
| `resultsCount` | Int | Default: 0 | Number of results |
| `clickedResult` | String | Optional | Clicked result ID |
| `ipAddress` | String | Optional | Client IP |
| `userAgent` | String | Optional | Browser info |
| `createdAt` | DateTime | Auto | Search timestamp |

**Relationships**:
- Many-to-One: `User?` (SetNull on delete)

**Indexes**:
- `query`, `createdAt`, `resultsCount`

**Business Rules**:
- Tracks anonymous and authenticated searches
- Measures search effectiveness

---

#### `login_history` Table
**Purpose**: Login attempt history

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique history ID |
| `userId` | String | Foreign Key | References `user.id` |
| `ipAddress` | String | Optional | Client IP |
| `userAgent` | String | Optional | Browser info |
| `country` | String | Optional | Login country |
| `city` | String | Optional | Login city |
| `success` | Boolean | Default: true | Login success |
| `failureReason` | String | Optional | Failure reason |
| `deviceInfo` | JSON | Optional | Device details |
| `createdAt` | DateTime | Auto | Login timestamp |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Indexes**:
- `userId`, `success`, `createdAt`, `ipAddress`

**Business Rules**:
- Tracks both successful and failed logins
- Security monitoring

---

#### `error_log` Table
**Purpose**: Application error logging

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique error ID |
| `userId` | String | Optional, Foreign Key | References `user.id` |
| `errorType` | String | Required | Error type |
| `statusCode` | Int | Optional | HTTP status code |
| `message` | String | Required | Error message |
| `stack` | String | Optional | Stack trace |
| `endpoint` | String | Optional | API endpoint |
| `method` | String | Optional | HTTP method |
| `metadata` | JSON | Optional | Additional context |
| `createdAt` | DateTime | Auto | Error timestamp |

**Relationships**:
- Many-to-One: `User?` (SetNull on delete)

**Indexes**:
- `errorType`, `statusCode`, `createdAt`

**Business Rules**:
- Comprehensive error tracking
- Links errors to users when applicable

---

#### `lesson_watch_analytics` Table
**Purpose**: Video lesson watch analytics

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique analytics ID |
| `lessonId` | String | Foreign Key | References `lesson.id` |
| `userId` | String | Foreign Key | References `user.id` |
| `watchDuration` | Int | Required | Seconds watched |
| `totalDuration` | Int | Required | Total lesson duration (seconds) |
| `completionRate` | Float | Required | Percentage completed |
| `lastWatchedAt` | DateTime | Auto | Last watch timestamp |
| `createdAt` | DateTime | Auto | First watch timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Relationships**:
- Many-to-One: `Lesson`, `User` (Cascade delete)

**Constraints**:
- Unique constraint on `(userId, lessonId)` - one analytics record per user per lesson

**Indexes**:
- `lessonId`, `userId`, `completionRate`

**Business Rules**:
- Tracks detailed watch behavior
- Calculates completion rates

---

#### `online_session` Table
**Purpose**: Active user sessions

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique session ID |
| `userId` | String | Foreign Key | References `user.id` |
| `sessionId` | String | Unique, Required | Session identifier |
| `ipAddress` | String | Optional | Client IP |
| `userAgent` | String | Optional | Browser info |
| `lastActivityAt` | DateTime | Auto | Last activity timestamp |
| `createdAt` | DateTime | Auto | Session creation |

**Relationships**:
- Many-to-One: `User` (Cascade delete)

**Indexes**:
- `userId`, `lastActivityAt`

**Business Rules**:
- Tracks currently active users
- Used for "who's online" features

---

### 15. System Configuration

#### `system_config` Table
**Purpose**: System-wide configuration

| Field | Type | Constraints | Description |
|-------|------|------------|-------------|
| `id` | UUID | Primary Key | Unique config ID |
| `key` | String | Unique, Required | Configuration key |
| `value` | JSON | Required | Configuration value |
| `description` | String | Optional | Config description |
| `updatedBy` | String | Optional | Last updater user ID |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update |

**Indexes**:
- `key`

**Business Rules**:
- Key-value configuration store
- Values stored as JSON for flexibility

---

## Enums & Constants

### Course Enums

#### `CourseLevel`
- `Beginner` - Entry-level courses
- `Intermediate` - Mid-level courses
- `Advanced` - Expert-level courses

#### `CourseStatus`
- `Draft` - Not published
- `Published` - Live and available
- `Archived` - Hidden but preserved

#### `ChapterStatus`
- `Draft` - Not published
- `Scheduled` - Scheduled for future release
- `Published` - Live and available

#### `LessonStatus`
- `Draft` - Not published
- `Scheduled` - Scheduled for future release
- `Published` - Live and available

---

### Enrollment Enums

#### `EnrollmentStatus`
- `Pending` - Payment pending
- `Active` - Enrollment active
- `Cancelled` - Enrollment cancelled

#### `BanType`
- `Temporary` - Time-limited ban
- `Permanent` - Permanent ban

#### `StudentTag`
- `TopPerformer` - High-achieving student
- `NeedsHelp` - Requires additional support
- `SlowLearner` - Learning at slower pace
- `ActiveCommunicator` - Engages frequently

#### `StudentBadgeType`
- `FirstLessonCompleted` - First lesson milestone
- `SevenDayStreak` - 7-day activity streak
- `HundredPercentProgress` - Course completion
- `DiscussionContributor` - Active in discussions
- `MonthlyTopPerformer` - Monthly achievement
- `WeeklyTopPerformer` - Weekly achievement

#### `ActivityType`
- `LoggedIn` - Login event
- `CompletedLesson` - Lesson completion
- `DownloadedFile` - File download
- `MissedAssignment` - Assignment missed
- `SubmittedAssignment` - Assignment submitted
- `ViewedLesson` - Lesson viewed
- `StartedCourse` - Course started

---

### Assessment Enums

#### `AssignmentSubmissionStatus`
- `Pending` - Awaiting grading
- `Graded` - Grading complete
- `Returned` - Returned to student

---

### Blog Enums

#### `BlogStatus`
- `Pending` - Awaiting approval
- `Approved` - Approved by moderator
- `Rejected` - Rejected by moderator
- `Published` - Live on platform

#### `ReactionType`
- `Like` - Like reaction
- `Love` - Love reaction
- `Insightful` - Insightful reaction
- `Funny` - Funny reaction

---

### Notification Enums

#### `NotificationType`
- `BlogApproved` - Blog post approved
- `BlogRejected` - Blog post rejected
- `CommentReceived` - New comment
- `ReactionReceived` - New reaction
- `PointsEarned` - Points awarded
- `AdminReply` - Admin response
- `SuperAdminInvitation` - Workspace invitation

---

### Workspace Enums

#### `WorkspaceRole`
- `Member` - Regular member
- `Admin` - Workspace administrator
- `SuperAdmin` - Super administrator

#### `InvitationStatus`
- `Pending` - Invitation sent
- `Accepted` - Invitation accepted
- `Expired` - Invitation expired
- `Revoked` - Invitation revoked

---

### Announcement Enums

#### `AnnouncementTargetRole`
- `AllStudents` - All enrolled students
- `AllTeachers` - All teachers
- `AllUsers` - All platform users
- `SpecificStudents` - Selected students
- `SpecificTeachers` - Selected teachers
- `CourseStudents` - Students in specific course

#### `AnnouncementStatus`
- `Draft` - Not published
- `Scheduled` - Scheduled for future
- `Published` - Live announcement
- `Expired` - Past expiration

---

### Support Enums

#### `SupportCallStatus`
- `Active` - Call in progress
- `Ended` - Call completed
- `Cancelled` - Call cancelled

#### `SupportRequestStatus`
- `Pending` - Awaiting response
- `Accepted` - Request accepted
- `Rejected` - Request rejected
- `Completed` - Request completed

#### `HelpRequestStatus`
- `Pending` - Awaiting response
- `InProgress` - Being handled
- `Resolved` - Issue resolved
- `Closed` - Request closed

#### `HelpRequestUserType`
- `Teacher` - Teacher request
- `Student` - Student request
- `Admin` - Admin request

---

### Payment Enums

#### `PaymentTransactionStatus`
- `Pending` - Payment processing
- `Completed` - Payment successful
- `Failed` - Payment failed
- `Refunded` - Payment refunded
- `Cancelled` - Payment cancelled

---

### Teacher Application Enums

#### `TeacherApplicationStatus`
- `Pending` - Awaiting review
- `Approved` - Application approved
- `Rejected` - Application rejected

---

## Indexes & Performance

### Primary Indexes

All tables have primary key indexes on `id` fields (UUID or String).

### Foreign Key Indexes

Foreign keys automatically create indexes in PostgreSQL, but explicit indexes are added for:
- `enrollment.userId`, `enrollment.courseId`
- `lesson_progress.userId`, `lesson_progress.lessonId`
- `blog.authorId`, `blog.categoryId`, `blog.status`
- `notification.userId`, `notification.read`
- `membership.userId`, `membership.workspaceId`
- `announcement.createdById`, `announcement.status`
- `payment_transaction.enrollmentId`, `payment_transaction.status`
- `search_analytics.query`, `search_analytics.createdAt`
- `login_history.userId`, `login_history.success`
- `error_log.errorType`, `error_log.createdAt`
- `lesson_watch_analytics.lessonId`, `lesson_watch_analytics.userId`

### Composite Indexes

- `(userId, courseId)` - Enrollment uniqueness
- `(userId, lessonId)` - Lesson progress uniqueness
- `(userId, assignmentId)` - Assignment submission uniqueness
- `(userId, quizId)` - Quiz submission uniqueness
- `(blogId, userId)` - Blog reaction uniqueness
- `(enrollmentId, badgeType)` - Badge uniqueness
- `(quizId, position)` - Quiz question ordering
- `(entityType, entityId)` - Activity log lookup

### Performance Considerations

1. **Query Optimization**
   - Indexes on frequently queried fields
   - Composite indexes for common join patterns
   - Indexes on status fields for filtering

2. **Cascade Deletes**
   - Most relationships use cascade delete for data integrity
   - SetNull used for optional relationships (e.g., blog category)

3. **JSON Fields**
   - Used for flexible metadata storage
   - Consider JSONB for better query performance in PostgreSQL

4. **Array Fields**
   - Used for tags, target user IDs, attachment keys
   - PostgreSQL arrays are efficient for small to medium datasets

---

## Data Integrity & Constraints

### Unique Constraints

1. **User Level**
   - `user.email` - Unique
   - `user.username` - Unique (if provided)
   - `user.stripeCustomerId` - Unique (if provided)
   - `billing_address.userId` - One-to-one relationship

2. **Course Level**
   - `course.slug` - Unique
   - `course.stripePriceId` - Unique

3. **Enrollment Level**
   - `(userId, courseId)` - One enrollment per user per course

4. **Progress Level**
   - `(userId, lessonId)` - One progress record per user per lesson
   - `(userId, assignmentId)` - One submission per user per assignment
   - `(userId, quizId)` - One submission per user per quiz

5. **Content Level**
   - `blog.slug` - Unique
   - `(blogId, userId)` - One reaction per user per blog
   - `(userId, courseId)` - One rating per user per course

6. **Support Level**
   - `(supportCallId, userId)` - One request per user per call
   - `(userId, announcementId)` - One read status per user per announcement

7. **Workspace Level**
   - `(userId, workspaceId)` - One membership per user per workspace
   - `workspace.slug` - Unique

### Foreign Key Constraints

All foreign keys use appropriate cascade behaviors:
- **Cascade Delete**: Child records deleted when parent deleted
- **SetNull**: Optional relationships set to null when parent deleted

### Check Constraints

- `rating` in `course_rating` should be 1-5 (enforced at application level)
- `points` should be non-negative (enforced at application level)
- `completionRate` should be 0-100 (enforced at application level)

---

## Business Logic & Workflows

### 1. User Registration & Authentication

**Flow**:
1. User registers → `user` record created
2. Email verification token → `verification` table
3. OAuth accounts → `account` table
4. Sessions → `session` table
5. Login history → `login_history` table

**Business Rules**:
- Email must be unique
- Username optional but unique if provided
- Email verification required
- Multiple OAuth providers supported

---

### 2. Course Creation & Publishing

**Flow**:
1. Teacher creates course → `course` (status: Draft)
2. Adds chapters → `chapter` (status: Draft)
3. Adds lessons → `lesson` (status: Draft)
4. Publishes course → `course.status = Published`
5. Publishes chapters → `chapter.status = Published`
6. Publishes lessons → `lesson.status = Published`

**Business Rules**:
- Courses must have at least one chapter
- Chapters must have at least one lesson
- Can schedule content for future release
- Draft content not visible to students

---

### 3. Enrollment & Payment

**Flow**:
1. Student views course → Course details displayed
2. Student enrolls → `enrollment` created (status: Pending)
3. Payment initiated → `payment_transaction` created
4. Stripe payment → `payment_transaction.status = Completed`
5. Enrollment activated → `enrollment.status = Active`
6. Billing address stored → `billing_address` created/updated

**Business Rules**:
- One enrollment per user per course
- Payment required for paid courses
- Enrollment status tracks payment state
- Certificates issued on completion

---

### 4. Learning Progress

**Flow**:
1. Student accesses lesson → `lesson_progress` created
2. Student watches video → `lesson_watch_analytics` updated
3. Student completes lesson → `lesson_progress.completed = true`
4. Student activity logged → `student_activity` created
5. Badges earned → `student_badge` created
6. Course completion → Certificate issued

**Business Rules**:
- Progress tracked per lesson
- Watch analytics track engagement
- Badges awarded for milestones
- Certificates require 100% completion

---

### 5. Assignments & Quizzes

**Flow**:
1. Teacher creates assignment → `assignment` created
2. Student submits → `assignment_submission` created (status: Pending)
3. Teacher grades → `assignment_submission.status = Graded`
4. Student views feedback → `assignment_submission.status = Returned`

**Quiz Flow**:
1. Teacher creates quiz → `quiz` + `quiz_question` created
2. Student takes quiz → `quiz_submission` created
3. Score calculated automatically
4. Points awarded based on performance

**Business Rules**:
- One assignment OR one quiz per lesson
- Submissions can be resubmitted (count tracked)
- Quiz scoring is automatic
- Assignment grading is manual

---

### 6. Blog System

**Flow**:
1. User creates blog → `blog` (status: Pending, points deducted)
2. Admin reviews → `blog.status = Approved/Rejected`
3. Blog published → `blog.status = Published`
4. Users react → `blog_reaction` created
5. Users comment → `blog_comment` created
6. Points earned → `blog.pointsEarned` updated

**Business Rules**:
- Points required to post
- Moderation required before publishing
- Points earned from engagement
- Featured blogs highlighted

---

### 7. Workspace & Multi-Tenancy

**Flow**:
1. Workspace created → `workspace` created
2. User invited → `invitation` created
3. Invitation accepted → `membership` created
4. Role assigned → `membership.role` set

**Business Rules**:
- Users can belong to multiple workspaces
- Roles: Member, Admin, SuperAdmin
- Invitations expire after set time
- Cascade delete maintains integrity

---

### 8. Announcements

**Flow**:
1. Admin creates announcement → `announcement` (status: Draft)
2. Targets selected → `targetRole`, `targetCourseId`, `targetUserIds`
3. Scheduled or published → `announcement.status = Published`
4. Users read → `announcement_read_status` created
5. View count updated → `announcement.viewCount++`

**Business Rules**:
- Can target specific roles, courses, or users
- Supports scheduled publishing
- Tracks read status per user
- Urgent announcements highlighted

---

### 9. Support System

**Support Call Flow**:
1. Admin creates call → `support_call` created
2. Students request → `support_call_request` created
3. Queue managed → `support_call_request.position` set
4. Student joins → `support_call_request.joinedAt` set
5. Call ends → `support_call.status = Ended`

**Help Request Flow**:
1. User creates request → `help_request` created
2. Admin responds → `help_request.response` set
3. User replies → `help_request.userReply` set
4. Request resolved → `help_request.status = Resolved`

**Business Rules**:
- Queue-based support calls
- Multi-turn help request conversations
- Tracks user type for routing

---

### 10. Analytics & Tracking

**Search Analytics**:
- Every search logged → `search_analytics`
- Tracks queries, results, clicks
- Measures search effectiveness

**Watch Analytics**:
- Video watch events → `lesson_watch_analytics`
- Tracks duration, completion rate
- Updates on each watch session

**Activity Logging**:
- System actions → `activity_log`
- Teacher actions → `activity_log`
- Comprehensive audit trail

**Business Rules**:
- Analytics track both authenticated and anonymous users
- Watch analytics update incrementally
- Activity logs preserve full history

---

## Security Considerations

### 1. Authentication & Authorization

- **Sessions**: Token-based with expiration
- **OAuth**: Multiple provider support
- **Password**: Hashed storage (if used)
- **Impersonation**: Admin impersonation tracking

### 2. Data Protection

- **Cascade Deletes**: Prevent orphaned records
- **Foreign Keys**: Enforce referential integrity
- **Unique Constraints**: Prevent duplicate data
- **Validation**: Application-level validation required

### 3. Privacy & Compliance

- **IP Addresses**: Stored for security/analytics
- **User Data**: Cascade deletes maintain privacy
- **Billing Data**: Separate table for sensitive information
- **Activity Logs**: Comprehensive audit trail

### 4. Payment Security

- **Stripe Integration**: PCI-compliant payment processing
- **Transaction Logging**: Full payment history
- **Refund Tracking**: Complete refund audit trail
- **Billing Address**: Separate secure storage

### 5. Content Moderation

- **Blog Moderation**: Approval workflow
- **User Bans**: Temporary and permanent bans
- **Enrollment Bans**: Course-specific bans
- **Activity Monitoring**: Comprehensive logging

---

## Database Maintenance

### Recommended Practices

1. **Regular Backups**
   - Daily automated backups
   - Point-in-time recovery capability
   - Test restore procedures

2. **Index Maintenance**
   - Monitor index usage
   - Rebuild indexes periodically
   - Remove unused indexes

3. **Query Optimization**
   - Monitor slow queries
   - Use EXPLAIN ANALYZE
   - Optimize based on usage patterns

4. **Data Archiving**
   - Archive old analytics data
   - Archive completed courses
   - Archive old sessions

5. **Monitoring**
   - Database size monitoring
   - Connection pool monitoring
   - Query performance monitoring

---

## Migration History

The database uses Prisma Migrate for version control. Key migrations include:

- Baseline schema sync
- Social links addition
- Billing address support
- Assignment system
- Quiz system
- Course ratings
- Help request system
- And more...

See `prisma/migrations/` directory for full migration history.

---

## Conclusion

This database design supports a comprehensive Learning Management System with:

- ✅ Multi-tenant architecture
- ✅ Course management & delivery
- ✅ Student progress tracking
- ✅ Payment processing
- ✅ Social features (blogs, comments)
- ✅ Analytics & reporting
- ✅ Support & help desk
- ✅ Administration tools

The schema is designed for scalability, maintainability, and data integrity, with comprehensive indexing and relationship management.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Database Provider**: PostgreSQL  
**ORM**: Prisma
