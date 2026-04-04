import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { userProfile, updateUserProfile, currentUser } = useAuth();
  const [notifs, setNotifs] = useState({
    news: true,
    topicReplies: true,
    threadReplies: true,
    newMembers: true
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile?.notifications) {
      setNotifs({ ...notifs, ...userProfile.notifications });
    }
  }, [userProfile]);

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile(currentUser.uid, { notifications: notifs });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ label, description, checked, onChange }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 0', borderBottom: '1px solid rgba(0,0,0,0.06)'
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--dark-muted)' }}>{description}</div>
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 48, height: 28, borderRadius: 14, cursor: 'pointer',
          background: checked ? 'var(--dark-text)' : 'rgba(0,0,0,0.12)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: checked ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          transition: 'left 0.2s'
        }} />
      </div>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <h1 className="page-title">Notification Settings</h1>
      <p className="page-subtitle">Choose which email notifications you'd like to receive</p>

      <div style={{
        background: 'rgba(255,255,255,0.25)', borderRadius: 'var(--radius)',
        border: '1px solid rgba(0,0,0,0.06)', padding: '4px 24px'
      }}>
        <Toggle
          label="News updates"
          description="Get notified when someone shares a news item"
          checked={notifs.news}
          onChange={v => setNotifs({ ...notifs, news: v })}
        />
        <Toggle
          label="Replies to your topics"
          description="Get notified when someone replies to a topic you started"
          checked={notifs.topicReplies}
          onChange={v => setNotifs({ ...notifs, topicReplies: v })}
        />
        <Toggle
          label="Replies in threads you've joined"
          description="Get notified when someone replies in a topic where you've also replied"
          checked={notifs.threadReplies}
          onChange={v => setNotifs({ ...notifs, threadReplies: v })}
        />
        <Toggle
          label="New members"
          description="Get notified when someone new joins the Business Circle"
          checked={notifs.newMembers}
          onChange={v => setNotifs({ ...notifs, newMembers: v })}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {saved && <div className="toast">Preferences saved ✓</div>}
    </div>
  );
}
