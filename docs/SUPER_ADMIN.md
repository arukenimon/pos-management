# Platform administration

The platform console is at `/super-admin`. It uses the normal login and requires
an active account, verified email, and an explicit platform grant. The legacy
`admin` role and shop owner/manager/cashier roles never grant platform access.

## Deployment

1. Take the normal database backup before deploying.
2. Check that no existing shop uses the slug `super-admin`. The new migration
   checks this before changing the schema and stops with an actionable error if
   there is a conflict. Resolve that shop URL and dependent links explicitly;
   deployment never renames shops automatically.
3. Run `php artisan migrate --force` before serving the updated application and
   deploy the frontend assets produced by `npm run build`.
4. Grant an existing, verified, active operator account:

   ```powershell
   php artisan app:super-admin operator@example.com --reason="Initial platform operator"
   ```

   For the production Docker stack, prefix artisan commands with
   `docker compose exec app`. No existing account is promoted by a migration or
   seeder, and the command does not create accounts or mark email as verified.

5. Sign in and visit `/super-admin`. Confirm shop/user totals and an audit event
   for the initial grant. Test suspension/restoration on a dedicated test shop.

To revoke access, first ensure another active, verified Super Admin exists:

```powershell
php artisan app:super-admin operator@example.com --revoke --reason="Operator handoff"
```

The command rejects removal of the final active, verified operator. All grants
and revocations are audited as `Server command`; access to the deployment host
determines who may run the command. Use host access logs for individual CLI
operator attribution. Super Admin accounts cannot be suspended in the console
or deleted through their profile while they retain platform access.

## Operations

- Overview shows account/shop counts and registrations within the past 30 days.
  Active means not suspended; email verification is reported separately.
- Directories, shop members, memberships, and the audit log use 25-row pages.
  Platform details include usage counts, with no sales or inventory records.
- Shop suspension blocks all its pages, actions, exports, and stock API access.
  Members retain access to their profile and other active shops. Data and shop
  memberships are retained, including open shifts; restoration resumes access.
- Account suspension blocks subsequent authenticated requests, token use, and
  new broadcast authorization. Personal access tokens are deleted, remember
  credentials rotated, and database sessions removed. Other session drivers
  are rejected on their next request. Restoration requires a fresh sign-in;
  revoked tokens must be reissued through existing account tooling.
- Already authorized websocket connections are not forcibly disconnected by
  this release. Suspension does not cancel an HTTP request already executing.
- Every status change needs an internal reason and confirmation. Repeating the
  current status is a no-op. Reasons appear only in platform details and audit
  history; member-facing notices do not disclose them.
- Status changes and audit writes share a database transaction. Audit snapshots
  survive deletion of the original actor or target and contain no credentials.
  The console provides no audit editing or deletion endpoints.

No billing, provisioning, impersonation, identity edits, or shop-role changes
are included. Personally joined shops still enforce the operator's shop role.

## Verification

```powershell
npm run build
php artisan test
npm run test:e2e:platform
```

Verify the platform and profile screens in both themes at desktop and mobile
widths. Check table scrolling, filtering, pagination, mobile drawer Escape/focus,
and status-dialog confirmation. Run browser tests only against a dedicated test
database: the platform end-to-end test provisions isolated test fixtures.
