import { useEffect, useState } from 'react';
import { api } from '../api';
import { Badge, Loader, PageHead, inr, dt } from '../components/ui';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([api.orders(), api.products(), api.users()])
      .then(([o, p, u]) => setD({ orders: o.orders, products: p.items, users: u.users }))
      .catch((e) => setErr(e.message));
  }, []);
  if (err) return <Loader error={err} />;
  if (!d) return <Loader />;

  const { orders, products, users } = d;
  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const byStatus = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => [s, orders.filter((o) => o.status === s).length]);
  const max = Math.max(1, ...byStatus.map((x) => x[1]));
  const low = products.filter((p) => p.stock < 10).sort((a, b) => a.stock - b.stock).slice(0, 6);
  const stats = [['Revenue', inr(revenue)], ['Orders', orders.length], ['Products', products.length], ['Customers', users.filter((u) => u.role === 'user').length]];

  return (
    <>
      <PageHead title="Dashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(([l, v]) => (
          <div key={l} className="card p-5 border-t-2 border-t-gold"><div className="lbl">{l}</div><div className="font-serif text-4xl">{v}</div></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="lbl mb-4">Orders by status</div>
          {byStatus.map(([s, n]) => (
            <div key={s} className="mb-3"><div className="flex justify-between text-xs mb-1 capitalize"><span>{s}</span><span>{n}</span></div>
              <div className="h-2 bg-ivory"><div className="h-2 bg-gold" style={{ width: `${(n / max) * 100}%` }} /></div></div>
          ))}
        </div>
        <div className="card p-5">
          <div className="lbl mb-4">Low stock (&lt; 10)</div>
          {low.length === 0 && <div className="text-sm text-ink/50">All good ✓</div>}
          {low.map((p) => <div key={p._id} className="flex justify-between text-sm py-2 border-b border-line/60"><span className="truncate pr-2">{p.name}</span><b className={p.stock === 0 ? 'text-red-700' : ''}>{p.stock}</b></div>)}
        </div>
        <div className="card p-5">
          <div className="lbl mb-4">Recent orders</div>
          {orders.slice(0, 6).map((o) => (
            <div key={o._id || o.orderId} className="flex justify-between items-center text-sm py-2 border-b border-line/60">
              <div><div className="font-medium">{o.orderId}</div><div className="text-xs text-ink/50">{dt(o.createdAt)}</div></div>
              <div className="text-right"><div>{inr(o.total)}</div><Badge v={o.status} /></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
