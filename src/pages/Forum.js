import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Forum() {
  const { getForumPosts, createForumPost, addForumReply, currentUser, userProfile, getAllUsers } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const loadData = async () => {
    const [p, u] = await Promise.all([getForumPosts(), getAllUsers()]);
    setPosts(p);
    const uMap = {};
    u.forEach(usr => { uMap[usr.uid] = usr; });
    setUsers(uMap);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createForumPost({ title, body, authorId: currentUser.uid, authorName: userProfile.displayName });
    setTitle(''); setBody(''); setShowNew(false);
    loadData();
  };

  const handleReply = async (postId) => {
    if (!replyText.trim()) return;
    await addForumReply(postId, { text: replyText, authorId: currentUser.uid, authorName: userProfile.displayName });
    setReplyText(''); setReplyTo(null);
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
        <h1 className="page-title">Market Forum</h1>
        <button className="btn btn-primary btn-small" onClick={() => setShowNew(!showNew)}>
          {showNew ? 'Cancel' : '+ New Topic'}
        </button>
      </div>
      <p className="page-subtitle">Start a conversation, ask questions, pitch ideas</p>

      {showNew && (
        <form onSubmit={handlePost} style={{ marginBottom:28, padding:24, background:'rgba(255,255,255,0.25)', borderRadius:'var(--radius)' }}>
          <div className="form-group">
            <label>Topic Title</label>
            <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's on your mind?" required />
          </div>
          <div className="form-group">
            <label>Details (optional)</label>
            <textarea className="form-input" value={body} onChange={e => setBody(e.target.value)} placeholder="Add more context..." rows={3} />
          </div>
          <button type="submit" className="btn btn-primary">Post Topic</button>
        </form>
      )}

      {posts.map(post => (
        <div className="forum-post" key={post.id}>
          <div className="forum-post-header">
            <div className="forum-post-title">{post.title}</div>
            <div className="forum-post-meta">{post.authorName} · {formatDate(post.createdAt)}</div>
          </div>
          {post.body && <div className="forum-post-body">{post.body}</div>}
          <div style={{ marginTop:10 }}>
            <button className="btn btn-secondary btn-small" onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}>
              💬 {post.replies?.length || 0} replies
            </button>
          </div>
          {(post.replies || []).map((r, i) => (
            <div className="forum-reply" key={i}>
              <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{r.authorName} <span style={{ fontWeight:400, opacity:0.5 }}>· {formatDate(r.createdAt)}</span></div>
              <div style={{ fontSize:'0.88rem', marginTop:4 }}>{r.text}</div>
            </div>
          ))}
          {replyTo === post.id && (
            <div style={{ marginLeft:32, marginTop:8, display:'flex', gap:8 }}>
              <input type="text" className="form-input" value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..." style={{ flex:1 }} onKeyDown={e => e.key === 'Enter' && handleReply(post.id)} />
              <button className="btn btn-primary btn-small" onClick={() => handleReply(post.id)}>Reply</button>
            </div>
          )}
        </div>
      ))}

      {posts.length === 0 && <div style={{ textAlign:'center', padding:'60px 0', color:'var(--dark-muted)' }}>No topics yet. Start the first conversation!</div>}
    </div>
  );
}
