const BELT_COLORS = {
  Gray:  { bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.35)', text: '#9ca3af', dot: '#9ca3af' },
  Blue:  { bg: 'rgba(59,130,246,0.10)',  border: 'rgba(59,130,246,0.35)',  text: '#60a5fa', dot: '#3b82f6' },
  Green: { bg: 'rgba(132,204,22,0.10)',  border: 'rgba(132,204,22,0.35)',  text: '#86efac', dot: '#84cc16' },
  Brown: { bg: 'rgba(146,64,14,0.15)',   border: 'rgba(146,64,14,0.45)',   text: '#d97706', dot: '#92400e' },
  Black: { bg: 'rgba(229,231,235,0.08)', border: 'rgba(229,231,235,0.25)', text: '#e5e7eb', dot: '#e5e7eb' },
};

const BELTS = ['Gray', 'Blue', 'Green', 'Brown', 'Black'];

const SKILLS = {
  service: {
    Gray:  ['Tool Knowledge', 'Service Titan / Tablet', 'Door and GDO Parts Identification', 'GDO programming / MyQ / HomeLink', 'Identify Spring Systems', 'Knowledge of All GDOs', 'Gauge Springs', 'Springs / IPPT', 'Install GDO Accessories'],
    Blue:  ['ALL OF ABOVE PLUS…', 'Assisted Install', 'Panel Replacement', 'Diagnostic Experience', 'Sales Basics (Pkgs, Pricing)', 'Reset Door Off Track', 'IPPT Calculations / Spring Conversions', 'Interact with customer to explain work performed', 'Install Spring Pads', 'Cut and Install barn and square cut w/s trim', 'Install GDO'],
    Green: ['ALL OF ABOVE PLUS…', 'Solo Install', 'New Door Product Knowledge (sales)', 'Diagnostic Repair (Assisted)', 'Sales Advanced (2/4 of Sales Process)', 'Drill Holes and Install Key Lock on Door'],
    Brown: ['ALL OF ABOVE PLUS…', 'Diagnostic Repair Unassisted', 'Sales Adv+ (4/4 of Sales Process)', 'Use of Field Pro and other Sales Tools'],
    Black: ['ALL OF ABOVE PLUS…', 'Diagnostic Excellence / Assist Others', 'Sales Mastery', 'Extensive Use / Contributions to Field Pro'],
  },
  install: {
    Gray:  ['Tool Knowledge', 'Service Titan / Tablet', 'Door and GDO Parts Identification', 'GDO programming / MyQ / HomeLink', 'Identify Spring Systems', 'Knowledge of All GDOs', 'Full Door Tear Down', 'Springs / IPPT', 'Install GDO (Drawbar, JackShaft)', 'Cut and Install barn and square cut w/s trim'],
    Blue:  ['ALL OF ABOVE PLUS…', 'Solo Install - Standard Lift', 'Panel Replacement', 'Diagnostic Experience', 'Reset Door Off Track', 'Drill Holes and Install Key Lock on Door', 'IPPT Calculations / Spring Conversions', 'Interact with customer to explain work performed'],
    Green: ['ALL OF ABOVE PLUS…', 'Solo Install - LHR', 'New Door Product Knowledge (install)', 'New Door Product Knowledge (sales)', 'Diagnostic Repair (Assisted)', 'Sales Basics (Pkgs, Pricing)', 'Gauge, measure and cut springs, Install Cones'],
    Brown: ['ALL OF ABOVE PLUS…', 'Diagnostic Repair Unassisted', 'Solo Install - High Lift'],
    Black: ['ALL OF ABOVE PLUS…', 'Diagnostic Excellence / Assist Others', 'Solo Install - ALL', 'Install Phone Consultations (from Sales/Service)'],
  },
  commercial_service: {
    Gray:  ['Tool Knowledge', 'Service Titan / Tablet', 'Identify Spring Systems', 'Springs / IPPT', 'Gauge Springs', 'Sectional Door Assembly', 'Rolling Steel Door Assembly', 'Commercial Operator Assembly', 'Commercial Operator Accessories'],
    Blue:  ['ALL OF ABOVE PLUS…', 'Basic Sectional Repairs & Diagnostics', 'Basic Rolling Steel Repairs & Diagnostics', 'Basic Fire Door Repairs & Testing', 'Commercial Operator Repairs & Diagnostics', 'Basic Slide Gate Operator Diagnostics', 'Basic Electrical Knowledge (High and Low)', 'Minor Dock Leveler Repairs & Diagnostics', 'Ability to Navigate through the Pricebook', 'Formulate Estimates in ST', 'Ability to Weld'],
    Green: ['ALL OF ABOVE PLUS…', 'Advanced Sectional Repairs', 'Advanced Slide Gate Operator Repairs & Diagnostics', 'Advanced Rolling Steel Repairs', 'Installation of Fire Doors and Shutters', 'Advanced Commercial Operator Repairs & Diagnostics', 'Advanced Dock Leveler Repairs & Diagnostics', 'Advanced Welding', 'Advanced Electrical Knowledge'],
    Brown: ['ALL OF ABOVE PLUS…', 'Advanced Diagnostics of All Brands of Doors and Operators', 'Basic High Speed Door Repairs & Diagnostics', 'Basic Diagnostics of all Specialty Doors', 'Basic Diagnostic of Entry Doors'],
    Black: ['ALL OF ABOVE PLUS…', 'Advanced High Speed Door Repairs & Diagnostics', 'Advanced Diagnostics of all Specialty Doors'],
  },
  commercial_install: {
    Gray:  ['Tool Knowledge', 'Service Titan / Tablet', 'Identify Spring Systems', 'Springs / IPPT', 'Gauge Springs', 'Sectional Door Assembly', 'Rolling Steel Door Assembly', 'Commercial Operator Assembly', 'Commercial Operator Accessories'],
    Blue:  ['ALL OF ABOVE PLUS…', 'Assist with Installation of Rolling Steel Doors/Counter Shutters', 'Assist with Installation of Rolling Fire Doors and Shutters', 'Installation of Sectional Doors 14\'x14\' or Smaller', 'Installation of Commercial Operators', 'Installation of Compression Seals and Shelters', 'Basic Electrical Knowledge (High & Low)', 'Ability to Weld'],
    Green: ['ALL OF ABOVE PLUS…', 'Installation of Sectional Doors 14\'x14\' or Larger', 'Installation of Slide Gate Operators', 'Installation of Rolling Steel Doors/Counter Shutters', 'Installation of Fire Doors and Shutters', 'Installation of Mechanical Dock Levelers and EODs', 'Installation of Trailer Restraints', 'Advanced Welding', 'Advanced Electrical Knowledge'],
    Brown: ['ALL OF ABOVE PLUS…', 'Installation of All Brands of Sectional/Rolling/Fire Doors', 'Installation of All Brands of Commercial Operators', 'Mechanical Installation of High Speed Doors', 'Basic Installation of Entry Doors'],
    Black: ['ALL OF ABOVE PLUS…', 'Advanced Installation of High Speed Doors including Wiring', 'Advanced Installation of All Specialty Doors'],
  },
};

function SkillList({ skills, belt }) {
  const c = BELT_COLORS[belt];
  return (
    <ul className="space-y-1 mt-2">
      {skills.map((skill, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          {skill.startsWith('ALL OF') ? (
            <span className="font-bold italic w-full" style={{ color: c.text }}>{skill}</span>
          ) : (
            <>
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              <span className="text-slate-300">{skill}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function BeltSkillsTable({ type = 'service' }) {
  const skills = SKILLS[type];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {BELTS.map((belt) => {
          const c = BELT_COLORS[belt];
          return (
            <div
              key={belt}
              className="rounded-xl p-3 border"
              style={{ background: c.bg, borderColor: c.border }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{ background: c.dot, color: belt === 'Brown' ? '#fff' : belt === 'Black' ? '#111' : '#fff', fontSize: 10 }}
                >
                  {belt}
                </span>
              </div>
              <SkillList skills={skills[belt]} belt={belt} />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500 mt-3 italic">
        * Peer approval required for belt advancement (blind vote).
      </p>
    </div>
  );
}
