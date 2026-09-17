# Security Specification for ProfileHub

## 1. Data Invariants
- A user account (`/users/{userId}`) can only be read or written by the authentic owner (`request.auth.uid == userId`) or an admin.
- Users cannot assign themselves `role: "ADMIN"` or change critical RBAC permissions.
- Public profiles (`/profiles/{profileId}`) are read-accessible to the public ONLY when `resource.data.status == "PUBLISHED"`.
- Private/Draft profiles can only be read by their creator (`resource.data.userId == request.auth.uid`) or admins.
- Writes to `/profiles/{profileId}` require authentication and `request.auth.uid == incoming().userId`.
- Reports (`/reports/{reportId}`) can be submitted by anyone (or authenticated users), but can only be read and updated by administrators.
- Verification requests (`/verificationRequests/{requestId}`) can only be created by the owner user and reviewed by administrators.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Public Write to Profile**: Attempting `create` or `update` on `/profiles/p1` without `request.auth`.
2. **Impersonation on Profile Create**: User `uid123` creates `/profiles/p2` with `userId: "uid999"`.
3. **Privilege Escalation in Users**: Normal user updates `/users/uid123` with `{ role: "ADMIN" }`.
4. **Reading Draft Profile as Anonymous**: Anonymous user queries `/profiles/draft-id` where `status == "DRAFT"`.
5. **Updating Another User's Profile**: User `uid123` updates `/profiles/user456_profile`.
6. **Deleting Another User's Profile**: User `uid123` deletes `/profiles/user456_profile`.
7. **Junk Character ID Attack**: Creating doc with 2KB random unicode ID.
8. **Malicious Report Modification by Public**: Non-admin user tries to update `/reports/rep1` status to `RESOLVED`.
9. **Reading Other Users' Verification Proofs**: User `uid123` attempts to read `/verificationRequests/user456_req`.
10. **Shadow Field Injection**: Injecting unauthorized `isVerifiedBySystem: true` directly onto profile.
11. **Bypassing Status Lock on Suspended Profile**: Suspended user attempting to toggle status back to `PUBLISHED`.
12. **Blanket Query Scraping**: Attempting an unrestricted list of users collection.
