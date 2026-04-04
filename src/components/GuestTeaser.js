import React from 'react';
import { Link } from 'react-router-dom';

export default function GuestTeaser({ title, description }) {
  return (
    <div>
      {/* Guest navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">Business Circle</Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/members">Members</Link>
          <Link to="/news">News</Link>
          <Link to="/forum">Market Forum</Link>
          <Link to="/login" className="btn btn-primary btn-small" style={{ marginLeft: 8 }}>Log In</Link>
        </div>
      </nav>

      {/* Teaser content */}
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

        {/* Fake blurred content behind */}
        <div style={{ padding: '40px', maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>{title}</h1>
          <p style={{ color: 'var(--dark-muted)', marginBottom: 32 }}>Loading content for members...</p>

          {/* Fake cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ minHeight: 180 }}>
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

        {/* Fade overlay */}
        <div style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(245, 196, 0, 0) 0%, rgba(245, 196, 0, 0.7) 15%, rgba(245, 196, 0, 0.95) 35%, rgba(245, 196, 0, 1) 50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: 520,
            padding: '0 24px',
            marginTop: -60,
            pointerEvents: 'auto'
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--dark-text)', color: 'var(--gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', margin: '0 auto 20px', fontWeight: 700
            }}>🔒</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
              {title}
            </h2>
            <p style={{ color: 'var(--dark-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 28 }}>
              {description}
            </p>
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
