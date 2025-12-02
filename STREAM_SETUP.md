# Stream.io Video Calling Setup Guide

## Prerequisites

1. Create a Stream.io account at https://getstream.io/
2. Create a new application in your Stream.io dashboard
3. Get your API credentials

## Environment Variables Setup

Add the following environment variables to your `.env.local` file (or your deployment environment):

```env
# Stream.io Video Calling
NEXT_PUBLIC_STREAM_API_KEY=your_api_key_here
STREAM_SECRET_KEY=your_secret_key_here
```

### How to Get Your Stream.io Credentials

1. **Sign up/Login** to Stream.io: https://getstream.io/
2. **Create an Application**:
   - Go to your dashboard
   - Click "Create App" or select an existing app
   - Choose "Video & Audio" as the product type
3. **Get Your Credentials**:
   - In your app dashboard, go to "API Keys"
   - Copy the "API Key" → This is your `NEXT_PUBLIC_STREAM_API_KEY`
   - Copy the "Secret" → This is your `STREAM_SECRET_KEY`

### Important Notes

- `NEXT_PUBLIC_STREAM_API_KEY` must start with `NEXT_PUBLIC_` because it's used in client-side code
- `STREAM_SECRET_KEY` should NEVER be exposed to the client (it's server-only)
- Keep your secret key secure and never commit it to version control

## After Setup

1. **Restart your development server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   # or
   pnpm dev
   ```

2. **Clear your browser cache** and refresh the page

3. **Check the browser console** - you should see "Stream.io client initialized successfully"

## Troubleshooting

### Error: "Stream.io not configured"
- Make sure both environment variables are set
- Restart your development server after adding them
- Check that the variable names are exactly as shown above

### Error: "Failed to get Stream token"
- Verify your `STREAM_SECRET_KEY` is correct
- Check that your Stream.io app has Video & Audio enabled
- Ensure your API key and secret are from the same application

### Client not initializing
- Check browser console for detailed error messages
- Verify you're logged in (authentication is required)
- Make sure `NEXT_PUBLIC_STREAM_API_KEY` is accessible in the browser

## Testing

Once configured, you should be able to:
1. Go to `/admin/courses/students?courseId=...`
2. Click the "Support Sessions" tab
3. Click "Create Session" - the button should be enabled
4. Create and join video support sessions

## Free Tier Limits

Stream.io offers a free tier with limited usage. Check their pricing page for current limits:
https://getstream.io/pricing/


