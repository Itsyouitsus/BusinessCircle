import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function TagInput({ label, tags, setTags, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tags.map(tag => (
          <span className="tag tag-gold" key={tag} style={{ cursor: 'pointer' }}
                onClick={() => setTags(tags.filter(t => t !== tag))}>
            {tag} ✕
          </span>
        ))}
      </div>
      <input
        type="text"
        className="form-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
      />
      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>
        Press Enter or comma to add. Click a tag to remove it.
      </div>
    </div>
  );
}

export default function EditProfile() {
  const { userProfile, updateUserProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    company: '',
    website: '',
    skills: [],
    needsHelpWith: []
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        company: userProfile.company || '',
        website: userProfile.website || '',
        skills: userProfile.skills || [],
        needsHelpWith: userProfile.needsHelpWith || []
      });
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateUserProfile(currentUser.uid, form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Edit Profile</h1>
      <p className="page-subtitle">Let others know who you are and how they can help</p>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-input"
            value={form.displayName}
            onChange={e => setForm({ ...form, displayName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            className="form-input"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell the group about yourself, your journey, and what you're working on..."
            rows={4}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              className="form-input"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Amsterdam, NL"
            />
          </div>
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              className="form-input"
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
              placeholder="Your company or venture"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Website</label>
          <input
            type="text"
            className="form-input"
            value={form.website}
            onChange={e => setForm({ ...form, website: e.target.value })}
            placeholder="https://yoursite.com"
          />
        </div>

        <TagInput
          label="Skills & Expertise"
          tags={form.skills}
          setTags={(skills) => setForm({ ...form, skills })}
          placeholder="e.g. Marketing, React, Fundraising, Sales..."
        />

        <TagInput
          label="I Need Help With"
          tags={form.needsHelpWith}
          setTags={(needsHelpWith) => setForm({ ...form, needsHelpWith })}
          placeholder="e.g. Legal advice, UI Design, Finding co-founder..."
        />

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/profile/${currentUser.uid}`)}>
            View My Profile
          </button>
        </div>
      </form>

      {saved && <div className="toast">Profile saved ✓</div>}
    </div>
  );
}
