import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function MyInvites() {
  const { currentUser, createInvite, getAllInvites, getAllUsers } = useAuth();
  const [invites, setInvites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allInvites, allUsers] = await Promise.all([getAllInvites(), getAllUsers()]);
    // Filter to only my invites
    const myInvites = allInvites.filter(i => i.createdBy === currentUser.uid);
    setInvites(myInvites);
    setUsers(allUsers);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await createInvite(currentUser.uid);
    await loadData();
    setGenerating(false);
  };

  const getInviteLink = (code) => {
    const base = window.location.origin + window.location.pathname.replace(/\/$/, '');
    return `${base}/#/signup/${code}`;
  };

  const copyToClipboard = (code) => {
    const link = getInviteLink(code);
    navigator.clipboard.writeText(link).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const getUserName = (uid) => {
    const user = users.find(u => u.uid === uid);
    return user?.displayName || 'Unknown';
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center' }}>Loading...</div>;
  }

  const usedInvites = invites.filter(i => i.used);
  const unusedInvites = invites.filter(i => !i.used);

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <h1 className="page-title">Your Invites</h1>
      <p className="page-subtitle">
        Every member can invite others. Generate a code, share the link, and grow the circle.
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 40, alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : '+ Generate New Invite'}
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
          {usedInvites.length} accepted · {unusedInvites.length} pending
        </span>
      </div>

      {unusedInvites.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', marginBottom: 16 }}>
            Available Invites
          </h3>
          {unusedInvites.map(inv => (
            <div key={inv.code} className="invite-box" style={{ marginBottom: 12, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="invite-code" style={{ margin: 0, fontSize: '1rem' }}>{inv.code}</div>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => copyToClipboard(inv.code)}
              >
                {copied === inv.code ? 'Copied!' : 'Copy Invite Link'}
              </button>
            </div>
          ))}
        </div>
      )}

      {usedInvites.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem', marginBottom: 16 }}>
            Accepted Invites
          </h3>
          {usedInvites.map(inv => (
            <div key={inv.code} style={{
              padding: '14px 20px',
              background: 'var(--gray-100)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{getUserName(inv.usedBy)}</strong>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginLeft: 8 }}>
                  joined via {inv.code}
                </span>
              </div>
              <span className="tag" style={{ background: 'var(--success)', color: 'white' }}>Accepted</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
