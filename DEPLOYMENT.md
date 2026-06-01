# Deployment Notes

This repository is prepared as a monorepo:

- `backend/` - Node.js/Express API
- `frontend/` - Angular application
- `database/` - PostgreSQL migrations and setup scripts

## GitHub

Create an empty GitHub repository, then connect this local repository:

```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

The CI workflow in `.github/workflows/ci.yml` builds both the backend and frontend on pushes and pull requests to `main`.

## Later Backend Auto-Install

When the server is ready, add a deployment workflow that runs after CI succeeds. The usual setup is:

1. Add GitHub repository secrets:
   - `SERVER_HOST`
   - `SERVER_USER`
   - `SERVER_SSH_KEY`
   - `SERVER_APP_DIR`
2. On the server, install:
   - Node.js 20
   - PostgreSQL or access to a managed PostgreSQL instance
   - A process manager such as `pm2` or a `systemd` service
3. The deploy job should SSH to the server and run:

```bash
cd "$SERVER_APP_DIR"
git pull --ff-only
cd backend
npm ci --omit=dev
npm run build
pm2 restart service-report-backend || pm2 start dist/index.js --name service-report-backend
```

Keep production values in server environment variables or GitHub secrets. Do not commit `.env` files.
