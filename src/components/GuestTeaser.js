import React from 'react';
import { Link } from 'react-router-dom';

export default function GuestTeaser({ title, description }) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Guest navbar */}
      <nav className="navbar" style={{ flexShrink: 0 }}>
        <Link to="/" className="navbar-brand">Business Circle</Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/members">Members</Link>
          <Link to="/news">News</Link>
          <Link to="/forum">Market Forum</Link>
          <Link to="/login" className="btn btn-primary btn-small" style={{ marginLeft: 8 }}>Log In</Link>
        </div>
      </nav>

      {/* Content area — fills remaining space, no scroll */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Fake blurred content */}
        <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 6 }}>{title}</h1>
          <p style={{ color: 'var(--dark-muted)', marginBottom: 28 }}>Loading content for members...</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ minHeight: 160 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.08)' }} />
                  <div>
                    <div style={{ width: 120 + (i * 15), height: 16, background: 'rgba(0,0,0,0.08)', borderRadius: 8, marginBottom: 6 }} />
                    <div style={{ width: 80, height: 12, background: 'rgba(0,0,0,0.05)', borderRadius: 6 }} />
                  </div>
                </div>
                <div style={{ width: '90%', height: 12, background: 'rgba(0,0,0,0.05)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ width: '70%', height: 12, background: 'rgba(0,0,0,0.05)', borderRadius: 6, marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3].map(j => (
                    <div key={j} style={{ width: 60 + (j * 10), height: 24, background: 'rgba(0,0,0,0.06)', borderRadius: 12 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fade overlay — positioned absolute, covers from partway down */}
        <div style={{
          position: 'absolute',
          top: 120,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(245,196,0,0) 0%, rgba(245,196,0,0.8) 20%, rgba(245,196,0,1) 45%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px', marginTop: -20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--dark-text)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', margin: '0 auto 18px', fontWeight: 700
            }}>🔒</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 10 }}>{title}</h2>
            <p style={{ color: 'var(--dark-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 24 }}>{description}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary">Log In</Link>
              <Link to="/signup" className="btn btn-outline">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
