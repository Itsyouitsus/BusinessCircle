import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const COUNTRIES = ["Online","Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

function AutocompleteInput({ value, onChange, suggestions, placeholder }) {
  const [show, setShow] = useState(false);
  const [input, setInput] = useState(value || '');
  const filtered = suggestions.filter(s => s.toLowerCase().startsWith(input.toLowerCase()) && s !== input).slice(0, 6);
  useEffect(() => { setInput(value || ''); }, [value]);
  return (
    <div className="autocomplete-wrapper">
      <input type="text" className="form-input" value={input}
        onChange={e => { setInput(e.target.value); onChange(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)} onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder} />
      {show && filtered.length > 0 && (
        <div className="autocomplete-list">
          {filtered.map(s => <div className="autocomplete-item" key={s} onMouseDown={() => { setInput(s); onChange(s); setShow(false); }}>{s}</div>)}
        </div>
      )}
    </div>
  );
}

function CompanyBlock({ company, onChange, onRemove, canRemove, allSkills }) {
  const update = (key, val) => onChange({ ...company, [key]: val });
  return (
    <div style={{ padding: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,0,0,0.08)', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--dark-muted)' }}>Company</span>
        {canRemove && <button className="multi-field-remove" onClick={onRemove} type="button">×</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="form-group" style={{ marginBottom: 8 }}>
          <label>Name</label>
          <input type="text" className="form-input" value={company.name || ''} onChange={e => update('name', e.target.value)} placeholder="Acme Inc." />
        </div>
        <div className="form-group" style={{ marginBottom: 8 }}>
          <label>Website</label>
          <input type="text" className="form-input" value={company.website || ''} onChange={e => update('website', e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group" style={{ marginBottom: 8 }}>
          <label>Field / Industry</label>
          <AutocompleteInput value={company.field || ''} onChange={v => update('field', v)} suggestions={allSkills.map(s => s.name)} placeholder="e.g. Tech, Finance..." />
        </div>
        <div className="form-group" style={{ marginBottom: 8 }}>
          <label>Country</label>
          <select className="form-input" value={company.country || ''} onChange={e => update('country', e.target.value)} style={{ cursor: 'pointer' }}>
            <option value="">Select country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Company LinkedIn</label>
        <input type="text" className="form-input" value={company.linkedin || ''} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/company/..." />
      </div>
    </div>
  );
}

function TagsInput({ label, tags, setTags, allSuggestions, placeholder }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const handleChange = (val) => {
    setInput(val);
    if (val.length >= 2 && allSuggestions) {
      setSuggestions(allSuggestions.filter(s => s.toLowerCase().startsWith(val.toLowerCase()) && !tags.includes(s)).slice(0, 6));
    } else { setSuggestions([]); }
  };
  const addTag = (name) => {
    const val = name || input.trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput(''); setSuggestions([]);
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !input && tags.length > 0) setTags(tags.slice(0, -1));
  };
  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tags.map(s => <span className="tag tag-skill" key={s} style={{ cursor: 'pointer' }} onClick={() => setTags(tags.filter(t => t !== s))}>{s} ×</span>)}
      </div>
      <div className="autocomplete-wrapper">
        <input type="text" className="form-input" value={input} onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={() => setTimeout(() => setSuggestions([]), 200)} placeholder={placeholder} />
        {suggestions.length > 0 && (
          <div className="autocomplete-list">
            {suggestions.map(s => <div className="autocomplete-item" key={s} onMouseDown={() => addTag(s)}>{s}</div>)}
          </div>
        )}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--dark-muted)', marginTop: 4 }}>Press Enter or comma to add. Click to remove.</div>
    </div>
  );
}

function NotificationToggle({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--dark-muted)' }}>{description}</div>
      </div>
      <div onClick={() => onChange(!checked)} style={{
        width: 44, height: 26, borderRadius: 13, cursor: 'pointer',
        background: checked ? 'var(--dark-text)' : 'rgba(0,0,0,0.12)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 12
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: checked ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
          position: 'absolute', top: 3, left: checked ? 21 : 3, transition: 'left 0.2s'
        }} />
      </div>
    </div>
  );
}

