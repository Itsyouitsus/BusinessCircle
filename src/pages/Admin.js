import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export default function Admin() {
  const { getAllUsers, getAllInvites, getAllSkills, updateSkillName, createInvite, currentUser, getForumPosts } = useAuth();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [skills, setSkills] = useState([]);
  const [forumStats, setForumStats] = useState({});
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingDate, setEditingDate] = useState(null);
  const [dateValue, setDateValue] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newMember, setNewMember] = useState({ name:'', email:'', country:'', city:'' });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const loadData = async () => {
    const [u, i, s, posts] = await Promise.all([getAllUsers(), getAllInvites(), getAllSkills(), getForumPosts()]);
    setUsers(u); setInvites(i); setSkills(s);
    // Compute forum stats per user
    const stats = {};
    posts.forEach(post => {
      if (!stats[post.authorId]) stats[post.authorId] = { topics: 0, replies: 0 };
      stats[post.authorId].topics++;
      (post.replies || []).forEach(r => {
        if (!stats[r.authorId]) stats[r.authorId] = { topics: 0, replies: 0 };
        stats[r.authorId].replies++;
      });
    });
    setForumStats(stats);
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const countries = new Set(); const cities = new Set(); const hobbiesSet = new Set();
    let m = 0, f = 0;
    users.forEach(u => {
      if (u.country) countries.add(u.country);
      if (u.city) cities.add(u.city);
      (u.hobbies || []).forEach(h => hobbiesSet.add(h));
      if (u.gender === 'M') m++;
      if (u.gender === 'F') f++;
    });
    return { countries: countries.size, cities: cities.size, male: m, female: f, hobbies: hobbiesSet.size };
  }, [users]);

  const sortedUsers = useMemo(() => {
    const list = [...users];
    list.sort((a, b) => {
      let va, vb;
      if (sortCol === 'name') { va = a.displayName || ''; vb = b.displayName || ''; }
      else if (sortCol === 'country') { va = a.country || ''; vb = b.country || ''; }
      else if (sortCol === 'invited') { va = a.inviteCount || 0; vb = b.inviteCount || 0; }
      else if (sortCol === 'topics') { va = forumStats[a.uid]?.topics || 0; vb = forumStats[b.uid]?.topics || 0; }
      else if (sortCol === 'replies') { va = forumStats[a.uid]?.replies || 0; vb = forumStats[b.uid]?.replies || 0; }
      else if (sortCol === 'total') { va = (forumStats[a.uid]?.topics || 0) + (forumStats[a.uid]?.replies || 0); vb = (forumStats[b.uid]?.topics || 0) + (forumStats[b.uid]?.replies || 0); }
      else {
        // date
        va = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        vb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      }
      if (typeof va === 'string') { return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va); }
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [users, sortCol, sortDir, forumStats]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };
  const sortIcon = (col) => sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleGenerate = async () => { setGenerating(true); await createInvite(currentUser.uid); await loadData(); setGenerating(false); };
  const getInviteLink = (code) => `${window.location.origin}${window.location.pathname}#/signup/${code}`;
  const copyToClipboard = (code) => { navigator.clipboard.writeText(getInviteLink(code)); setCopied(code); setTimeout(() => setCopied(null), 2000); };
  const getUserName = (uid) => users.find(u => u.uid === uid)?.displayName || 'Unknown';

  const handleSkillRename = async (oldName) => {
    if (editValue.trim() && editValue !== oldName) { await updateSkillName(oldName, editValue.trim()); await loadData(); }
    setEditingSkill(null);
  };

  const handleDateOverride = async (uid) => {
    if (!dateValue) { setEditingDate(null); return; }
    const d = new Date(dateValue); d.setHours(12, 0, 0, 0);
    await updateDoc(doc(db, 'users', uid), { createdAt: Timestamp.fromDate(d) });
    setEditingDate(null); await loadData();
  };

  const handleCreateMember = async (e) => {
    e.preventDefault(); setCreating(true); setCreateMsg('');
    try {
      const code = await createInvite(currentUser.uid);
      setCreateMsg(`Invite created: ${code} — share the signup link with them.`);
      setShowCreate(false); setNewMember({ name:'', email:'', country:'', city:'' }); await loadData();
    } catch (err) { setCreateMsg('Error: ' + err.message); }
    setCreating(false);
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  };
  const toInputDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
  };

  const renderTree = (parentId, depth = 0) => {
    const tree = {};
    users.forEach(u => { const inv = u.invitedBy || 'root'; if (!tree[inv]) tree[inv] = []; tree[inv].push(u); });
    return (tree[parentId] || []).map(child => (
      <div key={child.uid} style={{ marginLeft: depth * 28, marginBottom: 4 }}>
        <div style={{ padding:'8px 14px', background: depth === 0 ? 'rgba(255,255,255,0.2)' : 'transparent',
          borderRadius:'var(--radius-sm)', borderLeft:`3px solid ${depth === 0 ? 'var(--dark-text)' : 'rgba(0,0,0,0.1)'}`,
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
  const thStyle = { cursor:'pointer', userSelect:'none' };

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
        <div className="admin-stat"><div className="number">{stats.countries}</div><div className="label">Countries</div></div>
        <div className="admin-stat"><div className="number">{stats.cities}</div><div className="label">Cities</div></div>
        <div className="admin-stat"><div className="number">{stats.male} / {stats.female}</div><div className="label">M vs F</div></div>
        <div className="admin-stat"><div className="number">{stats.hobbies}</div><div className="label">Unique Hobbies</div></div>
      </div>

      <div className="tabs">
        {['users','invites','tree','skills'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'users' ? 'Members' : t === 'invites' ? 'Invites' : t === 'tree' ? 'Invite Tree' : 'Skills'}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div>
          <div style={{ marginBottom:16, display:'flex', gap:10 }}>
            <button className="btn btn-primary btn-small" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? 'Cancel' : '+ Create / Invite Member'}
            </button>
          </div>
          {createMsg && <div style={{ padding:'12px 16px', background:'rgba(255,255,255,0.3)', borderRadius:'var(--radius-sm)', marginBottom:16, fontSize:'0.88rem' }}>{createMsg}</div>}
          {showCreate && (
            <form onSubmit={handleCreateMember} style={{ padding:20, background:'rgba(255,255,255,0.2)', borderRadius:'var(--radius)', marginBottom:20 }}>
              <p style={{ marginBottom:16, fontSize:'0.88rem', color:'var(--dark-muted)' }}>Generate an invite code. Share the signup link with them.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div className="form-group"><label>Name</label><input type="text" className="form-input" value={newMember.name} onChange={e => setNewMember({...newMember, name:e.target.value})} placeholder="Full name" /></div>
                <div className="form-group"><label>Email</label><input type="email" className="form-input" value={newMember.email} onChange={e => setNewMember({...newMember, email:e.target.value})} placeholder="their@email.com" /></div>
                <div className="form-group"><label>Country</label><input type="text" className="form-input" value={newMember.country} onChange={e => setNewMember({...newMember, country:e.target.value})} placeholder="Netherlands" /></div>
                <div className="form-group"><label>City</label><input type="text" className="form-input" value={newMember.city} onChange={e => setNewMember({...newMember, city:e.target.value})} placeholder="Amsterdam" /></div>
              </div>
              <button type="submit" className="btn btn-primary btn-small" disabled={creating}>{creating ? 'Creating...' : 'Generate Invite'}</button>
            </form>
          )}
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead><tr>
                <th style={thStyle} onClick={() => toggleSort('name')}>Name{sortIcon('name')}</th>
                <th>Email</th>
                <th style={thStyle} onClick={() => toggleSort('country')}>Country{sortIcon('country')}</th>
                <th>Company</th>
                <th style={thStyle} onClick={() => toggleSort('topics')}>Topics{sortIcon('topics')}</th>
                <th style={thStyle} onClick={() => toggleSort('replies')}>Replies{sortIcon('replies')}</th>
                <th style={thStyle} onClick={() => toggleSort('total')}>Total{sortIcon('total')}</th>
                <th style={thStyle} onClick={() => toggleSort('invited')}>Inv.{sortIcon('invited')}</th>
                <th style={thStyle} onClick={() => toggleSort('date')}>Since{sortIcon('date')}</th>
              </tr></thead>
              <tbody>{sortedUsers.map(u => {
                const comps = (u.companies || []).filter(c => typeof c === 'object' && c.name).map(c => c.name);
                if (!comps.length && u.company) comps.push(u.company);
                const fs = forumStats[u.uid] || { topics:0, replies:0 };
                return (
                  <tr key={u.uid}>
                    <td><Link to={`/profile/${u.uid}`} style={{ fontWeight:600 }}>{u.displayName}</Link>
                      {u.role === 'admin' && <span className="tag" style={{ marginLeft:6, fontSize:'0.65rem' }}>Admin</span>}</td>
                    <td style={{ color:'var(--dark-muted)', fontSize:'0.82rem' }}>{u.email}</td>
                    <td>{u.country || '—'}</td>
                    <td>{comps[0] || '—'}</td>
                    <td style={{ textAlign:'center' }}>{fs.topics}</td>
                    <td style={{ textAlign:'center' }}>{fs.replies}</td>
                    <td style={{ textAlign:'center', fontWeight:600 }}>{fs.topics + fs.replies}</td>
                    <td style={{ textAlign:'center', fontWeight:600 }}>{u.inviteCount || 0}</td>
                    <td>
                      {editingDate === u.uid ? (
                        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                          <input type="date" className="form-input" value={dateValue} onChange={e => setDateValue(e.target.value)}
                            style={{ padding:'6px 8px', fontSize:'0.8rem', width:140 }} />
                          <button className="btn btn-primary btn-small" style={{ padding:'4px 8px' }} onClick={() => handleDateOverride(u.uid)}>✓</button>
                          <button className="btn btn-secondary btn-small" style={{ padding:'4px 8px' }} onClick={() => setEditingDate(null)}>✕</button>
                        </div>
                      ) : (
                        <span style={{ cursor:'pointer', borderBottom:'1px dashed rgba(0,0,0,0.2)' }}
                          onClick={() => { setEditingDate(u.uid); setDateValue(toInputDate(u.createdAt)); }}>
                          {formatDate(u.createdAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'invites' && (
        <div>
          <div style={{ marginBottom:20 }}>
            <button className="btn btn-primary btn-small" onClick={handleGenerate} disabled={generating}>{generating ? '...' : '+ Generate Invite'}</button>
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
          <p style={{ color:'var(--dark-muted)', fontSize:'0.88rem', marginBottom:20 }}>Who invited whom.</p>
          {renderTree('root', 0)}
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <p style={{ color:'var(--dark-muted)', fontSize:'0.88rem', marginBottom:20 }}>All skills — click to edit/fix typos (applies to all members).</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:8 }}>
            {skills.map(s => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', background:'rgba(255,255,255,0.25)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(0,0,0,0.06)' }}>
                {editingSkill === s.name ? (
                  <div style={{ display:'flex', gap:6, flex:1 }}>
                    <input type="text" className="form-input" value={editValue} onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSkillRename(s.name)} style={{ padding:'6px 10px', fontSize:'0.85rem' }} autoFocus />
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
