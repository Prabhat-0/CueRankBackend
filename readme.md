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