export default function EditProfile() {
  const { userProfile, updateUserProfile, currentUser, getAllSkills } = useAuth();
  const navigate = useNavigate();
  const [allSkills, setAllSkills] = useState([]);
  const fileRef = useRef();
  const [form, setForm] = useState({
    displayName: '', bio: '', photoURL: '',
    birthday: '', gender: '', country: '', city: '',
    personalLinkedin: '',
    companies: [{ name: '', website: '', field: '', country: '', linkedin: '' }],
    skills: [], hobbies: []
  });
  const [notifs, setNotifs] = useState({ news: true, topicReplies: true, threadReplies: true, newMembers: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const p = userProfile;
      let companies = p.companies || [];
      if (companies.length === 0 && p.company) companies = [{ name: p.company, website: p.website || '', field: '', country: '', linkedin: '' }];
      if (companies.length === 0) companies = [{ name: '', website: '', field: '', country: '', linkedin: '' }];
      companies = companies.map(c => typeof c === 'string' ? { name: c, website: '', field: '', country: '', linkedin: '' } : c);
      setForm({
        displayName: p.displayName || '', bio: p.bio || '', photoURL: p.photoURL || '',
        birthday: p.birthday || '', gender: p.gender || '',
        country: p.country || (p.locations?.[0] || p.location || ''),
        city: p.city || '', personalLinkedin: p.personalLinkedin || (p.linkedins?.[0] || ''),
        companies, skills: p.skills || [], hobbies: p.hobbies || []
      });
      if (p.notifications) setNotifs({ ...notifs, ...p.notifications });
    }
    getAllSkills().then(setAllSkills);
  }, [userProfile]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm({ ...form, photoURL: ev.target.result });
    reader.readAsDataURL(file);
  };

  const updateCompany = (i, comp) => { const c = [...form.companies]; c[i] = comp; setForm({ ...form, companies: c }); };
  const removeCompany = (i) => setForm({ ...form, companies: form.companies.filter((_, idx) => idx !== i) });
  const addCompany = () => setForm({ ...form, companies: [...form.companies, { name: '', website: '', field: '', country: '', linkedin: '' }] });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, companies: form.companies.filter(c => c.name), notifications: notifs };
    await updateUserProfile(currentUser.uid, data);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Edit Profile</h1>
      <p className="page-subtitle">Let others know who you are and what you bring to the circle</p>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48, alignItems: 'start' }}>

          {/* LEFT COLUMN — Profile */}
          <div>
            {/* Photo */}
            <div className="form-group">
              <label>Profile Picture</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="avatar-upload" onClick={() => fileRef.current.click()} style={{ width: 80, height: 80 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--dark-text)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, overflow: 'hidden' }}>
                    {form.photoURL ? <img src={form.photoURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (form.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?')}
                  </div>
                  <div className="avatar-upload-overlay" style={{ width: 80, height: 80 }}>Change</div>
                  <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--dark-muted)' }}>Click to upload</span>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-input" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Birthday</label>
                <input type="date" className="form-input" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={{ cursor: 'pointer' }}>
                  <option value="">Select</option>
                  <option value="M">Boy</option>
                  <option value="F">Girl</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Country</label>
                <select className="form-input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} style={{ cursor: 'pointer' }}>
                  <option value="">Select country</option>
                  {COUNTRIES.filter(c => c !== 'Online').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Amsterdam" />
              </div>
            </div>

            <div className="form-group">
              <label>Personal LinkedIn</label>
              <input type="text" className="form-input" value={form.personalLinkedin} onChange={e => setForm({ ...form, personalLinkedin: e.target.value })} placeholder="https://linkedin.com/in/yourname" />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-input" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell the group about yourself..." rows={3} />
            </div>

            <TagsInput label="Skills & Expertise" tags={form.skills} setTags={s => setForm({ ...form, skills: s })}
              allSuggestions={allSkills.map(s => s.name)} placeholder="e.g. Marketing, React, Fundraising..." />

            <TagsInput label="Hobbies & Interests" tags={form.hobbies} setTags={h => setForm({ ...form, hobbies: h })}
              allSuggestions={[]} placeholder="e.g. Running, Chess, Photography..." />

            {/* Companies */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Companies</label>
              {form.companies.map((comp, i) => (
                <CompanyBlock key={i} company={comp} onChange={c => updateCompany(i, c)}
                  onRemove={() => removeCompany(i)} canRemove={form.companies.length > 1} allSkills={allSkills} />
              ))}
              <button className="multi-field-add" onClick={addCompany} type="button">+ Add another company</button>
            </div>
          </div>

          {/* RIGHT COLUMN — Notifications */}
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.25)', borderRadius: 'var(--radius)',
              border: '1px solid rgba(0,0,0,0.06)', padding: '20px 22px',
              position: 'sticky', top: 84
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Email Notifications</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--dark-muted)', marginBottom: 12 }}>Choose what you want to be notified about</p>

              <NotificationToggle label="News updates" description="When someone shares a news item"
                checked={notifs.news} onChange={v => setNotifs({ ...notifs, news: v })} />
              <NotificationToggle label="Replies to your topics" description="When someone replies to a topic you started"
                checked={notifs.topicReplies} onChange={v => setNotifs({ ...notifs, topicReplies: v })} />
              <NotificationToggle label="Thread activity" description="Replies in topics where you've also replied"
                checked={notifs.threadReplies} onChange={v => setNotifs({ ...notifs, threadReplies: v })} />
              <NotificationToggle label="New members" description="When someone new joins the circle"
                checked={notifs.newMembers} onChange={v => setNotifs({ ...notifs, newMembers: v })} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/profile/${currentUser.uid}`)}>View My Profile</button>
        </div>
      </form>
      {saved && <div className="toast">Profile saved ✓</div>}
    </div>
  );
}
