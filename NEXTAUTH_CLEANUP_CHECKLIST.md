# NextAuth Cleanup Checklist

This document lists all NextAuth references found in the codebase that need to be removed or updated.

## 📁 Files to Delete

1. **`apps/ui/src/lib/next-auth.ts`** - Entire NextAuth configuration file (177 lines)

   - Contains `authOptions` export
   - Contains `getAuth()` function
   - No longer needed - replaced by Better Auth

2. **`apps/ui/src/types/next-auth.d.ts`** - NextAuth type definitions (46 lines)
   - Marked as LEGACY but still exists
   - Contains `AppSession` interface that's still imported elsewhere

## 📝 Files to Update

### 1. `apps/ui/src/types/general.ts`

- **Line 1**: `import { AppSession } from "@/types/next-auth"`
- **Line 15**: Uses `AppSession["strapiJWT"]` type
- **Action**: Replace `AppSession` with Better Auth session type or create new type

### 2. `apps/ui/src/components/page-builder/single-types/navbar/LoggedUserMenu.tsx`

- **Line 2**: `import { Session } from "next-auth"`
- **Line 16**: `user: Session["user"]`
- **Action**: Replace with Better Auth session type

### 3. `apps/ui/src/app/[locale]/auth/page.tsx`

- **Line 4**: `import { getAuth } from "@/lib/auth"`
- **Line 23**: `const session = await getAuth()`
- **Action**: Update to use Better Auth's `auth.api.getSession()`

### 4. `apps/ui/src/env.mjs`

- **Lines 30-31**: `NEXTAUTH_URL` and `NEXTAUTH_SECRET` environment variables
- **Lines 83-84**: Environment variable exports
- **Note**: `NEXTAUTH_SECRET` is still used in `apps/ui/src/lib/auth.ts` (line 213)
- **Action**:
  - Keep `NEXTAUTH_SECRET` for now (used by Better Auth)
  - Remove `NEXTAUTH_URL` if not needed
  - Consider renaming `NEXTAUTH_SECRET` to `BETTER_AUTH_SECRET` or `AUTH_SECRET` in the future

### 5. `apps/ui/src/lib/auth.ts`

- **Line 213**: Uses `env.NEXTAUTH_SECRET` (but this is okay - just a variable name)

### 6. `apps/ui/src/app/api/private-proxy/[...slug]/route.ts`

- **Line 13**: Comment mentions "NextAuth's session"
- **Action**: Update comment to mention Better Auth

### 7. `apps/ui/README.md`

- **Line 18**: Lists `next-auth` as a dependency
- **Line 100**: Mentions NextAuth in export mode explanation
- **Line 192**: Mentions NextAuth configuration
- **Line 209**: Shows NextAuth `useSession()` example
- **Action**: Update documentation to reflect Better Auth

### 8. `apps/ui/package.json`

- **Line 55**: `"next-auth": "^4.24.12"` dependency
- **Action**: Remove this dependency

## 🔍 Summary

### Files with NextAuth imports:

- ✅ `apps/ui/src/lib/next-auth.ts` - DELETE
- ✅ `apps/ui/src/types/next-auth.d.ts` - DELETE (after updating references)
- ⚠️ `apps/ui/src/types/general.ts` - UPDATE (imports AppSession)
- ⚠️ `apps/ui/src/components/page-builder/single-types/navbar/LoggedUserMenu.tsx` - UPDATE (imports Session)
- ⚠️ `apps/ui/src/app/[locale]/auth/page.tsx` - UPDATE (uses getAuth)

### Environment Variables:

- ⚠️ `NEXTAUTH_URL` - Can be removed
- ⚠️ `NEXTAUTH_SECRET` - Still used by Better Auth (consider renaming later)

### Package Dependencies:

- ⚠️ `next-auth` package - Remove from package.json

### Documentation:

- ⚠️ `apps/ui/README.md` - Update to mention Better Auth instead of NextAuth

## 🎯 Priority Order

1. **High Priority** (Breaking if not fixed):

   - Update `LoggedUserMenu.tsx` (used in navbar)
   - Update `auth/page.tsx` (uses getAuth)
   - Update `general.ts` (used by Strapi API client)

2. **Medium Priority** (Cleanup):

   - Delete `next-auth.ts` file
   - Delete `next-auth.d.ts` file (after updating references)
   - Remove `next-auth` from package.json

3. **Low Priority** (Documentation):
   - Update README.md
   - Update comments in code
   - Consider renaming `NEXTAUTH_SECRET` env var
