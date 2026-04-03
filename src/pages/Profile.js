import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { uid } = useParams();
  const { getUserProfile, currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [inviterName, setInviterName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getUserProfile(uid);
      setProfile(p);
      if (p?.invitedBy && p.invitedBy !== 'root') {
        const inv = await getUserProfile(p.invitedBy);
        setInviterName(inv?.displayName || 'Unknown');
      }
      setLoading(false);
    })();
  }, [uid]);

  if (loading) return <div className="page-container" style={{ textAlign:'center' }}>Loading...</div>;
  if (!profile) return <div className="page-container"><h2>Member not found</h2></div>;

  const initials = profile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isOwn = currentUser?.uid === uid;
  const companies = (profile.companies || []).filter(c => typeof c === 'object' && c.name);
  const location = [profile.city, profile.country].filter(Boolean).join(', ');

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar-large">{profile.photoURL ? <img src={profile.photoURL} alt="" /> : initials}</div>
        <div className="profile-info">
          <h1>{profile.displayName}</h1>
          <div className="profile-meta">
            {location && <span>📍 {location}</span>}
            {profile.gender && <span>{profile.gender === 'M' ? '♂' : profile.gender === 'F' ? '♀' : '⚧'} {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : profile.gender}</span>}
            <span>👥 Invited {profile.inviteCount || 0}</span>
          </div>
          <div className="profile-meta" style={{ marginTop: 6 }}>
            {profile.personalLinkedin && (
              <span>💼 <a href={profile.personalLinkedin.startsWith('http') ? profile.personalLinkedin : `https://${profile.personalLinkedin}`} target="_blank" rel="noreferrer" style={{ textDecoration:'underline' }}>LinkedIn</a></span>
            )}
          </div>
          {isOwn && <Link to="/edit-profile" className="btn btn-outline btn-small" style={{ marginTop: 14 }}>Edit Profile</Link>}
        </div>
      </div>

      {profile.bio && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>About</h3>
          <p style={{ color: 'var(--dark-muted)', lineHeight: 1.7, maxWidth: 640 }}>{profile.bio}</p>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>Skills & Expertise</h3>
          <div>{profile.skills.map(s => <span className="tag tag-skill" key={s}>{s}</span>)}</div>
        </div>
      )}

      {profile.hobbies?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>Hobbies & Interests</h3>
          <div>{profile.hobbies.map(h => <span className="tag" key={h}>{h}</span>)}</div>
        </div>
      )}

      {companies.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Companies</h3>
          {companies.map((c, i) => (
            <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6, fontSize: '0.85rem', color: 'var(--dark-muted)' }}>
                {c.field && <span>🏷 {c.field}</span>}
                {c.country && <span>📍 {c.country}</span>}
                {c.website && <span>🌐 <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" style={{ textDecoration:'underline', color:'var(--dark-muted)' }}>{c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></span>}
                {c.linkedin && <span>💼 <a href={c.linkedin.startsWith('http') ? c.linkedin : `https://${c.linkedin}`} target="_blank" rel="noreferrer" style={{ textDecoration:'underline', color:'var(--dark-muted)' }}>LinkedIn</a></span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {inviterName && (
        <div style={{ marginTop: 36, padding: '14px 0', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--dark-muted)' }}>Invited by <strong>{inviterName}</strong></span>
        </div>
      )}
    </div>
  );
}
