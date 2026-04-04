import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Members from './pages/Members';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MyInvites from './pages/MyInvites';
import Admin from './pages/Admin';
import Forum from './pages/Forum';
import News from './pages/News';
import GuestTeaser from './components/GuestTeaser';
import './styles/index.css';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  return currentUser ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { userProfile, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!userProfile || userProfile.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  return currentUser ? <Navigate to="/" /> : children;
}

function GuestOrAuth({ children, title, description }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (currentUser) return children;
  return <GuestTeaser title={title} description={description} />;
}

function AppContent() {
  const { currentUser } = useAuth();
  return (
    <>
      {currentUser && <Navbar />}
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/signup/:inviteCode" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/members" element={
          <GuestOrAuth title="Members" description="Browse our community of entrepreneurs from around the world. See their skills, companies, and expertise — and find people who can help you or who you can help.">
            <Members />
          </GuestOrAuth>
        } />
        <Route path="/profile/:uid" element={
          <GuestOrAuth title="Member Profile" description="View detailed profiles of our members — their skills, companies, interests, and how they contribute to the circle.">
            <Profile />
          </GuestOrAuth>
        } />
        <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/my-invites" element={<PrivateRoute><MyInvites /></PrivateRoute>} />
        <Route path="/forum" element={
          <GuestOrAuth title="Market Forum" description="Our members discuss ideas, ask questions, share feedback, and pitch their ventures. Join the conversation and connect with fellow entrepreneurs.">
            <Forum />
          </GuestOrAuth>
        } />
        <Route path="/news" element={
          <GuestOrAuth title="News" description="Stay up to date with the latest news, articles, and updates shared by our community of entrepreneurs.">
            <News />
          </GuestOrAuth>
        } />
        <Route path="/admin" element={<PrivateRoute><AdminRoute><Admin /></AdminRoute></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
