import { useEffect, useState } from 'react';
import { api } from '../api';
import { Badge, Loader, Modal, PageHead, Pager, inr, usePaged } from '../components/ui';

const CATS = ['Sneakers', 'T-Shirts', 'Shirts', 'Hoodies', 'Jackets', 'Trousers', 'Accessories'];
const empty = { name: '', cat: CATS[0], price: '', mrp: '', stock: 0, badge: '', tagline: '', desc: '', material: '', fit: '', care: '',
  sizes: '', colors: '', images: '', isNewArrival: false, isBest: false, isActive: true };

const toForm = (p) => ({ ...empty, ...p, sizes: (p.sizes || []).join(', '), colors: (p.colors || []).map((c) => `${c.n}:${c.h}`).join(', '), images: (p.images || []).join('\n') });
const toBody = (f) => ({
  name: f.name, cat: f.cat, price: +f.price, mrp: +f.mrp, stock: +f.stock, badge: f.badge, tagline: f.tagline, desc: f.desc,
  material: f.material, fit: f.fit, care: f.care, isNewArrival: f.isNewArrival, isBest: f.isBest, isActive: f.isActive,
  sizes: f.sizes.split(',').map((s) => s.trim()).filter(Boolean),
  colors: f.colors.split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [n, h] = s.split(':'); return { n: n.trim(), h: (h || '#000000').trim() }; }),
  images: f.images.split('\n').map((s) => s.trim()).filter(Boolean),
});

export default function Products() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [edit, setEdit] = useState(null); // null | {} (new) | product

  const load = () => api.products().then((d) => setItems(d.items)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const list = (items || []).filter((p) => (!cat || p.cat === cat) && `${p.name} ${p.cat}`.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(list);
  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api.deleteProduct(p._id); load(); } catch (e) { alert(e.message); }
  };
  if (err) return <Loader error={err} />;
  if (!items) return <Loader />;

  return (
    <>
      <PageHead title="Products">
        <input className="inp !w-52" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp !w-40" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn" onClick={() => setEdit({})}>+ Add product</button>
      </PageHead>
      <div className="card overflow-x-auto">
        <table className="w-full"><thead><tr>{['', 'Name', 'Category', 'Price', 'Stock', 'Flags', ''].map((h, i) => <th key={i} className="th">{h}</th>)}</tr></thead>
          <tbody>{pg.rows.map((p) => (
            <tr key={p._id}>
              <td className="td"><div className="w-10 h-12 bg-ivory border border-line overflow-hidden">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}</div></td>
              <td className="td font-medium">{p.name}<div className="text-xs text-ink/50">#{p.id}</div></td>
              <td className="td">{p.cat}</td>
              <td className="td">{inr(p.price)}<div className="text-xs text-ink/40 line-through">{inr(p.mrp)}</div></td>
              <td className={`td ${p.stock < 10 ? 'text-red-700 font-semibold' : ''}`}>{p.stock}</td>
              <td className="td space-x-1">{p.isBest && <Badge v="best" />}{p.isNewArrival && <Badge v="new" />}</td>
              <td className="td whitespace-nowrap space-x-2">
                <button className="btn btn-ghost !py-1" onClick={() => setEdit(p)}>Edit</button>
                <button className="btn btn-danger !py-1" onClick={() => del(p)}>Delete</button></td>
            </tr>))}
            {!pg.rows.length && <tr><td className="td text-center text-ink/50" colSpan={7}>No products</td></tr>}</tbody></table>
        <Pager {...pg} />
      </div>
      {edit && <ProductModal product={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}

function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product._id;
  const [f, setF] = useState(toForm(product));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { isEdit ? await api.updateProduct(product._id, toBody(f)) : await api.createProduct(toBody(f)); onSaved(); }
    catch (x) { setErr(x.message); setBusy(false); }
  };
  const T = (k, label, props = {}) => <div><label className="lbl">{label}</label><input className="inp" value={f[k]} onChange={set(k)} {...props} /></div>;
  return (
    <Modal wide title={isEdit ? 'Edit product' : 'New product'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {T('name', 'Name', { required: true })}
          <div><label className="lbl">Category</label><select className="inp" value={f.cat} onChange={set('cat')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
          {T('price', 'Price (₹)', { type: 'number', min: 0, required: true })}
          {T('mrp', 'MRP (₹)', { type: 'number', min: 0, required: true })}
          {T('stock', 'Stock', { type: 'number', min: 0 })}
          {T('badge', 'Badge (BESTSELLER / NEW / LIMITED)')}
          {T('material', 'Material')}{T('fit', 'Fit')}
        </div>
        {T('tagline', 'Tagline')}
        <div><label className="lbl">Description</label><textarea rows={3} className="inp" value={f.desc} onChange={set('desc')} /></div>
        {T('care', 'Care instructions')}
        {T('sizes', 'Sizes (comma separated: S, M, L)')}
        {T('colors', 'Colors (name:#hex, comma separated — Deep Emerald:#0B3D2E, Black:#000000)')}
        <div><label className="lbl">Image URLs (one per line)</label><textarea rows={3} className="inp" value={f.images} onChange={set('images')} /></div>
        <div className="flex gap-6 text-sm">
          {[['isNewArrival', 'New arrival'], ['isBest', 'Bestseller'], ['isActive', 'Active (visible in store)']].map(([k, l]) =>
            <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={f[k]} onChange={set(k)} />{l}</label>)}
        </div>
        {err && <div className="text-sm text-red-700">{err}</div>}
        <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div>
      </form>
    </Modal>
  );
}
