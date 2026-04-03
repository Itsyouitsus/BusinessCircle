import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MultiField({ label, values, setValues, placeholder }) {
  const add = () => setValues([...values, '']);
  const update = (i, val) => { const n = [...values]; n[i] = val; setValues(n); };
  const remove = (i) => setValues(values.filter((_, idx) => idx !== i));
  return (
    <div className="form-group">
      <label>{label}</label>
      {values.map((v, i) => (
        <div className="multi-field-row" key={i}>
          <input type="text" className="form-input" value={v} onChange={e => update(i, e.target.value)} placeholder={placeholder} />
          {values.length > 1 && <button className="multi-field-remove" onClick={() => remove(i)} type="button">×</button>}
        </div>
      ))}
      <button className="multi-field-add" onClick={add} type="button">+ Add another</button>
    </div>
  );
}

function SkillsInput({ skills, setSkills, allSkills }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (val) => {
    setInput(val);
    if (val.length >= 2) {
      const filtered = allSkills.filter(s => s.name.toLowerCase().startsWith(val.toLowerCase()) && !skills.includes(s.name));
      setSuggestions(filtered.slice(0, 6));
    } else { setSuggestions([]); }
  };

  const addSkill = (name) => {
    const val = name || input.trim();
    if (val && !skills.includes(val)) setSkills([...skills, val]);
    setInput(''); setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
    if (e.key === 'Backspace' && !input && skills.length > 0) setSkills(skills.slice(0, -1));
  };

  return (
    <div className="form-group">
      <label>Skills & Expertise</label>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
        {skills.map(s => (
          <span className="tag tag-skill" key={s} style={{ cursor:'pointer' }} onClick={() => setSkills(skills.filter(t => t !== s))}>
            {s} ×
          </span>
        ))}
      </div>
      <div className="autocomplete-wrapper">
        <input type="text" className="form-input" value={input} onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={() => setTimeout(() => setSuggestions([]), 200)}
          placeholder="e.g. Marketing, React, Fundraising..." />
        {suggestions.length > 0 && (
          <div className="autocomplete-list">
            {suggestions.map(s => (
              <div className="autocomplete-item" key={s.name} onMouseDown={() => addSkill(s.name)}>
                {s.name} <span style={{ opacity:0.5, fontSize:'0.75rem' }}>({s.count})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ fontSize:'0.72rem', color:'var(--dark-muted)', marginTop:4 }}>Press Enter or comma to add. Click a tag to remove.</div>
    </div>
  );
}

export default function EditProfile() {
  const { userProfile, updateUserProfile, currentUser, getAllSkills } = useAuth();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm] = useState({
    displayName: '', bio: '', photoURL: '',
    companies: [''], locations: [''], websites: [''], linkedins: [''],
    skills: []
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        photoURL: userProfile.photoURL || '',
        companies: (userProfile.companies?.length ? userProfile.companies : (userProfile.company ? [userProfile.company] : [''])),
        locations: (userProfile.locations?.length ? userProfile.locations : (userProfile.location ? [userProfile.location] : [''])),
        websites: (userProfile.websites?.length ? userProfile.websites : (userProfile.website ? [userProfile.website] : [''])),
        linkedins: (userProfile.linkedins?.length ? userProfile.linkedins : ['']),
        skills: userProfile.skills || []
      });
    }
    getAllSkills().then(setAllSkills);
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      companies: form.companies.filter(Boolean),
      locations: form.locations.filter(Boolean),
      websites: form.websites.filter(Boolean),
      linkedins: form.linkedins.filter(Boolean),
    };
    await updateUserProfile(currentUser.uid, data);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container" style={{ maxWidth:640 }}>
      <h1 className="page-title">Edit Profile</h1>
      <p className="page-subtitle">Let others know who you are and what you bring to the circle</p>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Profile Picture URL</label>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            {form.photoURL && (
              <div style={{ width:60, height:60, borderRadius:'50%', overflow:'hidden', flexShrink:0 }}>
                <img src={form.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            )}
            <input type="text" className="form-input" value={form.photoURL}
              onChange={e => setForm({ ...form, photoURL: e.target.value })}
              placeholder="https://example.com/your-photo.jpg" />
          </div>
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input type="text" className="form-input" value={form.displayName}
            onChange={e => setForm({ ...form, displayName: e.target.value })} required />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea className="form-input" value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell the group about yourself and what you're working on..." rows={4} />
        </div>

        <MultiField label="Companies" values={form.companies}
          setValues={v => setForm({ ...form, companies: v })} placeholder="Company name" />

        <MultiField label="Locations" values={form.locations}
          setValues={v => setForm({ ...form, locations: v })} placeholder="City, Country" />

        <MultiField label="Websites" values={form.websites}
          setValues={v => setForm({ ...form, websites: v })} placeholder="https://yoursite.com" />

        <MultiField label="LinkedIn Profiles" values={form.linkedins}
          setValues={v => setForm({ ...form, linkedins: v })} placeholder="https://linkedin.com/in/yourname" />

        <SkillsInput skills={form.skills} setSkills={s => setForm({ ...form, skills: s })} allSkills={allSkills} />

        <div style={{ display:'flex', gap:12, marginTop:8 }}>
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
