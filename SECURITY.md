# Security Notes

## Reporting a Vulnerability

If you find a security issue, please avoid posting working exploit details in a public issue.
Use GitHub Security Advisories or contact the maintainers privately first.

## Secret Handling

- Never commit `.env` files, database credentials, API tokens, or private keys.
- Use `passcheck-backend/.env.example` and `passcheck-frontend/.env.example` as templates.
- Do not put shared secrets in frontend code. Browser code is public by definition.

## Transport Security

Passwords sent to the backend should rely on HTTPS/TLS in transit.
Do not add a client-side "encryption secret" to simulate extra protection.

## Rotation

If any real credential was previously committed to this repository or copied into a deployment platform:

1. Rotate it in the provider immediately.
2. Update the deployment environment with the new value.
3. Invalidate the old credential.
