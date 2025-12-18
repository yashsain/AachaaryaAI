# Supabase Dashboard Configuration

## Required Settings for Teacher Invitations

To ensure teacher invitation emails work correctly, you need to configure your Supabase project settings.

### 1. Navigate to Auth Settings

1. Go to your Supabase Dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**

### 2. Configure Site URL

**IMPORTANT:** The Site URL determines where Supabase redirects users after clicking email links.

**Current Setting (WRONG):**
```
Site URL: http://localhost:3000/login
```

**Correct Setting:**
```
Site URL: http://localhost:3000
```

⚠️ **Why this matters:** When Site URL includes `/login`, ALL email links (including invitations and password resets) will redirect to `/login` instead of the callback route, causing the invitation flow to fail.

### 3. Configure Redirect URLs

Add these URLs to the **Redirect URLs** whitelist:

```
http://localhost:3000/auth/callback
http://localhost:3000/set-password
http://localhost:3000/reset-password
http://localhost:3000/dashboard
```

### 4. Email Templates (Optional)

If you want to customize the invitation email:

1. Go to **Authentication** → **Email Templates**
2. Select **Invite user**
3. The template should use: `{{ .ConfirmationURL }}`
4. This will automatically use the `redirectTo` parameter from `inviteUserByEmail()`

### 5. Production Settings

For production deployment, update:

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs:**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/set-password
https://yourdomain.com/reset-password
https://yourdomain.com/dashboard
```

And update `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Troubleshooting

### Issue: Invitation links redirect to `/login` instead of `/set-password`

**Solution:**
1. Check Site URL in Supabase Dashboard (should be base URL only, no path)
2. Clear browser cache
3. Create a new test teacher to get a fresh invitation link

### Issue: "Invalid or expired invitation link"

**Possible causes:**
1. Invitation link was already used
2. Invitation link expired (default: 1 hour)
3. Site URL misconfigured (see above)

**Solution:**
1. Delete the test teacher
2. Fix Site URL in Supabase Dashboard
3. Create a new test teacher
4. Use the new invitation link

### Issue: Admin gets logged out when clicking invitation link

**This is expected behavior:**
- Invitation links contain auth tokens that create a new session
- The new session replaces any existing session
- Always test invitation links in an incognito/private window OR after signing out

## Current Implementation

The app now handles invitation tokens in multiple ways:

1. **Preferred:** Email link → `/auth/callback?type=invite#access_token=...` → `/set-password?invite=true`
2. **Fallback:** If Site URL is `/login` → Email link → `/login#access_token=...&type=invite` → Auto-redirect to `/set-password?invite=true`

This means the invitation flow should work even if Site URL is misconfigured, but it's still recommended to fix the Site URL for optimal performance.
