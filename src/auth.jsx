import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken } from './api';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then((d) => setUser(d.user.role === 'admin' ? d.user : null))
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const d = await api.login({ email, password });
    if (d.user.role !== 'admin') throw new Error('Access denied: admin account required.');
    localStorage.setItem('admin_token', d.token);
    setUser(d.user);
  };
  const logout = () => { localStorage.removeItem('admin_token'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
