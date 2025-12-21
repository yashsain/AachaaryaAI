# Authentication Setup Guide

Complete authentication system implementation for aachaaryAI multi-tenant platform.

## System Overview

**Architecture**: Supabase Auth + Teachers Table Sync
**Pattern**: Email-based login with JWT tokens
**Multi-tenancy**: Institute-level isolation via RLS policies
**Roles**: Admin & Teacher with role-based access control

---

## Setup Instructions

### Step 1: Apply Database Migration

1. Open Supabase Dashboard: https://lcqedbasygvbpefhagob.supabase.co
2. Navigate to **SQL Editor**
3. Copy and run `/Users/yashsain/AachaaryaAI/docs/005_auth_setup.sql`

This creates:
- Custom Access Token Hook (adds `institute_id` and `role` to JWT)
- Soft delete support for teachers
- Seed data (first institute)

### Step 2: Enable Supabase Auth

1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable email confirmations: **OFF** (admins create users)
   - ✅ Secure email change: **ON**
   - ✅ Secure password change: **ON**

### Step 3: Enable Custom Access Token Hook

1. Go to **Authentication → Hooks**
2. Select **Custom Access Token** hook type
3. Choose function: `public.custom_access_token_hook`
4. Click **Enable Hook**

This ensures every JWT contains:
```json
{
  "institute_id": "uuid-here",
  "role": "admin" | "teacher",
  "name": "Teacher Name"
}
```

### Step 4: Create First Admin User

#### Option A: Via Supabase Dashboard (Recommended for first user)

1. Go to **Authentication → Users**
2. Click **Add User**
3. Fill in:
   - **Email**: `admin@democoaching.com`
   - **Password**: (set a secure password)
   - **Auto Confirm User**: ✅ ON
   - **User Metadata** (JSON):
     ```json
     {
       "name": "Demo Admin"
     }
     ```
   - **App Metadata** (JSON):
     ```json
     {
       "institute_id": "00000000-0000-0000-0000-000000000001",
       "role": "admin"
     }
     ```
4. Click **Create User**
5. Copy the user's UUID

#### Create Corresponding Teachers Record

Go to **SQL Editor** and run:
```sql
INSERT INTO public.teachers (
  id,
  institute_id,
  email,
  name,
  role,
  password_hash,
  created_at
) VALUES (
  'PASTE_UUID_HERE'::UUID,  -- UUID from auth.users
  '00000000-0000-0000-0000-000000000001'::UUID,
  'admin@democoaching.com',
  'Demo Admin',
  'admin',
  'MANAGED_BY_SUPABASE_AUTH',
  NOW()
);
```

### Step 5: Test Login

1. Start development server: `npm run dev`
2. Navigate to: http://localhost:3000/login
3. Log in with:
   - Email: `admin@democoaching.com`
   - Password: (password you set)
4. Should redirect to `/dashboard` ✅

---

## File Structure

```
src/
├── lib/
│   ├── supabase.ts                     # Supabase client (dual: regular + admin)
│   └── auth/
│       └── teacherAccount.ts           # Core auth functions (create, delete, update)
├── contexts/
│   └── AuthContext.tsx                 # Session management, auth state
├── middleware.ts                       # Route protection (auth + role checks)
└── app/
    ├── layout.tsx                      # Wrapped with AuthProvider
    ├── login/page.tsx                  # Login page
    ├── forgot-password/page.tsx        # Password reset request
    ├── reset-password/page.tsx         # Password reset confirmation
    ├── set-password/page.tsx           # New teacher password setup
    └── dashboard/page.tsx              # Protected dashboard (requires auth)

docs/
└── 005_auth_setup.sql                  # Database migration for auth
```

---

## Key Features Implemented

### ✅ Authentication Flow
- Email + password login
- JWT-based sessions (managed by Supabase)
- Automatic session refresh
- Sign out functionality

### ✅ Password Management
- Forgot password flow (email magic link)
- Reset password page
- Set password for new teachers (invitation flow)
- Minimum 8 character validation

### ✅ Route Protection
- Middleware protects `/dashboard/*` routes
- Redirects unauthenticated users to `/login`
- Admin-only routes: `/admin/*`
- API route protection

### ✅ Multi-Tenant Isolation
- `institute_id` in JWT claims
- RLS policies filter by institute automatically
- Teachers can only access own institute data

### ✅ Role-Based Access Control
- Two roles: `admin` and `teacher`
- `role` stored in JWT claims
- Admin can access `/admin/*` routes
- Teacher limited to own resources

### ✅ Teacher Management Functions
- `createTeacherAccount()` - Create user in both auth.users and teachers
- `deleteTeacher()` - Soft delete with email mangling
- `updateTeacher()` - Update profile details
- `changeTeacherRole()` - Promote/demote admin ↔ teacher
- `getInstituteTeachers()` - List all teachers in institute

---

## Using the Auth System

### In Components

```typescript
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, teacher, institute, isAdmin, signOut } = useAuth()

  return (
    <div>
      <p>Welcome {teacher?.name}</p>
      <p>Institute: {institute?.name}</p>
      {isAdmin && <button>Admin Action</button>}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Require Authentication

```typescript
import { useRequireAuth } from '@/contexts/AuthContext'

export default function ProtectedPage() {
  const { teacher } = useRequireAuth() // Redirects if not logged in

  return <div>Protected content for {teacher.name}</div>
}
```

### Require Admin Role

```typescript
import { useRequireAdmin } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { teacher } = useRequireAdmin() // Redirects if not admin

  return <div>Admin panel</div>
}
```

### Create New Teacher (Admin Only)

```typescript
import { createTeacherAccount } from '@/lib/auth/teacherAccount'

