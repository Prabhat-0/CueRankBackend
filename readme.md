# Mail configuration

Set these variables in the application's `.env` file to enable email:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
MAIL_FROM=CueRank <no-reply@example.com>
```

`SMTP_PORT` defaults to `587`; port `465` uses implicit TLS automatically. The
SMTP username and password must either both be set or both be omitted (for an
unauthenticated relay). Without a complete configuration, the application
starts normally, reports that email is unavailable, and returns a clear error
when a mail send is attempted.

# Role-based authentication

The API supports `player`, `club`, and `admin` roles:

- `POST /api/v1/player/signup` creates a player account; clients cannot choose a role.
- `POST /api/v1/player/login` authenticates players.
- `POST /api/v1/club/registerClub` registers a club without a password. New clubs remain pending until approved.
- `PATCH /api/v1/admin/clubs/:id/approve` emails an approved club a generated temporary password.
- `POST /api/v1/club/login` authenticates approved clubs using that email and temporary password.
- `PATCH /api/v1/club/changePassword` lets an authenticated club change its temporary password using `currentPassword` and `newPassword`.
- `POST /api/v1/admin/login` authenticates an existing admin account.
- Admin-only route: `GET /api/v1/admin/clubs/pending`.

Authenticated routes require both the `token` and `sessionToken` HTTP-only cookies.
The role and account are checked on each request; player signup cannot create admins.
Provision an administrator through a trusted database operation by changing an existing
player's `Users.role` to `admin`; never expose role changes through public API input.
SMTP must be configured for club approval. If the approval email cannot be delivered,
the request fails and the club remains pending.

The application synchronizes model changes at startup. Deployments using Sequelize
migrations should also run the role-based authentication migration. Existing club
records that are still pending can receive credentials when an admin approves them.
