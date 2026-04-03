import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Members() {
  const { getAllUsers } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const users = await getAllUsers();
    setMembers(users);
    setLoading(false);
  };

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (
      m.displayName?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.location?.toLowerCase().includes(q) ||
      m.skills?.some(s => s.toLowerCase().includes(q)) ||
      m.needsHelpWith?.some(s => s.toLowerCase().includes(q))
    );
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 40px' }}>
        Loading members...
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Members</h1>
      <p className="page-subtitle">
        {members.length} entrepreneur{members.length !== 1 ? 's' : ''} in the circle
      </p>

      <div style={{ marginBottom: 32 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by name, skill, location, or what they need help with..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 500 }}
        />
      </div>

      <div className="members-grid">
        {filtered.map(member => (
          <Link
            to={`/profile/${member.uid}`}
            key={member.uid}
            style={{ textDecoration: 'none' }}
          >
            <div className="card member-card">
              <div className="member-card-header">
                <div className="member-avatar">{getInitials(member.displayName)}</div>
                <div>
                  <div className="member-name">{member.displayName}</div>
                  {member.location && (
                    <div className="member-location">📍 {member.location}</div>
                  )}
                </div>
              </div>

              {member.company && (
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 8 }}>
                  {member.company}
                </div>
              )}

              {member.bio && (
                <div className="member-bio">
                  {member.bio.length > 120 ? member.bio.slice(0, 120) + '...' : member.bio}
                </div>
              )}

              {member.skills?.length > 0 && (
                <>
                  <div className="member-section-label">Skills</div>
                  <div>
                    {member.skills.slice(0, 5).map(s => (
                      <span className="tag tag-gold" key={s}>{s}</span>
                    ))}
                    {member.skills.length > 5 && (
                      <span className="tag">+{member.skills.length - 5}</span>
                    )}
                  </div>
                </>
              )}

              {member.needsHelpWith?.length > 0 && (
                <>
                  <div className="member-section-label">Needs help with</div>
                  <div>
                    {member.needsHelpWith.slice(0, 3).map(s => (
                      <span className="tag tag-dark" key={s}>{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
          No members found matching "{search}"
        </div>
      )}
    </div>
  );
}
