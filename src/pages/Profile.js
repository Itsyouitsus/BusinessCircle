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
    loadProfile();
  }, [uid]);

  const loadProfile = async () => {
    const p = await getUserProfile(uid);
    setProfile(p);
    if (p?.invitedBy) {
      const inviter = await getUserProfile(p.invitedBy);
      setInviterName(inviter?.displayName || 'Unknown');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center' }}>Loading...</div>;
  }

  if (!profile) {
    return <div className="page-container"><h2>Member not found</h2></div>;
  }

  const initials = profile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isOwnProfile = currentUser?.uid === uid;

  return (
    <div className="page-container">
      <div className="profile-header">
        <div className="profile-avatar-large">{initials}</div>
        <div className="profile-info">
          <h1>{profile.displayName}</h1>
          <div className="profile-meta">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.company && <span>🏢 {profile.company}</span>}
            {profile.website && (
              <span>
                🌐 <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: 'var(--gold-dark)', textDecoration: 'underline' }}>
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </span>
            )}
            <span>👥 Invited {profile.inviteCount || 0} member{(profile.inviteCount || 0) !== 1 ? 's' : ''}</span>
          </div>
          {isOwnProfile && (
            <Link to="/edit-profile" className="btn btn-outline btn-small" style={{ marginTop: 16 }}>
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {profile.bio && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 8, fontFamily: 'var(--font-body)', fontWeight: 600 }}>About</h3>
          <p style={{ color: 'var(--gray-500)', lineHeight: 1.7, maxWidth: 640 }}>{profile.bio}</p>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 10, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Skills & Expertise
          </h3>
          <div>
            {profile.skills.map(s => <span className="tag tag-gold" key={s}>{s}</span>)}
          </div>
        </div>
      )}

      {profile.needsHelpWith?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 10, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            Looking for Help With
          </h3>
          <div>
            {profile.needsHelpWith.map(s => <span className="tag tag-dark" key={s}>{s}</span>)}
          </div>
        </div>
      )}

      {inviterName && (
        <div style={{ marginTop: 40, padding: '16px 0', borderTop: '1px solid var(--gray-200)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
            Invited by <strong style={{ color: 'var(--gray-500)' }}>{inviterName}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
