import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { userProfile } = useAuth();

  return (
    <div>
      <div className="hero">
        <h1>Business Circle</h1>
        <p>
          A playground for entrepreneurs (to be) from all kinds of fields.
          To play, help, pitch, converse, share, and celebrate. Together.
        </p>
      </div>

      <div className="page-container">
        <div style={{ maxWidth: 720 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'friend'} ✦
          </h2>

          <p style={{ color: 'var(--gray-500)', marginBottom: 40, fontSize: '1.05rem', lineHeight: 1.7 }}>
            While working on a couple of business projects, I am speaking to a lot of different
            people who also are on the journey of becoming or being an entrepreneur. Some of them
            simply dreaming of becoming one one day. All of us have one thing in common: We all have
            <strong> questions</strong>, crave <strong>sparring</strong>, need <strong>feedback</strong>,
            require <strong>help</strong>, and have <strong>knowledge</strong> and <strong>skills</strong> we
            can <strong>share</strong>.
          </p>

          <p style={{ color: 'var(--gray-500)', marginBottom: 48, fontSize: '1.05rem', lineHeight: 1.7 }}>
            So why not connect all these people? This way we can support each other in any way possible.
            And here we are. Our business circle was born.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}>
            <Link to="/members" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Members</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                  Browse all members, discover skills, and find people who can help — or need your help.
                </p>
              </div>
            </Link>

            <Link to="/my-invites" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Invite Someone</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                  Know an entrepreneur who'd thrive here? Generate an invite link and grow the circle.
                </p>
              </div>
            </Link>

            <Link to="/edit-profile" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ borderLeft: '4px solid var(--gold)' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Your Profile</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>
                  Update your skills, what you need help with, and let others know what you're working on.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
