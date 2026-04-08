import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError('Could not send reset email. Check your email address.');
    }
    setLoading(false);
  };

  // Reset sent confirmation
  if (resetSent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📧</div>
          <h1>Check your email</h1>
          <p style={{ color: 'var(--dark-muted)', marginTop: 8, marginBottom: 24, lineHeight: 1.6 }}>
            We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setResetSent(false); setResetMode(false); }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Reset password form
  if (resetMode) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Reset password</h1>
          <p className="subtitle">Enter your email and we'll send you a reset link</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => { setResetMode(false); setError(''); }} style={{
              background: 'none', border: 'none', color: 'var(--dark-muted)',
              fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
              textDecoration: 'underline'
            }}>Back to Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  // Normal login form
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to the Business Circle</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => { setResetMode(true); setError(''); }} style={{
            background: 'none', border: 'none', color: 'var(--dark-muted)',
            fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
            textDecoration: 'underline'
          }}>Forgot your password?</button>
        </div>

        <div className="auth-switch">
          Have an invite code? <Link to="/signup">Create your account</Link>
        </div>
      </div>
    </div>
  );
}
