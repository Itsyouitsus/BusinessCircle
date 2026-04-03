import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { userProfile } = useAuth();
  return (
    <div>
      <div className="hero">
        <h1>Business Circle</h1>
        <p>A playground for entrepreneurs (to be) from all kinds of fields. To play, help, pitch, converse, share, and celebrate. Together.</p>
      </div>
      <div className="page-container">
        <div style={{ maxWidth:720 }}>
          <h2 style={{ fontSize:'1.8rem', marginBottom:14 }}>
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'friend'}
          </h2>
          <p style={{ color:'var(--dark-muted)', marginBottom:36, fontSize:'1rem', lineHeight:1.7 }}>
            All of us have one thing in common: We all have <strong>questions</strong>, crave <strong>sparring</strong>,
            need <strong>feedback</strong>, require <strong>help</strong>, and have <strong>knowledge</strong> and <strong>skills</strong> we
            can <strong>share</strong>. So why not connect and support each other?
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16 }}>
            {[
              { to:'/members', title:'Members', desc:'Browse all members and discover skills across the circle.' },
              { to:'/news', title:'News', desc:'Latest updates and articles shared by the group.' },
              { to:'/forum', title:'Forum', desc:'Start conversations, ask questions, get feedback.' },
              { to:'/my-invites', title:'Invite Someone', desc:'Generate an invite link and grow the circle.' },
              { to:'/edit-profile', title:'Your Profile', desc:'Update your skills and let others know what you bring.' },
            ].map(c => (
              <Link to={c.to} key={c.to} style={{ textDecoration:'none' }}>
                <div className="card" style={{ borderLeft:'4px solid var(--dark-text)' }}>
                  <h3 style={{ fontSize:'1.15rem', marginBottom:6 }}>{c.title}</h3>
                  <p style={{ color:'var(--dark-muted)', fontSize:'0.85rem' }}>{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
