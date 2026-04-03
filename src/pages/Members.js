import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Members() {
  const { getAllUsers } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState('newest'); // newest, az, za
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterHobby, setFilterHobby] = useState('');

  useEffect(() => { getAllUsers().then(u => { setMembers(u); setLoading(false); }); }, []);

  const getCountry = (m) => m.country || '';
  const getCompanies = (m) => {
    const comps = (m.companies || []).filter(c => typeof c === 'object' && c.name).map(c => c.name);
    if (!comps.length && m.company) return [m.company];
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
  const allHobbies = useMemo(() => {
    const set = new Set();
    members.forEach(m => (m.hobbies || []).forEach(h => set.add(h)));
    return [...set].sort();
  }, [members]);

  const filtered = useMemo(() => {
    let r = [...members];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(m => m.displayName?.toLowerCase().includes(q) || getCountry(m).toLowerCase().includes(q) ||
        getCompanies(m).some(c => c.toLowerCase().includes(q)) || (m.skills || []).some(s => s.toLowerCase().includes(q)) ||
        (m.hobbies || []).some(h => h.toLowerCase().includes(q)));
    }
    if (filterCountry) r = r.filter(m => getCountry(m) === filterCountry);
    if (filterCompany) r = r.filter(m => getCompanies(m).includes(filterCompany));
    if (filterSkill) r = r.filter(m => (m.skills || []).includes(filterSkill));
    if (filterHobby) r = r.filter(m => (m.hobbies || []).includes(filterHobby));

    if (sortMode === 'az') r.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    else if (sortMode === 'za') r.sort((a, b) => (b.displayName || '').localeCompare(a.displayName || ''));
    else {
      // newest first — sort by createdAt descending
      r.sort((a, b) => {
        const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return tb - ta;
      });
    }
    return r;
  }, [members, search, filterCountry, filterCompany, filterSkill, filterHobby, sortMode]);

  const getInitials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : '?';
  const active = [filterCountry, filterCompany, filterSkill, filterHobby].filter(Boolean).length;
  const isFiltered = active > 0 || search || sortMode !== 'newest';
  const clear = () => { setFilterCountry(''); setFilterCompany(''); setFilterSkill(''); setFilterHobby(''); setSortMode('newest'); setSearch(''); };

  const cycleSortMode = () => {
    if (sortMode === 'newest') setSortMode('az');
    else if (sortMode === 'az') setSortMode('za');
    else setSortMode('newest');
  };
  const sortLabel = sortMode === 'az' ? 'A→Z' : sortMode === 'za' ? 'Z→A' : 'Newest';

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  };

  if (loading) return <div className="page-container" style={{ textAlign:'center', padding:'80px 40px' }}>Loading...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Members</h1>
      <p className="page-subtitle">{members.length} entrepreneur{members.length !== 1 ? 's' : ''} in the circle</p>

      {/* Toolbar — single line, centered, full width */}
      <div style={{
        display:'flex', flexWrap:'nowrap', gap:8, marginBottom:24, padding:'12px 14px',
        background:'rgba(255,255,255,0.2)', borderRadius:'var(--radius)', border:'1px solid rgba(0,0,0,0.06)',
        alignItems:'center', justifyContent:'center', width:'100%', overflowX:'auto'
      }}>
        <input type="text" className="form-input" placeholder="Search..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ minWidth:120, maxWidth:170, padding:'9px 12px', fontSize:'0.82rem', flexShrink:1 }} />

        <button className={`btn btn-small ${sortMode !== 'newest' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={cycleSortMode} style={{ whiteSpace:'nowrap', flexShrink:0 }}>
          {sortLabel}
        </button>

        <select className="form-input" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          style={{ minWidth:100, maxWidth:155, padding:'9px 12px', fontSize:'0.82rem', cursor:'pointer', flexShrink:1 }}>
          <option value="">All countries</option>
          {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-input" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
          style={{ minWidth:100, maxWidth:155, padding:'9px 12px', fontSize:'0.82rem', cursor:'pointer', flexShrink:1 }}>
          <option value="">All companies</option>
          {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-input" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          style={{ minWidth:100, maxWidth:140, padding:'9px 12px', fontSize:'0.82rem', cursor:'pointer', flexShrink:1 }}>
          <option value="">All skills</option>
          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="form-input" value={filterHobby} onChange={e => setFilterHobby(e.target.value)}
          style={{ minWidth:100, maxWidth:140, padding:'9px 12px', fontSize:'0.82rem', cursor:'pointer', flexShrink:1 }}>
          <option value="">All interests</option>
          {allHobbies.map(h => <option key={h} value={h}>{h}</option>)}
        </select>

        {isFiltered && <button className="btn btn-small btn-outline" onClick={clear} style={{ whiteSpace:'nowrap', flexShrink:0 }}>Clear</button>}
      </div>

      {(active > 0 || search) && (
        <div style={{ marginBottom:16, fontSize:'0.82rem', color:'var(--dark-muted)' }}>
          Showing {filtered.length} of {members.length}
          {filterCountry && <span> · <strong>{filterCountry}</strong></span>}
          {filterCompany && <span> · <strong>{filterCompany}</strong></span>}
          {filterSkill && <span> · <strong>{filterSkill}</strong></span>}
          {filterHobby && <span> · <strong>{filterHobby}</strong></span>}
        </div>
      )}

      <div className="members-grid">
        {filtered.map(m => {
          const comps = getCompanies(m);
          const loc = [m.city, getCountry(m)].filter(Boolean).join(', ');
          return (
            <Link to={`/profile/${m.uid}`} key={m.uid} style={{ textDecoration:'none' }}>
              <div className="card">
                <div className="member-card-header">
                  <div className="member-avatar">{m.photoURL ? <img src={m.photoURL} alt="" /> : getInitials(m.displayName)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                      <div className="member-name">{m.displayName}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--dark-muted)', flexShrink:0 }}>{formatDate(m.createdAt)}</div>
                    </div>
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
