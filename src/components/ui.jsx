import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

const NAV = [['/', 'Dashboard'], ['/products', 'Products'], ['/orders', 'Orders'], ['/users', 'Customers'], ['/reviews', 'Reviews']];

export function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:flex">
      <aside className={`${open ? 'block' : 'hidden'} md:block md:w-60 bg-ink text-ivory md:min-h-screen shrink-0`}>
        <div className="px-6 py-7 border-b border-white/10">
          <div className="font-serif text-2xl tracking-[0.3em]">VÉRANT</div>
          <div className="text-[10px] tracking-[0.35em] text-gold mt-1">ADMIN · MAISON</div>
        </div>
        <nav className="py-4">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-6 py-3 text-sm tracking-wide border-l-2 ${isActive ? 'border-gold text-gold bg-white/5' : 'border-transparent text-ivory/70 hover:text-ivory'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-ivory/60">
          <div className="truncate">{user?.email}</div>
          <button onClick={() => { logout(); nav('/login'); }} className="mt-2 text-gold hover:underline">Sign out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between bg-ink text-ivory px-4 py-3">
          <span className="font-serif tracking-[0.3em]">VÉRANT</span>
          <button onClick={() => setOpen(!open)} className="text-sm">☰ Menu</button>
        </div>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}

export const PageHead = ({ title, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
    <h1 className="font-serif text-3xl">{title}</h1><div className="flex gap-2 flex-wrap">{children}</div>
  </div>
);

const COLORS = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800', paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800', refunded: 'bg-gray-200 text-gray-700', admin: 'bg-gold/20 text-gold', user: 'bg-gray-100 text-gray-700' };
export const Badge = ({ v }) => <span className={`px-2 py-0.5 text-[11px] uppercase tracking-wider ${COLORS[v] || 'bg-gray-100'}`}>{String(v)}</span>;

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const h = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4" onMouseDown={onClose}>
      <div className={`bg-ivory w-full ${wide ? 'max-w-3xl' : 'max-w-md'} my-8`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-line">
          <h2 className="font-serif text-2xl">{title}</h2><button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export const Loader = ({ error }) => <div className={`p-10 text-center text-sm ${error ? 'text-red-700' : 'text-ink/50'}`}>{error || 'Loading…'}</div>;

export function usePaged(items, size = 10) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / size));
  useEffect(() => { if (page > pages) setPage(1); }, [items.length, pages, page]);
  return { rows: items.slice((page - 1) * size, page * size), page, pages, setPage, total: items.length };
}

export const Pager = ({ page, pages, setPage, total }) => (
  <div className="flex items-center justify-between px-4 py-3 text-xs text-ink/60">
    <span>{total} records</span>
    <div className="flex items-center gap-2">
      <button className="btn btn-ghost !py-1" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
      <span>{page} / {pages}</span>
      <button className="btn btn-ghost !py-1" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </div>
  </div>
);

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const dt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
