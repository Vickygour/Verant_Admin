import { useEffect, useState } from 'react';
import { api } from '../api';
import { Badge, Loader, PageHead, Pager, dt, usePaged } from '../components/ui';

export default function Users() {
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  useEffect(() => { api.users().then((d) => setUsers(d.users)).catch((e) => setErr(e.message)); }, []);
  const list = (users || []).filter((u) => (!role || u.role === role) && `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));
  const pg = usePaged(list);
  if (err) return <Loader error={err} />;
  if (!users) return <Loader />;
  return (
    <>
      <PageHead title="Customers">
        <input className="inp !w-56" placeholder="Search name / email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="inp !w-32" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option><option>user</option><option>admin</option></select>
      </PageHead>
      <div className="card overflow-x-auto">
        <table className="w-full"><thead><tr>{['Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{pg.rows.map((u) => (
            <tr key={u._id}><td className="td font-medium">{u.name}</td><td className="td">{u.email}</td><td className="td">{u.phone || '—'}</td>
              <td className="td"><Badge v={u.role} /></td><td className="td">{u.isVerified ? '✓' : '—'}</td><td className="td">{dt(u.createdAt)}</td></tr>))}
            {!pg.rows.length && <tr><td className="td text-center text-ink/50" colSpan={6}>No users</td></tr>}</tbody></table>
        <Pager {...pg} />
      </div>
    </>
  );
}
