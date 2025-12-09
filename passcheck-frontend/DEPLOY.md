# Hướng dẫn Deploy Frontend

## Environment Variables

Khi deploy frontend, cần set biến môi trường sau:

```
VITE_API_URL=https://passcheck-backend.fly.dev
```

## Domino Deployment

1. Vào Domino dashboard
2. Settings → Environment Variables
3. Add variable:
   - Key: `VITE_API_URL`
   - Value: `https://passcheck-backend.fly.dev`
4. Rebuild và deploy lại

## Build Command

```bash
npm run build
```

Biến môi trường `VITE_API_URL` sẽ được inject vào build tại build time.

