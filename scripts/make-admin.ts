/**
 * Script to make a user an admin
 * 
 * Usage:
 * 1. First register/login to create a user account
 * 2. Find your user email from the database or use the email you registered with
 * 3. Run: node -r ts-node/register scripts/make-admin.ts your-email@example.com
 *    OR: npx ts-node scripts/make-admin.ts your-email@example.com
 * 
 * Alternative: Use Prisma Studio to manually update:
 * 1. Run: pnpm prisma studio
 * 2. Go to User table
 * 3. Find your user by email
 * 4. Update the "role" field to "admin"
 */

// Use the same Prisma client from lib/db.ts
import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found!`);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`✅ User ${email} is already an admin!`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { email },
      data: {
        role: "admin",
      },
    });

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`\nYou can now:`);
    console.log(`- Access /admin to manage courses`);
    console.log(`- Create courses at /admin/courses/create`);
    console.log(`- Edit courses at /admin/courses`);
  } catch (error) {
    console.error("❌ Error making user admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address!");
  console.log("\nUsage: pnpm tsx scripts/make-admin.ts your-email@example.com");
  process.exit(1);
}

makeAdmin(email);
