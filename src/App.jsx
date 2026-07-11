import { useState } from 'react';
import './App.css';
import SimpleMode from './components/SimpleMode';
import AdvancedMode from './components/AdvancedMode';
import MyFootprintMode from './components/MyFootprintMode';
import MyTeam from './components/MyTeam';

const MODES = [
  { id: 'simple',   label: 'Simple',       description: 'Quick cost estimate with average salary' },
  { id: 'advanced', label: 'Advanced',      description: 'Build the room — cost breakdown per person' },
  { id: 'footprint', label: 'My Footprint', description: 'Your personal meeting cost & ROI' },
  { id: 'myteam', label: 'My Team', description: 'Manage your employee roster' },
];

export default function App() {
  const [mode, setMode] = useState(() =>
    window.location.hash.startsWith('#share=') ? 'advanced' : 'simple'
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-logo">
              True Meeting Cost<span className="header-dot">.</span>
            </span>
            <span className="header-tagline">Know what your meetings really cost.</span>
          </div>
          <nav className="mode-tabs" role="tablist" aria-label="Calculator mode">
            {MODES.map(m => (
              <button
                key={m.id}
                role="tab"
                aria-selected={mode === m.id}
                className={`mode-tab ${mode === m.id ? 'active' : ''}`}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main" role="tabpanel">
        {mode === 'simple'    && <SimpleMode />}
        {mode === 'advanced'  && <AdvancedMode />}
        {mode === 'footprint' && <MyFootprintMode />}
        {mode === 'myteam' && <MyTeam />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--gray-200)',
        padding: '20px 32px',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--gray-400)',
        background: 'white',
      }}>
        <span style={{ color: 'var(--navy)', fontWeight: 600 }}>truemeetingcost.com</span>
        {' '}&mdash; Know what your meetings really cost.
        <span style={{ marginLeft: 24 }}>
          Calculations based on 2,080 working hours/year. Figures are estimates for planning purposes.
        </span>
      </footer>
    </div>
  );
}
