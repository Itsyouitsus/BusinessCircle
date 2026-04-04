import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Business Circle</Link>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/members" className={isActive('/members')}>Members</Link>
        <Link to="/news" className={isActive('/news')}>News</Link>
        <Link to="/forum" className={isActive('/forum')}>Market Forum</Link>
        <Link to="/my-invites" className={isActive('/my-invites')}>Invite</Link>
        {userProfile?.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
        <div className="navbar-user">
          <Link to="/settings" title="Notification Settings" style={{
            opacity: location.pathname === '/settings' ? 1 : 0.5,
            fontSize: '1.1rem', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center'
          }}>⚙</Link>
          <Link to="/edit-profile" className="navbar-avatar" title="Edit Profile">
            {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="" /> : initials}
          </Link>
          <button onClick={handleLogout} style={{ background:'none', border:'none', color:'var(--dark-muted)', cursor:'pointer', fontSize:'0.78rem', fontFamily:'var(--font-body)', fontWeight:600 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
