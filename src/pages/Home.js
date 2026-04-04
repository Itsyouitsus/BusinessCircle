import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function GuestNav() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Business Circle</Link>
      <div className="navbar-links">
        <Link to="/members">Members</Link>
        <Link to="/news">News</Link>
        <Link to="/forum">Market Forum</Link>
        <Link to="/login" className="btn btn-primary btn-small" style={{ marginLeft: 8 }}>Log In</Link>
      </div>
    </nav>
  );
}

export default function Home() {
  const { userProfile, currentUser } = useAuth();
  const isGuest = !currentUser;

  return (
    <div>
      {isGuest && <GuestNav />}

      <div className="hero">
        <h1>Business Circle</h1>
        <p>A playground for entrepreneurs (to be) from all kinds of fields. To play, help, pitch, converse, share, and celebrate. Together.</p>
      </div>

      <div className="page-container">

        {/* Logged-in view */}
        {!isGuest && (
          <div style={{ maxWidth: 720 }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: 14 }}>
              Welcome back, {userProfile?.displayName?.split(' ')[0] || 'friend'}
            </h2>
            <p style={{ color: 'var(--dark-muted)', marginBottom: 36, fontSize: '1rem', lineHeight: 1.7 }}>
              All of us have one thing in common: We all have <strong>questions</strong>, crave <strong>sparring</strong>,
              need <strong>feedback</strong>, require <strong>help</strong>, and have <strong>knowledge</strong> and <strong>skills</strong> we
              can <strong>share</strong>. So why not connect and support each other?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { to: '/members', title: 'Members', desc: 'Browse all members and discover skills across the circle.' },
                { to: '/news', title: 'News', desc: 'Latest updates and articles shared by the group.' },
                { to: '/forum', title: 'Market Forum', desc: 'Start conversations, ask questions, pitch ideas.' },
                { to: '/my-invites', title: 'Invite Someone', desc: 'Generate an invite link and grow the circle.' },
                { to: '/edit-profile', title: 'Your Profile', desc: 'Update your skills and let others know what you bring.' },
              ].map(c => (
                <Link to={c.to} key={c.to} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ borderLeft: '4px solid var(--dark-text)' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>{c.title}</h3>
                    <p style={{ color: 'var(--dark-muted)', fontSize: '0.85rem' }}>{c.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Guest view — two columns */}
        {isGuest && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

              {/* Left: The idea */}
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: 14 }}>The idea</h2>
                <p style={{ color: 'var(--dark-muted)', marginBottom: 16, fontSize: '1rem', lineHeight: 1.7 }}>
                  While working on a couple of business projects, I am speaking to a lot of different
                  people who also are on the journey of becoming or being an <strong>entrepreneur</strong>. Some of them
                  simply dreaming of becoming one one day.
                </p>
                <p style={{ color: 'var(--dark-muted)', marginBottom: 16, fontSize: '1rem', lineHeight: 1.7 }}>
                  All of us have one thing in common: We all have <strong>questions</strong>, crave <strong>sparring</strong>,
                  need <strong>feedback</strong>, require <strong>help</strong>, and have <strong>knowledge</strong> and <strong>skills</strong> we
                  can <strong>share</strong>.
                </p>
                <p style={{ color: 'var(--dark-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
                  So then I thought: Why not <strong>connect all these people</strong> I know? This way we can support
                  each other in any way possible. And here we are. Our business circle was born.
                </p>
              </div>

              {/* Right: What's inside */}
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: 14 }}>What you'll find inside</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { title: 'Members', desc: 'Profiles of all entrepreneurs in the circle — their skills, companies, and what they bring.' },
                    { title: 'News', desc: 'A news feed where members share updates and articles of interest.' },
                    { title: 'Market Forum', desc: 'A place to start conversations, ask questions, and pitch ideas to the group.' },
                    { title: 'Invite System', desc: 'Every member can invite others. The circle grows through trust.' },
                  ].map(c => (
                    <div className="card" key={c.title} style={{ borderLeft: '4px solid var(--dark-text)' }}>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{c.title}</h3>
                      <p style={{ color: 'var(--dark-muted)', fontSize: '0.85rem' }}>{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sign in block centered underneath */}
            <div style={{
              textAlign: 'center', padding: '36px 24px', marginTop: 48,
              background: 'rgba(255,255,255,0.25)', borderRadius: 'var(--radius)',
              border: '2px solid rgba(0,0,0,0.08)', maxWidth: 520, margin: '48px auto 0'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Ready to join?</h2>
              <p style={{ color: 'var(--dark-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
                Business Circle is invite-only. If you have an invite code, sign up below. Otherwise, ask a member to invite you.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-primary">Log In</Link>
                <Link to="/signup" className="btn btn-outline">Sign Up with Invite Code</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