async function inviteTeacher() {
  const result = await createTeacherAccount({
    email: 'newteacher@institute.com',
    name: 'New Teacher',
    phone: '+91-1234567890',
    instituteId: 'institute-uuid',
    role: 'teacher',
    // No initialPassword = sends invitation email
  })

  if (result.success) {
    console.log('Teacher invited!', result.teacherId)
  } else {
    console.error('Error:', result.error)
  }
}
```

---

## Testing Checklist

### ✅ Basic Auth
- [ ] Can log in with valid credentials
- [ ] Cannot log in with invalid credentials
- [ ] Session persists on page refresh
- [ ] Sign out clears session

### ✅ Password Reset
- [ ] Request reset email
- [ ] Email contains magic link
- [ ] Can set new password via link
- [ ] Old password no longer works
- [ ] New password works

### ✅ Route Protection
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] `/dashboard` loads when authenticated
- [ ] `/admin` redirects teachers to `/dashboard`
- [ ] `/admin` allows admins access

### ✅ Multi-Tenant Isolation
- [ ] Teacher A cannot see Teacher B's materials (different institutes)
- [ ] Teacher A can see own institute materials
- [ ] Admin can only manage own institute teachers

### ✅ Teacher Invitation
- [ ] Admin can create new teacher account
- [ ] New teacher receives invitation email
- [ ] New teacher can set password
- [ ] New teacher can log in

---

## Common Issues & Solutions

### Issue: JWT doesn't contain custom claims

**Solution**:
1. Verify Custom Access Token Hook is enabled in dashboard
2. Log out and log back in (JWT is cached)
3. Inspect JWT at https://jwt.io - should see `institute_id` and `role`

### Issue: RLS policies blocking access

**Solution**:
1. Verify `auth.uid()` returns correct teacher UUID:
   ```sql
   SELECT auth.uid();
   ```
2. Check teachers table has matching record:
   ```sql
   SELECT * FROM teachers WHERE id = auth.uid();
   ```
3. Verify `get_teacher_institute_id()` returns non-null:
   ```sql
   SELECT get_teacher_institute_id();
   ```

### Issue: Email already exists error

**Solution**:
- Email might be soft-deleted. Check:
  ```sql
  SELECT email, deleted_at FROM teachers WHERE email = 'example@email.com';
  ```
- If `deleted_at` is not null, email was soft-deleted and mangled
- Original email is now available for new user

### Issue: Cannot create teacher - auth.users created but teachers insert fails

**Solution**:
- Transaction rolled back automatically
- `createTeacherAccount()` function deletes auth.users if teachers insert fails
- Check error message for constraint violations (unique email, foreign key, etc.)

---

## Security Considerations

### ✅ Implemented
- Passwords hashed by Supabase Auth (bcrypt)
- JWT tokens signed and verified by Supabase
- HTTP-only cookies for session storage
- CSRF protection via SameSite cookies
- RLS policies enforce institute isolation
- Middleware protects all routes
- Admin actions require admin role

### ⚠️ Production Recommendations
1. Enable email verification for production
2. Set up rate limiting (Supabase provides this)
3. Configure CORS properly
4. Use environment-specific redirect URLs
5. Monitor failed login attempts
6. Set up 2FA for admin accounts (Supabase supports MFA)

---

## Next Steps

### Admin Features (To Be Implemented)
- [ ] Admin panel UI for teacher management
- [ ] Invite teacher via email form
- [ ] List all teachers in institute
- [ ] Edit teacher details
- [ ] Delete (soft) teachers
- [ ] Promote/demote teachers to admin

### User Profile Features
- [ ] Edit own profile
- [ ] Change password (logged in)
- [ ] Upload profile picture
- [ ] View activity log

### Advanced Features
- [ ] Multi-factor authentication (MFA)
- [ ] Social login (Google, Microsoft)
- [ ] API key management for headless access
- [ ] Audit logs for security events

---

## API Reference

### Core Functions

#### `createTeacherAccount(data)`
Creates a new teacher account in both auth.users and teachers table.

**Parameters**:
- `email` (string): Teacher email
- `name` (string): Full name
- `phone` (string, optional): Phone number
- `instituteId` (string): UUID of institute
- `role` ('admin' | 'teacher'): Role
- `initialPassword` (string, optional): If provided, sets password. Otherwise sends invitation email.

**Returns**: `{ success, teacherId?, teacher?, error? }`

#### `deleteTeacher(teacherId)`
Soft deletes a teacher (sets `deleted_at`, mangles email, bans in auth.users).

**Parameters**:
- `teacherId` (string): UUID of teacher

**Returns**: `{ success, error? }`

#### `updateTeacher(teacherId, updates)`
Updates teacher profile details.

**Parameters**:
- `teacherId` (string): UUID of teacher
- `updates` (object): Partial fields to update (`name`, `phone`, `email`)

**Returns**: `{ success, error? }`

#### `changeTeacherRole(teacherId, newRole)`
Changes teacher role between admin and teacher.

**Parameters**:
- `teacherId` (string): UUID of teacher
- `newRole` ('admin' | 'teacher'): New role

**Returns**: `{ success, error? }`

---

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://lcqedbasygvbpefhagob.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSy...
```

---

## Support

For issues or questions:
1. Check this document first
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Verify database records match auth.users

---

**Status**: ✅ Fully Implemented
**Last Updated**: December 17, 2025
**Version**: 1.0
