import { useState, useRef, useEffect } from 'react';
import RosterTab from './RosterTab';
import ResidentialServiceTab from './ResidentialServiceTab';
import ResidentialInstallTab from './ResidentialInstallTab';
import CommercialTab from './CommercialTab';
import STDataTab from './STDataTab';
import PayDataTab from './PayDataTab';

const NAV_ITEMS = [
  { id: 'roster', label: 'Roster' },
  {
    label: '2026 Pay Plans',
    children: [
      { id: 'resi-service', label: 'Residential Service' },
      { id: 'resi-install', label: 'Residential Install' },
      { id: 'commercial',   label: 'Commercial' },
    ],
  },
  {
    label: '2025 Data',
    children: [
      { id: 'st-data',  label: '2025 ST Data' },
      { id: 'pay-data', label: '2025 Pay Data' },
    ],
  },
];

function DropdownMenu({ item, activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isActive = item.children.some((c) => c.id === activeTab);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
        style={{
          color: isActive ? '#8dc63f' : '#94a3b8',
          background: isActive ? 'rgba(141,198,63,0.08)' : 'transparent',
          borderBottom: isActive ? '3px solid #8dc63f' : '3px solid transparent',
          fontFamily: "'Barlow', sans-serif",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontSize: 12,
        }}
      >
        {item.label}
        <span style={{ fontSize: 10, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 z-50 rounded-b-xl overflow-hidden shadow-xl"
          style={{ background: '#0d2b4e', border: '1px solid rgba(141,198,63,0.3)', minWidth: 200 }}
        >
          {item.children.map((child) => (
            <button
              key={child.id}
              onClick={() => { setActiveTab(child.id); setOpen(false); }}
              className="w-full text-left px-5 py-3 text-xs font-semibold tracking-wide transition-all cursor-pointer"
              style={{
                color: activeTab === child.id ? '#8dc63f' : '#94a3b8',
                background: activeTab === child.id ? 'rgba(141,198,63,0.1)' : 'transparent',
                borderLeft: activeTab === child.id ? '3px solid #8dc63f' : '3px solid transparent',
                fontFamily: "'Barlow', sans-serif",
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
              onMouseOver={(e) => { if (activeTab !== child.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseOut={(e) => { if (activeTab !== child.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <div className="min-h-screen" style={{ background: '#0a1f3a', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(105deg, #0d2b4e 55%, #8dc63f 100%)',
          borderBottom: '3px solid #8dc63f',
        }}
      >
        {/* Diagonal stripe overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -55deg,
              transparent,
              transparent 18px,
              rgba(255,255,255,0.035) 18px,
              rgba(255,255,255,0.035) 20px
            )`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center gap-3 sm:gap-6">
          <img
            src="/logo.png"
            alt="A1 Door Logo"
            className="h-12 sm:h-[90px]"
            style={{ width: 'auto', flexShrink: 0 }}
          />
          <div>
            <div className="flex items-baseline gap-3">
              <span
                className="text-xl sm:text-[32px]"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  color: '#8dc63f',
                  letterSpacing: '0.08em',
                }}
              >
                2026 PAY PLANS
              </span>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <div style={{ color: '#0d2b4e', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>
              CONFIDENTIAL
            </div>
            <div style={{ color: '#0d2b4e', fontSize: 12 }}>Internal Use Only</div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ background: '#0d2b4e', borderBottom: '2px solid rgba(141,198,63,0.25)' }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide whitespace-nowrap cursor-pointer transition-all"
                  style={{
                    color: activeTab === item.id ? '#8dc63f' : '#94a3b8',
                    background: activeTab === item.id ? 'rgba(141,198,63,0.08)' : 'transparent',
                    borderBottom: activeTab === item.id ? '3px solid #8dc63f' : '3px solid transparent',
                    fontFamily: "'Barlow', sans-serif",
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {activeTab === 'roster'       && <RosterTab />}
        {activeTab === 'resi-service' && <ResidentialServiceTab />}
        {activeTab === 'resi-install' && <ResidentialInstallTab />}
        {activeTab === 'commercial'   && <CommercialTab />}
        {activeTab === 'st-data'      && <STDataTab />}
        {activeTab === 'pay-data'     && <PayDataTab />}
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-4 text-center text-xs"
        style={{
          borderTop: '1px solid rgba(141,198,63,0.15)',
          color: '#475569',
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        © 2026 A1 Door · a1door.com · All rights reserved
      </footer>
    </div>
  );
}
