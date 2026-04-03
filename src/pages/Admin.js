import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { getAllUsers, getAllInvites, createInvite, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allUsers, allInvites] = await Promise.all([getAllUsers(), getAllInvites()]);
    setUsers(allUsers);
    setInvites(allInvites);
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
    navigator.clipboard.writeText(getInviteLink(code)).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const getUserName = (uid) => {
    const user = users.find(u => u.uid === uid);
    return user?.displayName || 'Unknown';
  };

  const getInviteTree = () => {
    // Build a tree: who invited whom
    const tree = {};
    users.forEach(u => {
      const inviter = u.invitedBy || 'root';
      if (!tree[inviter]) tree[inviter] = [];
      tree[inviter].push(u);
    });
    return tree;
  };

  const renderTree = (parentId, depth = 0) => {
    const tree = getInviteTree();
    const children = tree[parentId] || [];
    if (children.length === 0) return null;

    return children.map(child => (
      <div key={child.uid} style={{ marginLeft: depth * 32, marginBottom: 4 }}>
        <div style={{
          padding: '10px 16px',
          background: depth === 0 ? 'var(--gray-100)' : 'white',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `3px solid ${depth === 0 ? 'var(--gold)' : 'var(--gray-200)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Link to={`/profile/${child.uid}`} style={{ fontWeight: 600, color: 'var(--black)' }}>
              {child.displayName}
            </Link>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginLeft: 8 }}>
              invited {child.inviteCount || 0}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
            {child.location || ''}
          </span>
        </div>
        {renderTree(child.uid, depth + 1)}
      </div>
    ));
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center' }}>Loading...</div>;
  }

  const totalInvites = invites.length;
  const usedInvites = invites.filter(i => i.used).length;
  const pendingInvites = invites.filter(i => !i.used).length;

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">Manage members, invites, and see the growth of the circle</p>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <div className="number">{users.length}</div>
          <div className="label">Members</div>
        </div>
        <div className="admin-stat">
          <div className="number">{totalInvites}</div>
          <div className="label">Total Invites Created</div>
        </div>
        <div className="admin-stat">
          <div className="number">{usedInvites}</div>
          <div className="label">Invites Accepted</div>
        </div>
        <div className="admin-stat">
          <div className="number">{pendingInvites}</div>
          <div className="label">Invites Pending</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          All Members
        </button>
        <button className={`tab ${activeTab === 'invites' ? 'active' : ''}`} onClick={() => setActiveTab('invites')}>
          All Invites
        </button>
        <button className={`tab ${activeTab === 'tree' ? 'active' : ''}`} onClick={() => setActiveTab('tree')}>
          Invite Tree
        </button>
      </div>

      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Company</th>
                <th>Skills</th>
                <th>Invited By</th>
                <th>Invited Others</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.uid}>
                  <td>
                    <Link to={`/profile/${user.uid}`} style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>
                      {user.displayName}
                    </Link>
                    {user.role === 'admin' && <span className="tag" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Admin</span>}
                  </td>
                  <td style={{ color: 'var(--gray-500)' }}>{user.email}</td>
                  <td>{user.location || '—'}</td>
                  <td>{user.company || '—'}</td>
                  <td>
                    {user.skills?.slice(0, 3).map(s => (
                      <span className="tag tag-gold" key={s} style={{ fontSize: '0.7rem' }}>{s}</span>
                    ))}
                    {(user.skills?.length || 0) > 3 && <span className="tag" style={{ fontSize: '0.7rem' }}>+{user.skills.length - 3}</span>}
                  </td>
                  <td style={{ color: 'var(--gray-400)' }}>
                    {user.invitedBy ? getUserName(user.invitedBy) : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{user.inviteCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'invites' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <button className="btn btn-primary btn-small" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : '+ Generate Admin Invite'}
            </button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Used By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.code}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.code}</td>
                  <td>{getUserName(inv.createdBy)}</td>
                  <td>
                    {inv.used
                      ? <span className="tag" style={{ background: 'var(--success)', color: 'white' }}>Used</span>
                      : <span className="tag tag-gold">Pending</span>
                    }
                  </td>
                  <td>{inv.used ? getUserName(inv.usedBy) : '—'}</td>
                  <td>
                    {!inv.used && (
                      <button className="btn btn-small btn-outline" onClick={() => copyToClipboard(inv.code)}>
                        {copied === inv.code ? 'Copied!' : 'Copy Link'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tree' && (
        <div>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: 20 }}>
            Visual hierarchy showing who invited whom into the circle.
          </p>
          {renderTree('root', 0)}
          {/* Also render users with known inviters that aren't 'root' */}
          {users.filter(u => u.invitedBy && u.invitedBy !== 'root').length > 0 && renderTree(users.find(u => !u.invitedBy || u.invitedBy === 'root')?.uid || currentUser.uid, 0)}
        </div>
      )}
    </div>
  );
}
