import { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';

const INDUSTRIES = ['General', 'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Nonprofit', 'Other'];

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && user) fetchProfile();
  }, [isLoaded, user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile/get', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.profile) {
        setCompany(data.profile.company || '');
        setIndustry(data.profile.industry || '');
      }
    } catch (e) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ company, industry }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <>
      <SignedIn>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Profile Settings</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
            Manage your account and preferences.
          </p>

          <div className="card">
            <div className="card-title">Account</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'var(--navy)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18,
              }}>
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{user?.fullName || 'No name set'}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{user?.emailAddresses[0]?.emailAddress}</div>
              </div>
            </div>
          </div>

          <div className="card section-gap">
            <div className="card-title">Company Details</div>
            {loading ? (
              <p style={{ color: 'var(--gray-500)' }}>Loading…</p>
            ) : (
              <>
                {error && <div className="ai-error" style={{ marginBottom: 12 }}>{error}</div>}
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Company Name</label>
                    <input
                      className="input"
                      placeholder="Acme Inc."
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Industry</label>
                    <select
                      className="input"
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ marginTop: 16 }}
                >
                  {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 16px' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🔒</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sign in to view your profile</h2>
        </div>
      </SignedOut>
    </>
  );
}