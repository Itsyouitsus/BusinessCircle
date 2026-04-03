import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Members() {
  const { getAllUsers } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAllUsers().then(u => { setMembers(u); setLoading(false); }); }, []);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return m.displayName?.toLowerCase().includes(q) ||
      (m.companies || []).some(c => c.toLowerCase().includes(q)) ||
      (m.locations || []).some(l => l.toLowerCase().includes(q)) ||
      (m.skills || []).some(s => s.toLowerCase().includes(q)) ||
      m.company?.toLowerCase().includes(q) || m.location?.toLowerCase().includes(q);
  });

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) return <div className="page-container" style={{ textAlign:'center', padding:'80px 40px' }}>Loading members...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Members</h1>
      <p className="page-subtitle">{members.length} entrepreneur{members.length !== 1 ? 's' : ''} in the circle</p>
      <div style={{ marginBottom:28 }}>
        <input type="text" className="form-input" placeholder="Search by name, skill, location, company..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:480 }} />
      </div>
      <div className="members-grid">
        {filtered.map(member => {
          const companies = member.companies?.length ? member.companies : (member.company ? [member.company] : []);
          const locations = member.locations?.length ? member.locations : (member.location ? [member.location] : []);
          return (
            <Link to={`/profile/${member.uid}`} key={member.uid} style={{ textDecoration:'none' }}>
              <div className="card">
                <div className="member-card-header">
                  <div className="member-avatar">
                    {member.photoURL ? <img src={member.photoURL} alt="" /> : getInitials(member.displayName)}
                  </div>
                  <div>
                    <div className="member-name">{member.displayName}</div>
                    {locations[0] && <div className="member-location">📍 {locations[0]}</div>}
                  </div>
                </div>
                {companies[0] && <div style={{ fontSize:'0.82rem', color:'var(--dark-muted)', marginBottom:8 }}>{companies.join(' · ')}</div>}
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
        })}
      </div>
      {filtered.length === 0 && <div style={{ textAlign:'center', padding:'60px 0', color:'var(--dark-muted)' }}>No members found matching "{search}"</div>}
    </div>
  );
}
