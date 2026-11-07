import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "./api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "ledger_user";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  // Keep the signed-in user's name and email so the page can show them after a refresh.
  // The real proof of login is the cookie from your backend; if it expires, any API
  // call returns 401 and we sign the user out below.
  const saveUser = useCallback((nextUser) => {
    setUser(nextUser);
    try {
      if (nextUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be blocked; the app still works for this visit.
    }
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(() => saveUser(null));
  }, [saveUser]);

  async function login(credentials) {
    const data = await api.login(credentials);
    // Login returns user.user_id
    saveUser({ id: data.user.user_id, name: data.user.name, email: data.user.email });
  }

  async function register(details) {
    const data = await api.register(details);
    // Register returns user._id
    saveUser({ id: data.user._id, name: data.user.name, email: data.user.email });
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      // Sign out here even if the server couldn't be reached.
    }
    saveUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
