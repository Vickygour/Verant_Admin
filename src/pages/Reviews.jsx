import { useEffect, useState } from 'react';
import { api } from '../api';
import { Loader, PageHead, dt } from '../components/ui';

export default function Reviews() {
  const [products, setProducts] = useState(null);
  const [pid, setPid] = useState('');
  const [reviews, setReviews] = useState([]);
  const [err, setErr] = useState('');
  useEffect(() => { api.products().then((d) => setProducts(d.items)).catch((e) => setErr(e.message)); }, []);
  const load = (id) => api.reviews(id).then((d) => setReviews(d.reviews)).catch((e) => setErr(e.message));
  useEffect(() => { if (pid) load(pid); else setReviews([]); }, [pid]);
  const del = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { await api.deleteReview(id); load(pid); } catch (e) { setErr(e.message); }
  };
  if (!products) return <Loader error={err} />;
  return (
    <>
      <PageHead title="Reviews">
        <select className="inp !w-72" value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="">Select a product…</option>{products.map((p) => <option key={p._id} value={p.id}>{p.name}</option>)}
        </select>
      </PageHead>
      {err && <div className="text-sm text-red-700 mb-3">{err}</div>}
      <div className="space-y-3">
        {pid && !reviews.length && <div className="card p-6 text-sm text-ink/50">No reviews for this product.</div>}
        {reviews.map((r) => (
          <div key={r._id} className="card p-5 flex justify-between gap-4">
            <div><div className="text-gold">{'★'.repeat(r.rating)}<span className="text-line">{'★'.repeat(5 - r.rating)}</span></div>
              <div className="font-medium mt-1">{r.title}</div><p className="text-sm text-ink/70 mt-1">{r.comment}</p>
              <div className="text-xs text-ink/50 mt-2">{r.author} · {dt(r.createdAt)} · 👍 {r.likes}</div></div>
            <button className="btn btn-danger self-start" onClick={() => del(r._id)}>Delete</button>
          </div>))}
      </div>
    </>
  );
}
