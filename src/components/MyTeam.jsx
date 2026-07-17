import { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut } from '@clerk/clerk-react';

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Executive', 'Other'];

export default function MyTeam() {
const { user, isLoaded } = useUser();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', title: '', department: '', annual_salary: '' });

  useEffect(() => {
    if (isLoaded && user) fetchEmployees();
  }, [isLoaded, user]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees/list', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return setError('Name is required.');
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/employees/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({
          ...form,
          annual_salary: form.annual_salary ? parseInt(form.annual_salary) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmployees(prev => [...prev, data.employee]);
      setForm({ name: '', title: '', department: '', annual_salary: '' });
      setShowForm(false);
    } catch (e) {
      setError(e.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  const grouped = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {});

  if (!isLoaded) return null;

  return (
    <>
    <SignedIn>
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>My Team</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>
            Add employees to quickly fill in meeting attendees.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">New Employee</div>
          {error && <div className="ai-error" style={{ marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Name *</label>
              <input
                className="input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Title</label>
              <input
                className="input"
                placeholder="Senior Engineer"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Department</label>
              <select
                className="input"
                value={form.department}
                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Annual Salary ($)</label>
              <input
                className="input"
                placeholder="85000"
                type="number"
                value={form.annual_salary}
                onChange={e => setForm(p => ({ ...p, annual_salary: e.target.value }))}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            {saving ? 'Saving…' : 'Save Employee'}
          </button>
        </div>
      )}

      {loading && <p style={{ color: 'var(--gray-500)' }}>Loading team…</p>}

      {!loading && employees.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>👥</p>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No employees yet</p>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Add your team members to get started.</p>
        </div>
      )}

      {Object.entries(grouped).map(([dept, emps]) => (
        <div key={dept} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {dept}
          </h2>
          {emps.map(emp => (
            <div key={emp.id} className="card" style={{ marginBottom: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{emp.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{emp.title}</div>
              </div>
              {emp.annual_salary && (
                <div style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
                  ${emp.annual_salary.toLocaleString()}/yr
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
    </SignedIn>
    <SignedOut>
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 16px' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>🔒</p>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sign in to manage your team</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
          Create a free account to save your employee roster and quickly fill in meeting attendees.
        </p>
      </div>
    </SignedOut>
    </>
  );
}