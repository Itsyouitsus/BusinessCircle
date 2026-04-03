import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Members() {
  const { getAllUsers } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortAZ, setSortAZ] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => { getAllUsers().then(u => { setMembers(u); setLoading(false); }); }, []);

  const getCountry = (m) => m.country || (m.locations?.[0]) || m.location || '';
  const getCity = (m) => m.city || '';
  const getCompanies = (m) => {
    const comps = (m.companies || []).filter(c => typeof c === 'object' && c.name).map(c => c.name);
    if (comps.length === 0 && m.company) return [m.company];
    return comps;
  };

  const allCountries = useMemo(() => [...new Set(members.map(getCountry).filter(Boolean))].sort(), [members]);
  const allCompanies = useMemo(() => {
    const set = new Set();
    members.forEach(m => getCompanies(m).forEach(c => set.add(c)));
    return [...set].sort();
  }, [members]);
  const allSkills = useMemo(() => {
    const set = new Set();
    members.forEach(m => (m.skills || []).forEach(s => set.add(s)));
    return [...set].sort();
  }, [members]);

  const filtered = useMemo(() => {
    let r = [...members];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(m => m.displayName?.toLowerCase().includes(q) || getCountry(m).toLowerCase().includes(q) ||
        getCompanies(m).some(c => c.toLowerCase().includes(q)) || (m.skills || []).some(s => s.toLowerCase().includes(q)));
    }
    if (filterCountry) r = r.filter(m => getCountry(m) === filterCountry);
    if (filterCompany) r = r.filter(m => getCompanies(m).includes(filterCompany));
    if (filterSkill) r = r.filter(m => (m.skills || []).includes(filterSkill));
    if (sortAZ) r.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    return r;
  }, [members, search, filterCountry, filterCompany, filterSkill, sortAZ]);

  const getInitials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : '?';
  const active = [filterCountry, filterCompany, filterSkill].filter(Boolean).length;
  const clear = () => { setFilterCountry(''); setFilterCompany(''); setFilterSkill(''); setSortAZ(false); setSearch(''); };

  if (loading) return <div className="page-container" style={{ textAlign:'center', padding:'80px 40px' }}>Loading...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Members</h1>
      <p className="page-subtitle">{members.length} entrepreneur{members.length !== 1 ? 's' : ''} in the circle</p>

      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:24, padding:16,
        background:'rgba(255,255,255,0.2)', borderRadius:'var(--radius)', border:'1px solid rgba(0,0,0,0.06)', alignItems:'center' }}>
        <input type="text" className="form-input" placeholder="Search..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth:200, padding:'10px 14px', fontSize:'0.85rem' }} />
        <button className={`btn btn-small ${sortAZ ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSortAZ(!sortAZ)}>A→Z {sortAZ ? '✓' : ''}</button>
        <select className="form-input" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          style={{ maxWidth:180, padding:'10px 14px', fontSize:'0.85rem', cursor:'pointer' }}>
          <option value="">All countries</option>
          {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-input" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
          style={{ maxWidth:180, padding:'10px 14px', fontSize:'0.85rem', cursor:'pointer' }}>
          <option value="">All companies</option>
          {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-input" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          style={{ maxWidth:180, padding:'10px 14px', fontSize:'0.85rem', cursor:'pointer' }}>
          <option value="">All skills</option>
          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(active > 0 || sortAZ || search) && <button className="btn btn-small btn-outline" onClick={clear}>Clear all</button>}
      </div>

      {(active > 0 || search) && (
        <div style={{ marginBottom:16, fontSize:'0.85rem', color:'var(--dark-muted)' }}>
          Showing {filtered.length} of {members.length} members
          {filterCountry && <span> · Country: <strong>{filterCountry}</strong></span>}
          {filterCompany && <span> · Company: <strong>{filterCompany}</strong></span>}
          {filterSkill && <span> · Skill: <strong>{filterSkill}</strong></span>}
        </div>
      )}

      <div className="members-grid">
        {filtered.map(m => {
          const comps = getCompanies(m);
          const loc = [getCity(m), getCountry(m)].filter(Boolean).join(', ');
          return (
            <Link to={`/profile/${m.uid}`} key={m.uid} style={{ textDecoration:'none' }}>
              <div className="card">
                <div className="member-card-header">
                  <div className="member-avatar">{m.photoURL ? <img src={m.photoURL} alt="" /> : getInitials(m.displayName)}</div>
                  <div>
                    <div className="member-name">{m.displayName}</div>
                    {loc && <div className="member-location">📍 {loc}</div>}
                  </div>
                </div>
                {comps[0] && <div style={{ fontSize:'0.82rem', color:'var(--dark-muted)', marginBottom:8 }}>{comps.join(' · ')}</div>}
                {m.bio && <div className="member-bio">{m.bio.length > 100 ? m.bio.slice(0, 100) + '...' : m.bio}</div>}
                {m.skills?.length > 0 && (
                  <><div className="member-section-label">Skills</div>
                  <div>{m.skills.slice(0, 5).map(s => <span className="tag tag-skill" key={s}>{s}</span>)}
                    {m.skills.length > 5 && <span className="tag">+{m.skills.length - 5}</span>}</div></>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={{ textAlign:'center', padding:'60px 0', color:'var(--dark-muted)' }}>No members found. {active > 0 && <button onClick={clear} style={{ background:'none', border:'none', color:'var(--dark-text)', textDecoration:'underline', cursor:'pointer', fontFamily:'var(--font-body)' }}>Clear filters</button>}</div>}
    </div>
  );
}
