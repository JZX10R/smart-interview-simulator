import { useState, useCallback } from "react";
import * as api from "../utils/api";

export function useAuth() {
  const [user, setUser]       = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const register = useCallback(async (name, email, password, role) => {
    try {
      setLoading(true); setError(null);
      const res = await api.register({ name, email, password, role });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      return false;
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true); setError(null);
      const res = await api.login({ email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      return false;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return { user, loading, error, register, login, logout };
}