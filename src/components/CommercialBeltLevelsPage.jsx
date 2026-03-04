import BeltSkillsTable from './BeltSkillsTable';
import SectionCard from './SectionCard';

export default function CommercialBeltLevelsPage() {
  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="rounded-xl border px-5 py-4" style={{ borderColor: 'rgba(141,198,63,0.3)', background: 'rgba(141,198,63,0.06)' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#8dc63f' }}>Commercial Belt Levels</p>
        <p className="text-sm text-slate-300">Skills required at each belt level for Commercial technicians. All skills from previous belt levels are expected to be maintained.</p>
      </div>

      {/* Commercial Service Skills */}
      <SectionCard title="Commercial Service — Skills by Belt Level">
        <BeltSkillsTable type="commercial_service" />
      </SectionCard>

      {/* Commercial Install Skills */}
      <SectionCard title="Commercial Install — Skills by Belt Level">
        <BeltSkillsTable type="commercial_install" />
      </SectionCard>

    </div>
  );
}
