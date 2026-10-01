import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(f.email, f.password); nav('/'); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-ink text-ivory flex-col justify-between p-12">
        <div className="font-serif text-3xl tracking-[0.4em]">VÉRANT</div>
        <div><div className="font-serif text-5xl leading-tight">Maison<br />Control Room</div>
          <p className="text-ivory/60 mt-4 text-sm max-w-xs">Products, orders and customers — sab ek jagah se manage karo.</p></div>
        <div className="text-[10px] tracking-[0.35em] text-gold">ADMIN ACCESS ONLY</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-4xl mb-6">Sign in</h1>
          {err && <div className="text-sm bg-red-50 text-red-700 border border-red-200 px-3 py-2">{err}</div>}
          <div><label className="lbl">Email</label><input className="inp" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="lbl">Password</label><input className="inp" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
