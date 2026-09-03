# SafeTag Security Test Checklist

Run before production. Every item must PASS.

## Cross-user access
- [ ] User A cannot access/edit User B private profile
- [ ] User A cannot activate Emergency Mode on User B
- [ ] Non-admin cannot access `/api/admin/*`

## Public NFC
- [ ] No full ID number or home address on public page
- [ ] Public cannot modify profile or emergency mode
- [ ] Deactivated/replaced tags do not leak private data

## Auth
- [ ] Passwords hashed (bcrypt)
- [ ] Session cookie httpOnly

## Location
- [ ] Only collected with explicit browser permission + user action

## Export
- [ ] Requires confirm=yes and is audit-logged
