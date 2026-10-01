import { useEffect, useState } from 'react';
import { api } from '../api';
import { Badge, Loader, Modal, PageHead, Pager, dt, inr, usePaged } from '../components/ui';

const STATUS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAY = ['pending', 'paid', 'failed', 'refunded'];

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const [sel, setSel] = useState(null);

  const load = () => api.orders().then((d) => setOrders(d.orders)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const list = (orders || []).filter((o) =>
    (!st || o.status === st) &&
    (`${o.orderId} ${o.user?.name} ${o.user?.email} ${o.shippingAddress?.name} ${o.shippingAddress?.phone}`).toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(list);
  if (err) return <Loader error={err} />;
  if (!orders) return <Loader />;

  return (
    <>
      <PageHead title="Orders">
        <input className="inp !w-56" placeholder="Search order / customer" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp !w-40" value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">All status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </PageHead>
      <div className="card overflow-x-auto">
        <table className="w-full"><thead><tr>{['Order', 'Date', 'Customer', 'Total', 'Payment', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{pg.rows.map((o) => (
            <tr key={o._id}>
              <td className="td font-medium">{o.orderId}</td><td className="td">{dt(o.createdAt)}</td>
              <td className="td">{o.user?.name || o.shippingAddress?.name}<div className="text-xs text-ink/50">{o.user?.email}</div></td>
              <td className="td">{inr(o.total)}</td>
              <td className="td"><span className="uppercase text-xs mr-2">{o.paymentMethod}</span><Badge v={o.paymentStatus} /></td>
              <td className="td"><Badge v={o.status} /></td>
              <td className="td"><button className="btn btn-ghost !py-1" onClick={() => setSel(o)}>Manage</button></td>
            </tr>))}
            {!pg.rows.length && <tr><td className="td text-center text-ink/50" colSpan={7}>No orders</td></tr>}
          </tbody></table>
        <Pager {...pg} />
      </div>
      {sel && <OrderModal order={sel} onClose={() => setSel(null)} onSaved={() => { setSel(null); load(); }} />}
    </>
  );
}

function OrderModal({ order: o, onClose, onSaved }) {
  const [status, setStatus] = useState(o.status);
  const [paymentStatus, setPay] = useState(o.paymentStatus);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const a = o.shippingAddress || {};
  const save = async () => {
    setBusy(true); setErr('');
    try { await api.updateOrder(o.orderId, { status, paymentStatus }); onSaved(); } catch (e) { setErr(e.message); setBusy(false); }
  };
  return (
    <Modal wide title={`Order ${o.orderId}`} onClose={onClose}>
      <div className="grid md:grid-cols-2 gap-6 text-sm">
        <div><div className="lbl">Ship to</div>{a.name}<br />{a.address}, {a.city}, {a.state} - {a.pin}<br />{a.phone} · {a.email}
          <div className="lbl mt-4">Shipping</div><span className="capitalize">{o.shipMethod}</span>{o.upiId && <> · UPI: {o.upiId}</>}</div>
        <div className="space-y-3">
          <div><label className="lbl">Order status</label><select className="inp" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="lbl">Payment status</label><select className="inp" value={paymentStatus} onChange={(e) => setPay(e.target.value)}>{PAY.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
      </div>
      <table className="w-full mt-6 text-sm"><thead><tr>{['Item', 'Size', 'Color', 'Qty', 'Price'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
        <tbody>{o.items.map((i, k) => <tr key={k}><td className="td">{i.name}</td><td className="td">{i.size}</td><td className="td">{i.color}</td><td className="td">{i.qty}</td><td className="td">{inr(i.price * i.qty)}</td></tr>)}</tbody></table>
      <div className="text-right text-sm mt-3">Subtotal {inr(o.subtotal)} · Shipping {inr(o.shipping)} · <b>Total {inr(o.total)}</b></div>
      {err && <div className="text-sm text-red-700 mt-3">{err}</div>}
      <div className="flex justify-end gap-2 mt-6"><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Update order'}</button></div>
    </Modal>
  );
}
