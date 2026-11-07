// Every call goes to /api/... and Vite forwards it to your Express server
// (see vite.config.js). The login cookie your backend sets is sent back
// automatically, so there is no token handling in the frontend.

let onUnauthorized = () => {};

// AuthContext registers a function here so a 401 from any call signs the user out.
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // The response had no JSON body.
  }

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth/")) onUnauthorized();

    const message =
      data?.message ||
      (res.status >= 500
        ? "The server had a problem. Make sure the backend is running, then try again."
        : `Request failed (${res.status}).`);

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

// ---- Auth: /api/auth ----
export const register = ({ name, email, password }) =>
  request("/auth/register", { method: "POST", body: { name, email, password } });

export const login = ({ email, password }) =>
  request("/auth/login", { method: "POST", body: { email, password } });

export const logout = () => request("/auth/logout", { method: "POST" });

// ---- Accounts: /api/account ----
export const getAccounts = () => request("/account");

export const createAccount = () => request("/account/accounts", { method: "POST" });

export const getBalance = (accountId) => request(`/account/balance/${accountId}`);

// The user's accounts, oldest first, each with a plain name: "Account 1", "Account 2", ...
// The app shows these names instead of IDs, and loads balances only on the About account page.
export async function getNamedAccounts() {
  const { accounts } = await getAccounts();
  return [...accounts]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((account, i) => ({ ...account, name: `Account ${i + 1}` }));
}

// ---- Transactions: /api/transaction ----
export const sendMoney = ({ fromAccount, toAccount, amount, idempotencyKey }) =>
  request("/transaction", {
    method: "POST",
    body: { fromAccount, toAccount, amount, idempotencyKey },
  });
