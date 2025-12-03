# Database Connection Troubleshooting Guide

## Error: Can't reach database server

If you're seeing the error:
```
Can't reach database server at 'ep-steep-fire-a8zmbewg-pooler.eastus2.azure.neon.tech:5432'
```

## Quick Fixes

### 1. **Check if Neon Database is Paused** (Most Common)

Neon databases automatically pause after inactivity to save resources. You need to:

1. Go to your [Neon Console](https://console.neon.tech/)
2. Find your database project
3. If the database is paused, click "Resume" or "Wake up"
4. Wait a few seconds for it to start
5. Refresh your application

### 2. **Verify Your Connection String**

Your `DATABASE_URL` should look like this:

```env
DATABASE_URL="postgresql://username:password@ep-steep-fire-a8zmbewg-pooler.eastus2.azure.neon.tech:5432/dbname?sslmode=require"
```

**Important notes:**
- Make sure you're using the **pooler** connection string (not the direct connection)
- Include `?sslmode=require` at the end for secure connections
- Check that the host, port, username, password, and database name are correct

### 3. **Update Connection String Format**

If your connection string doesn't have SSL mode, add it:

```env
DATABASE_URL="your-existing-connection-string?sslmode=require"
```

For connection pooling (recommended for Neon):
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require&pgbouncer=true"
```

### 4. **Check Environment Variables**

Make sure your `.env.local` file has the correct `DATABASE_URL`:

1. Open `.env.local` in your project root
2. Verify the `DATABASE_URL` is set correctly
3. Restart your development server after changes:
   ```bash
   # Stop the server (Ctrl+C) and restart
   pnpm dev
   ```

### 5. **Test Database Connection**

You can test if your database is accessible by running:

```bash
# Test Prisma connection
pnpm prisma db execute --stdin
```

Or check with:
```bash
pnpm prisma studio
```

## Additional Steps

### Enable Connection Pooling

For Neon, use the connection pooler endpoint. Your connection string should use:
- Host: `ep-xxx-pooler.eastus2.azure.neon.tech` (with `-pooler`)
- Port: `5432`

### Check Network/Firewall

If you're behind a firewall or VPN, it might be blocking the connection. Try:
- Disconnecting VPN temporarily
- Checking if port 5432 is allowed

### Database Server Status

Check the Neon status page or console for any ongoing incidents or maintenance.

## Still Having Issues?

1. **Regenerate Connection String:**
   - Go to Neon Console
   - Navigate to your project
   - Copy a fresh connection string
   - Update your `.env.local`

2. **Check Prisma Client:**
   ```bash
   pnpm prisma generate
   ```

3. **Restart Everything:**
   ```bash
   # Stop dev server
   # Then:
   pnpm prisma generate
   pnpm dev
   ```

## Environment File Location

Your `.env.local` file should be in the project root directory with:
```env
DATABASE_URL="your-connection-string-here"
```