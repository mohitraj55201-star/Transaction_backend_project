# Ledger frontend (React + Vite)

Needs Node 20.19 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. Your Express backend must be running on port 3000
(`node server.js` from the project root).

Requests to `/api/...` are forwarded to `http://localhost:3000` by `vite.config.js`.
If your backend uses another port, change the `target` there.

## Where things are

- `src/api.js` – every call to your backend, in one place
- `src/AuthContext.jsx` – sign in, sign up, sign out
- `src/pages/` – Login, Register, Dashboard (account list), AccountDetails (About account), SendMoney
- `src/index.css` – all styling. The colors are at the top, in `:root`.
