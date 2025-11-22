# 📚 Course Upload Guide

## 🎯 Overview
To upload/create courses in Marshal LMS, you need **admin role**.

## ✅ Step 1: Set Up Admin Role

You have **3 options** to make yourself an admin:

### Option 1: Using Prisma Studio (Easiest - Recommended)

1. **Run Prisma Studio:**
   ```bash
   pnpm prisma studio
   ```

2. **Open your browser** - Prisma Studio will open at `http://localhost:5555`

3. **Find your user:**
   - Click on the **"user"** table
   - Find your user by email address (the email you registered with)

4. **Update the role:**
   - Click on your user row
   - Find the **"role"** field
   - Change it from `null` to `"admin"`
   - Click **"Save 1 change"**

5. **Done!** 🎉 You're now an admin!

### Option 2: Using SQL (Direct Database)

1. **Connect to your database** (using any PostgreSQL client)
2. **Run this SQL query:**
   ```sql
   UPDATE "user" 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

### Option 3: Using the Script (Advanced)

1. **Make sure you're logged in** (registered a user account first)
2. **Run the script:**
   ```bash
   npx ts-node scripts/make-admin.ts your-email@example.com
   ```

## 📝 Step 2: Access Admin Panel

Once you have admin role:

1. **Login to your account** at `/login`
2. **Go to admin dashboard** at `/admin`
3. **Access courses** at `/admin/courses`
4. **Create new course** at `/admin/courses/create`

## 🎨 Step 3: Upload a Course

### Course Creation Process:

1. **Navigate to:** `/admin/courses/create`
   - Or click "Create Course" button in `/admin/courses`

2. **Fill in the course form:**
   - **Title**: Course name (required)
   - **Slug**: URL-friendly version (use "Generate Slug" button)
   - **Small Description**: Brief summary
   - **Description**: Full description (rich text editor)
   - **Thumbnail Image**: Upload course thumbnail
   - **Category**: Select from available categories
   - **Level**: Beginner, Intermediate, or Advanced
   - **Duration**: Course duration in hours
   - **Price**: Price in USD
   - **Status**: Draft, Published, or Archived

3. **Click "Create Course"**

4. **After creation:**
   - You'll be redirected to `/admin/courses`
   - Click on your course to **edit** it
   - Add **Chapters** and **Lessons** to your course

## 📚 Step 4: Add Course Content

After creating a course:

1. **Edit the course** from `/admin/courses`
2. **Add Chapters:**
   - Click "Add Chapter" button
   - Give it a title and position
   
3. **Add Lessons:**
   - Click on a chapter
   - Click "Add Lesson" button
   - Upload video, thumbnail, add description

## 🔐 Required Role

- **Role Name**: `"admin"`
- **Stored in**: `user.role` field in database
- **Checked by**: `/app/data/admin/require-admin.ts`

## ❓ Troubleshooting

### "Not Admin" Error

If you see `/not-admin` page:
- Your user doesn't have admin role
- Follow Step 1 above to set admin role

### Can't Access Admin Pages

- Make sure you're logged in
- Check that `user.role = "admin"` in database
- Clear browser cache and cookies

## 🔗 Useful Links

- **Admin Dashboard**: `/admin`
- **Courses List**: `/admin/courses`
- **Create Course**: `/admin/courses/create`
- **Edit Course**: `/admin/courses/[courseId]/edit`

---

**Happy Course Creating! 🚀**
