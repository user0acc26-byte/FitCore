# FitCore Firestore Security Specification

## Data Invariants
1. Public catalog collections (`facilities`, `membershipPlans`, `classes`, `trainers`, `shopCategories`, `shopProducts`, `siteContent`, `announcements`) are publicly readable so visitors can browse FitCore without logging in, and writable exclusively by verified FitCore Admins (`isAdmin()`).
2. Protected member collections (`members`, `subscriptions`, `trainingSchedules`, `attendance`, `payments`, `progressRecords`, `workoutPlans`, `notifications`) enforce strict PII isolation: only Admins (`isAdmin()`) or the authenticated member owning that record (`authUid == request.auth.uid` or verified email match) may read.
3. Official member records (`members`, `subscriptions`, `trainingSchedules`, `attendance`, `payments`, `progressRecords`, `workoutPlans`) cannot be created, altered, or deleted by members. Members may only link their `authUid` / clear `mustChangePassword` on initial sign-in, or toggle `isRead` on their own `notifications`.
4. Public visitors may create `inquiries` (`contact` or `membership_registration`) with initial `status == 'new'`, validated against strict field/length limits; only Admins may read, update, or delete inquiries.
5. Admin privileges are verified exclusively via `admins/{uid}` documents or the verified runtime owner email (`user0acc26@gmail.com` with `email_verified == true`), never via client-supplied role claims.

## Adversarial Payloads Tested
1. Unauthenticated write to `membershipPlans` -> PERMISSION_DENIED
2. Member attempting to edit their own `members` `status` or `firstName` -> PERMISSION_DENIED
3. Member attempting to read another member's `progressRecords` -> PERMISSION_DENIED
4. Member attempting to list `members` without filtering by own UID/email -> PERMISSION_DENIED
5. Member attempting to insert a `payments` record -> PERMISSION_DENIED
6. Member attempting to self-create an `admins/{uid}` document -> PERMISSION_DENIED
7. Unauthenticated user attempting to read `inquiries` (visitor PII) -> PERMISSION_DENIED
8. Visitor submitting an `inquiries` document with pre-set `status: 'approved'` -> PERMISSION_DENIED
9. Visitor submitting an oversized >2KB string into an ID or inquiry field -> PERMISSION_DENIED
10. Unverified email trying to claim admin or member access -> PERMISSION_DENIED
11. Member adding a shadow field `isAdmin: true` while marking notification `isRead: true` -> PERMISSION_DENIED
12. Unauthenticated delete on `shopProducts` -> PERMISSION_DENIED
