import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function News() {
  const { getNewsItems, createNewsItem, currentUser, userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');

  const loadData = async () => { setItems(await getNewsItems()); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createNewsItem({ title, body, url, authorId: currentUser.uid, authorName: userProfile.displayName });
    setTitle(''); setBody(''); setUrl(''); setShowNew(false);
    loadData();
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  };

  if (loading) return <div className="page-container" style={{ textAlign:'center' }}>Loading...</div>;

  return (
    <div className="page-container" style={{ maxWidth:800 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h1 className="page-title">News</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowNew(!showNew)}>
          {showNew ? 'Cancel' : '+ Share News'}
        </button>
      </div>
      <p className="page-subtitle">Share news and updates that might interest the group</p>

      {showNew && (
        <form onSubmit={handlePost} style={{ marginBottom:28, padding:24, background:'rgba(255,255,255,0.25)', borderRadius:'var(--radius)' }}>
          <div className="form-group">
            <label>Headline</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's the news?" required />
          </div>
          <div className="form-group">
            <label>Details</label>
            <textarea className="form-input" value={body} onChange={e => setBody(e.target.value)} placeholder="Share the details..." rows={4} />
          </div>
          <div className="form-group">
            <label>Link (optional)</label>
            <input type="text" className="form-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <button type="submit" className="btn btn-primary">Post News</button>
        </form>
      )}

      {items.map(item => (
        <div className="news-item" key={item.id}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <h3 style={{ fontSize:'1.15rem', fontWeight:700 }}>{item.title}</h3>
            <span style={{ fontSize:'0.78rem', color:'var(--dark-muted)', flexShrink:0 }}>{formatDate(item.createdAt)}</span>
          </div>
          {item.body && <p style={{ color:'var(--dark-muted)', lineHeight:1.6, marginBottom:8 }}>{item.body}</p>}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:'0.8rem', color:'var(--dark-muted)' }}>Posted by {item.authorName}</span>
            {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-small">Read more →</a>}
          </div>
        </div>
      ))}

      {items.length === 0 && <div style={{ textAlign:'center', padding:'60px 0', color:'var(--dark-muted)' }}>No news yet. Share something with the group!</div>}
    </div>
  );
}
