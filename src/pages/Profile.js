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
        const inviter = await getUserProfile(p.invitedBy);
        setInviterName(inviter?.displayName || 'Unknown');
      }
      setLoading(false);
    })();
  }, [uid]);

  if (loading) return <div className="page-container" style={{ textAlign:'center' }}>Loading...</div>;
  if (!profile) return <div className="page-container"><h2>Member not found</h2></div>;

  const initials = profile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isOwnProfile = currentUser?.uid === uid;
  const companies = profile.companies?.length ? profile.companies : (profile.company ? [profile.company] : []);
  const locations = profile.locations?.length ? profile.locations : (profile.location ? [profile.location] : []);
  const websites = profile.websites?.length ? profile.websites : (profile.website ? [profile.website] : []);
  const linkedins = profile.linkedins || [];

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profile.photoURL ? <img src={profile.photoURL} alt="" /> : initials}
        </div>
        <div className="profile-info">
          <h1>{profile.displayName}</h1>
          <div className="profile-meta">
            {locations.map((l, i) => l && <span key={i}>📍 {l}</span>)}
            {companies.map((c, i) => c && <span key={i}>🏢 {c}</span>)}
            <span>👥 Invited {profile.inviteCount || 0} member{(profile.inviteCount || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="profile-meta" style={{ marginTop:6 }}>
            {websites.map((w, i) => w && (
              <span key={i}>🌐 <a href={w.startsWith('http') ? w : `https://${w}`} target="_blank" rel="noreferrer" style={{ textDecoration:'underline' }}>
                {w.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a></span>
            ))}
            {linkedins.map((l, i) => l && (
              <span key={i}>💼 <a href={l.startsWith('http') ? l : `https://${l}`} target="_blank" rel="noreferrer" style={{ textDecoration:'underline' }}>
                LinkedIn
              </a></span>
            ))}
          </div>
          {isOwnProfile && (
            <Link to="/edit-profile" className="btn btn-outline btn-small" style={{ marginTop:14 }}>Edit Profile</Link>
          )}
        </div>
      </div>

      {profile.bio && (
        <div style={{ marginBottom:28 }}>
          <h3 style={{ fontSize:'1rem', marginBottom:8, fontWeight:700 }}>About</h3>
          <p style={{ color:'var(--dark-muted)', lineHeight:1.7, maxWidth:640 }}>{profile.bio}</p>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <h3 style={{ fontSize:'1rem', marginBottom:10, fontWeight:700 }}>Skills & Expertise</h3>
          <div>{profile.skills.map(s => <span className="tag tag-skill" key={s}>{s}</span>)}</div>
        </div>
      )}

      {inviterName && (
        <div style={{ marginTop:36, padding:'14px 0', borderTop:'1px solid rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize:'0.82rem', color:'var(--dark-muted)' }}>
            Invited by <strong>{inviterName}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
