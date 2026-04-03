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
  const [groupBy, setGroupBy] = useState('none');

  useEffect(() => { getAllUsers().then(u => { setMembers(u); setLoading(false); }); }, []);

  // Extract all unique values for dropdowns
  const allCountries = useMemo(() => {
    const set = new Set();
    members.forEach(m => {
      (m.locations || []).forEach(l => l && set.add(l.trim()));
      if (m.location) set.add(m.location.trim());
    });
    return [...set].sort();
  }, [members]);

  const allCompanies = useMemo(() => {
    const set = new Set();
    members.forEach(m => {
      (m.companies || []).forEach(c => c && set.add(c.trim()));
      if (m.company) set.add(m.company.trim());
    });
    return [...set].sort();
  }, [members]);

  const allSkills = useMemo(() => {
    const set = new Set();
    members.forEach(m => (m.skills || []).forEach(s => s && set.add(s.trim())));
    return [...set].sort();
  }, [members]);

  // Helpers
  const getMemberLocations = (m) => {
    const locs = m.locations?.length ? m.locations : (m.location ? [m.location] : []);
    return locs.filter(Boolean).map(l => l.trim());
  };
  const getMemberCompanies = (m) => {
    const comps = m.companies?.length ? m.companies : (m.company ? [m.company] : []);
    return comps.filter(Boolean).map(c => c.trim());
  };

  // Filter
  const filtered = useMemo(() => {
    let result = [...members];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.displayName?.toLowerCase().includes(q) ||
        getMemberLocations(m).some(l => l.toLowerCase().includes(q)) ||
        getMemberCompanies(m).some(c => c.toLowerCase().includes(q)) ||
        (m.skills || []).some(s => s.toLowerCase().includes(q))
      );
    }

    if (filterCountry) {
      result = result.filter(m => getMemberLocations(m).some(l => l === filterCountry));
    }
    if (filterCompany) {
      result = result.filter(m => getMemberCompanies(m).some(c => c === filterCompany));
    }
    if (filterSkill) {
      result = result.filter(m => (m.skills || []).some(s => s === filterSkill));
    }

    if (sortAZ) {
      result.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }

    return result;
  }, [members, search, filterCountry, filterCompany, filterSkill, sortAZ]);

  // Group
  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups = {};
    filtered.forEach(m => {
      let keys = [];
      if (groupBy === 'country') keys = getMemberLocations(m);
      else if (groupBy === 'company') keys = getMemberCompanies(m);
      else if (groupBy === 'skill') keys = (m.skills || []).filter(Boolean);

      if (keys.length === 0) keys = ['Other'];
      keys.forEach(k => {
        if (!groups[k]) groups[k] = [];
        if (!groups[k].find(x => x.uid === m.uid)) groups[k].push(m);
      });
    });

    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupBy]);

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const activeFilters = [filterCountry, filterCompany, filterSkill].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCountry(''); setFilterCompany(''); setFilterSkill('');
    setGroupBy('none'); setSortAZ(false); setSearch('');
  };

  const MemberCard = ({ member }) => {
    const companies = getMemberCompanies(member);
    const locations = getMemberLocations(member);
    return (
      <Link to={`/profile/${member.uid}`} style={{ textDecoration: 'none' }}>
        <div className="card">
          <div className="member-card-header">
            <div className="member-avatar">
              {member.photoURL ? <img src={member.photoURL} alt="" /> : getInitials(member.displayName)}
            </div>
            <div>
              <div className="member-name">{member.displayName}</div>
              {locations[0] && <div className="member-location">📍 {locations.join(' · ')}</div>}
            </div>
          </div>
          {companies[0] && <div style={{ fontSize: '0.82rem', color: 'var(--dark-muted)', marginBottom: 8 }}>{companies.join(' · ')}</div>}
          {member.bio && <div className="member-bio">{member.bio.length > 100 ? member.bio.slice(0, 100) + '...' : member.bio}</div>}
          {member.skills?.length > 0 && (
            <>
              <div className="member-section-label">Skills</div>
              <div>
                {member.skills.slice(0, 5).map(s => <span className="tag tag-skill" key={s}>{s}</span>)}
                {member.skills.length > 5 && <span className="tag">+{member.skills.length - 5}</span>}
              </div>
            </>
          )}
        </div>
      </Link>
    );
  };

  if (loading) return <div className="page-container" style={{ textAlign: 'center', padding: '80px 40px' }}>Loading members...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Members</h1>
      <p className="page-subtitle">{members.length} entrepreneur{members.length !== 1 ? 's' : ''} in the circle</p>

      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24,
        padding: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius)',
        border: '1px solid rgba(0,0,0,0.06)', alignItems: 'center'
      }}>
        {/* Search */}
        <input type="text" className="form-input" placeholder="Search..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 200, padding: '10px 14px', fontSize: '0.85rem' }} />

        {/* Sort A-Z */}
        <button className={`btn btn-small ${sortAZ ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSortAZ(!sortAZ)} style={{ whiteSpace: 'nowrap' }}>
          A→Z {sortAZ ? '✓' : ''}
        </button>

        {/* Country filter */}
        <select className="form-input" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          style={{ maxWidth: 180, padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <option value="">All locations</option>
          {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Company filter */}
        <select className="form-input" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
          style={{ maxWidth: 180, padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <option value="">All companies</option>
          {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Skill filter */}
        <select className="form-input" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
          style={{ maxWidth: 180, padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <option value="">All skills</option>
          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Group by */}
        <select className="form-input" value={groupBy} onChange={e => setGroupBy(e.target.value)}
          style={{ maxWidth: 170, padding: '10px 14px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <option value="none">No grouping</option>
          <option value="country">Group by location</option>
          <option value="company">Group by company</option>
          <option value="skill">Group by skill</option>
        </select>

        {/* Clear */}
        {(activeFilters > 0 || sortAZ || groupBy !== 'none' || search) && (
          <button className="btn btn-small btn-outline" onClick={clearFilters}>Clear all</button>
        )}
      </div>

      {/* Results count */}
      {(activeFilters > 0 || search) && (
        <div style={{ marginBottom: 16, fontSize: '0.85rem', color: 'var(--dark-muted)' }}>
          Showing {filtered.length} of {members.length} members
          {filterCountry && <span> · Location: <strong>{filterCountry}</strong></span>}
          {filterCompany && <span> · Company: <strong>{filterCompany}</strong></span>}
          {filterSkill && <span> · Skill: <strong>{filterSkill}</strong></span>}
        </div>
      )}

      {/* Grouped view */}
      {grouped ? (
        grouped.map(([groupName, groupMembers]) => (
          <div key={groupName} style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12,
              paddingBottom: 8, borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
              {groupName} <span style={{ fontWeight: 400, opacity: 0.5 }}>({groupMembers.length})</span>
            </h3>
            <div className="members-grid">
              {groupMembers.map(member => <MemberCard key={member.uid} member={member} />)}
            </div>
          </div>
        ))
      ) : (
        /* Flat view */
        <div className="members-grid">
          {filtered.map(member => <MemberCard key={member.uid} member={member} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--dark-muted)' }}>
          No members found{search && ` matching "${search}"`}. {activeFilters > 0 && <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--dark-text)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Clear filters</button>}
        </div>
      )}
    </div>
  );
}
