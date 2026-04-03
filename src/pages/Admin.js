import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { getAllUsers, getAllInvites, getAllSkills, updateSkillName, createInvite, currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editValue, setEditValue] = useState('');

  const loadData = async () => {
    const [u, i, s] = await Promise.all([getAllUsers(), getAllInvites(), getAllSkills()]);
    setUsers(u); setInvites(i); setSkills(s); setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const handleGenerate = async () => { setGenerating(true); await createInvite(currentUser.uid); await loadData(); setGenerating(false); };
  const getInviteLink = (code) => `${window.location.origin}${window.location.pathname}#/signup/${code}`;
  const copyToClipboard = (code) => { navigator.clipboard.writeText(getInviteLink(code)); setCopied(code); setTimeout(() => setCopied(null), 2000); };
  const getUserName = (uid) => users.find(u => u.uid === uid)?.displayName || 'Unknown';

  const handleSkillRename = async (oldName) => {
    if (editValue.trim() && editValue !== oldName) {
      await updateSkillName(oldName, editValue.trim());
      await loadData();
    }
    setEditingSkill(null);
  };

  const getInviteTree = () => {
    const tree = {};
    users.forEach(u => { const inv = u.invitedBy || 'root'; if (!tree[inv]) tree[inv] = []; tree[inv].push(u); });
    return tree;
  };

  const renderTree = (parentId, depth = 0) => {
    const children = getInviteTree()[parentId] || [];
    return children.map(child => (
      <div key={child.uid} style={{ marginLeft: depth * 28, marginBottom: 4 }}>
        <div style={{ padding:'8px 14px', background: depth === 0 ? 'rgba(255,255,255,0.2)' : 'transparent',
          borderRadius:'var(--radius-sm)', borderLeft: `3px solid ${depth === 0 ? 'var(--dark-text)' : 'rgba(0,0,0,0.1)'}`,
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <Link to={`/profile/${child.uid}`} style={{ fontWeight:600 }}>{child.displayName}</Link>
            <span style={{ fontSize:'0.78rem', color:'var(--dark-muted)', marginLeft:8 }}>invited {child.inviteCount || 0}</span>
          </div>
        </div>
        {renderTree(child.uid, depth + 1)}
      </div>
    ));
  };

  if (loading) return <div className="page-container" style={{ textAlign:'center' }}>Loading...</div>;

  const usedInvites = invites.filter(i => i.used).length;
  const pendingInvites = invites.filter(i => !i.used).length;

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Panel</h1>
      <p className="page-subtitle">Manage members, invites, skills, and growth</p>

      <div className="admin-stat-grid">
        <div className="admin-stat"><div className="number">{users.length}</div><div className="label">Members</div></div>
        <div className="admin-stat"><div className="number">{invites.length}</div><div className="label">Total Invites</div></div>
        <div className="admin-stat"><div className="number">{usedInvites}</div><div className="label">Accepted</div></div>
        <div className="admin-stat"><div className="number">{pendingInvites}</div><div className="label">Pending</div></div>
        <div className="admin-stat"><div className="number">{skills.length}</div><div className="label">Unique Skills</div></div>
      </div>

      <div className="tabs">
        {['users','invites','tree','skills'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'users' ? 'All Members' : t === 'invites' ? 'All Invites' : t === 'tree' ? 'Invite Tree' : 'Skills Manager'}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div style={{ overflowX:'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Location</th><th>Company</th><th>Skills</th><th>Invited By</th><th>Invited</th></tr></thead>
            <tbody>{users.map(user => {
              const locs = user.locations?.length ? user.locations : (user.location ? [user.location] : []);
              const comps = user.companies?.length ? user.companies : (user.company ? [user.company] : []);
              return (
                <tr key={user.uid}>
                  <td><Link to={`/profile/${user.uid}`} style={{ fontWeight:600 }}>{user.displayName}</Link>
                    {user.role === 'admin' && <span className="tag" style={{ marginLeft:6, fontSize:'0.65rem' }}>Admin</span>}</td>
                  <td style={{ color:'var(--dark-muted)' }}>{user.email}</td>
                  <td>{locs[0] || '—'}</td>
                  <td>{comps[0] || '—'}</td>
                  <td>{(user.skills || []).slice(0,3).map(s => <span className="tag tag-skill" key={s} style={{ fontSize:'0.7rem' }}>{s}</span>)}
                    {(user.skills?.length || 0) > 3 && <span className="tag" style={{ fontSize:'0.7rem' }}>+{user.skills.length - 3}</span>}</td>
                  <td style={{ color:'var(--dark-muted)' }}>{user.invitedBy && user.invitedBy !== 'root' ? getUserName(user.invitedBy) : '—'}</td>
                  <td style={{ fontWeight:600 }}>{user.inviteCount || 0}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'invites' && (
        <div>
          <div style={{ marginBottom:20 }}>
            <button className="btn btn-primary btn-small" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : '+ Generate Invite'}
            </button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Code</th><th>Created By</th><th>Status</th><th>Used By</th><th>Action</th></tr></thead>
            <tbody>{invites.map(inv => (
              <tr key={inv.code}>
                <td style={{ fontFamily:'monospace', fontWeight:600 }}>{inv.code}</td>
                <td>{inv.createdBy && inv.createdBy !== 'root' ? getUserName(inv.createdBy) : 'System'}</td>
                <td>{inv.used ? <span className="tag" style={{ background:'var(--success)', color:'white' }}>Used</span> : <span className="tag tag-skill">Pending</span>}</td>
                <td>{inv.used ? getUserName(inv.usedBy) : '—'}</td>
                <td>{!inv.used && <button className="btn btn-small btn-outline" onClick={() => copyToClipboard(inv.code)}>{copied === inv.code ? 'Copied!' : 'Copy Link'}</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'tree' && (
        <div>
          <p style={{ color:'var(--dark-muted)', fontSize:'0.88rem', marginBottom:20 }}>Who invited whom into the circle.</p>
          {renderTree('root', 0)}
          {users.filter(u => u.invitedBy && u.invitedBy !== 'root').length > 0 &&
            renderTree(users.find(u => !u.invitedBy || u.invitedBy === 'root')?.uid, 0)}
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <p style={{ color:'var(--dark-muted)', fontSize:'0.88rem', marginBottom:20 }}>
            All skills across members. Click to edit/fix typos — changes apply to all members who have that skill.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:8 }}>
            {skills.map(s => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', background:'rgba(255,255,255,0.25)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(0,0,0,0.06)' }}>
                {editingSkill === s.name ? (
                  <div style={{ display:'flex', gap:6, flex:1 }}>
                    <input type="text" className="form-input" value={editValue} onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSkillRename(s.name)}
                      style={{ padding:'6px 10px', fontSize:'0.85rem' }} autoFocus />
                    <button className="btn btn-primary btn-small" onClick={() => handleSkillRename(s.name)}>✓</button>
                    <button className="btn btn-secondary btn-small" onClick={() => setEditingSkill(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontWeight:600 }}>{s.name} <span style={{ fontWeight:400, opacity:0.5, fontSize:'0.8rem' }}>({s.count})</span></span>
                    <button className="btn btn-secondary btn-small" style={{ padding:'4px 10px' }}
                      onClick={() => { setEditingSkill(s.name); setEditValue(s.name); }}>Edit</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
