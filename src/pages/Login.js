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

  const handleReset = async () => {
    if (!email) { setError('Enter your email address first, then click reset.'); return; }
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError('Could not send reset email. Check your email address.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to the Business Circle</p>

        {error && <div className="auth-error">{error}</div>}
        {resetSent && <div style={{ background:'rgba(46,125,50,0.1)', color:'var(--success)', padding:'12px 16px', borderRadius:'var(--radius-sm)', fontSize:'0.85rem', marginBottom:20 }}>
          Password reset email sent! Check your inbox.
        </div>}

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

        <div style={{ textAlign:'center', marginTop:16 }}>
          <button onClick={handleReset} style={{
            background:'none', border:'none', color:'var(--dark-muted)',
            fontSize:'0.85rem', cursor:'pointer', fontFamily:'var(--font-body)',
            textDecoration:'underline'
          }}>Forgot your password?</button>
        </div>

        <div className="auth-switch">
          Have an invite code? <Link to="/signup">Create your account</Link>
        </div>
      </div>
    </div>
  );
}
