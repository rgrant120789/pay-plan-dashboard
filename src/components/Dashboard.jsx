import { useState, useRef, useEffect } from 'react';
import RosterTab from './RosterTab';
import ResidentialServiceTab from './ResidentialServiceTab';
import ResidentialInstallTab from './ResidentialInstallTab';
import CommercialTab from './CommercialTab';
import STDataTab from './STDataTab';
import PayDataTab from './PayDataTab';
import ResidentialBeltLevelsPage from './ResidentialBeltLevelsPage';
import CommercialBeltLevelsPage from './CommercialBeltLevelsPage';
import BehaviorsScorecardPage from './BehaviorsScorecardPage';
import PresentationsHome from './PresentationsHome';
import PayrollCalcTab from './PayrollCalcTab';
import ResidentialServicePresentation from './ResidentialServicePresentation';
import ResidentialInstallPresentation from './ResidentialInstallPresentation';
import CommercialPresentation from './CommercialPresentation';

const DASHBOARD_PRINT_STYLE = [
  '@media print {',
  '  body, html, #root, [data-print-root] { background: #fff !important; color: #111 !important; margin: 0 !important; padding: 0 !important; }',
  '  .no-print { display: none !important; }',
  '  .print-content { display: block !important; margin: 0 !important; padding: 8px !important; max-width: 100% !important; }',
  '  .print-content * { background: transparent !important; border-radius: 0 !important; box-shadow: none !important; color: #111 !important; }',
  '  .print-content table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 18pt; }',
  '  .print-content th { background: #1e3a5f !important; color: #fff !important; padding: 5px 8px; text-align: left; font-size: 9pt; }',
  '  .print-content td { padding: 4px 8px; border-bottom: 1px solid #ddd; font-size: 9pt; }',
  '  .print-content tr:nth-child(even) td { background: #f5f5f5 !important; }',
  '  .print-content tfoot td { background: #e8f5d0 !important; font-weight: 700; border-top: 2px solid #888; }',
  '  .print-content .space-y-6 > * { margin-bottom: 18pt; }',
  '  .print-content [class*="rounded"] { border: none !important; background: transparent !important; }',
  '  .print-section-heading { font-size: 12pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 2px solid #333; padding-bottom: 3px; margin-bottom: 6px; color: #111 !important; }',
  '}',
].join('\n')

const NAV_ITEMS = [
  { id: 'payroll-calc', label: 'Payroll Calculator' },
  {
    label: 'Presentations',
    homeId: 'presentations',
    children: [
      { id: 'pres-resi-service', label: 'Residential Service' },
      { id: 'pres-resi-install', label: 'Residential Install' },
      { id: 'pres-commercial',   label: 'Commercial' },
    ],
  },
  { id: 'roster', label: 'Roster' },
  {
    label: 'New Pay Plans',
    children: [
      { id: 'resi-service', label: 'Residential Service' },
      { id: 'resi-install', label: 'Residential Install' },
      { id: 'commercial',   label: 'Commercial' },
    ],
  },
  {
    label: 'Belt Levels',
    children: [
      { id: 'belt-residential', label: 'Residential Belt Levels' },
      { id: 'belt-commercial',  label: 'Commercial Belt Levels' },
      { id: 'behaviors-scorecard', label: 'Behaviors Scorecard' },
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
  const isActive = item.children.some((c) => c.id === activeTab) || activeTab === item.homeId;

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => item.homeId && setActiveTab(item.homeId)}
        className="relative px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide whitespace-nowrap transition-all flex items-center gap-1"
        style={{
          cursor: item.homeId ? 'pointer' : 'default',
          color: isActive ? '#8dc63f' : '#cbd5e1',
          background: isActive ? 'rgba(141,198,63,0.08)' : 'transparent',
          borderBottom: isActive ? '3px solid #8dc63f' : '3px solid transparent',
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontSize: 15,
        }}
      >
        {item.label}
        <span style={{ fontSize: 11, marginLeft: 3 }}>{open ? '▲' : '▼'}</span>
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
  const [activeTab, setActiveTab] = useState('payroll-calc');

  useEffect(() => {
    if (document.getElementById('dashboard-print-style')) return;
    const el = document.createElement('style');
    el.id = 'dashboard-print-style';
    el.textContent = DASHBOARD_PRINT_STYLE;
    document.head.appendChild(el);
  }, []);

  return (
    <div data-print-root className="min-h-screen" style={{ background: '#0a1f3a', fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <header className="no-print"
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
      <nav className="no-print" style={{ background: '#0d2b4e', borderBottom: '2px solid rgba(141,198,63,0.25)', overflow: 'visible', position: 'relative', zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex gap-0 overflow-x-auto overflow-y-visible scrollbar-none" style={{ overflow: 'visible' }}>
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <DropdownMenu key={item.label} item={item} activeTab={activeTab} setActiveTab={setActiveTab} />
              ) : (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="relative px-3 sm:px-6 py-3 sm:py-4 font-semibold tracking-wide whitespace-nowrap cursor-pointer transition-all"
                  style={{
                    color: activeTab === item.id ? '#8dc63f' : '#cbd5e1',
                    background: activeTab === item.id ? 'rgba(141,198,63,0.08)' : 'transparent',
                    borderBottom: activeTab === item.id ? '3px solid #8dc63f' : '3px solid transparent',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontSize: 15,
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
      <main className="print-content max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {activeTab === 'payroll-calc' && <PayrollCalcTab />}
        {activeTab === 'roster'       && <RosterTab />}
        {activeTab === 'resi-service' && <ResidentialServiceTab />}
        {activeTab === 'resi-install' && <ResidentialInstallTab />}
        {activeTab === 'commercial'   && <CommercialTab />}
        {activeTab === 'st-data'      && <STDataTab />}
        {activeTab === 'pay-data'          && <PayDataTab />}
        {activeTab === 'belt-residential'    && <ResidentialBeltLevelsPage />}
        {activeTab === 'belt-commercial'     && <CommercialBeltLevelsPage />}
        {activeTab === 'behaviors-scorecard' && <BehaviorsScorecardPage />}
        {activeTab === 'presentations'       && <PresentationsHome setActiveTab={setActiveTab} />}
        {activeTab === 'pres-resi-service'   && <ResidentialServicePresentation setActiveTab={setActiveTab} />}
        {activeTab === 'pres-resi-install'   && <ResidentialInstallPresentation setActiveTab={setActiveTab} />}
        {activeTab === 'pres-commercial'     && <CommercialPresentation setActiveTab={setActiveTab} />}
      </main>

      {/* Footer */}
      <footer className="no-print mt-8 py-4 text-center text-xs"
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
