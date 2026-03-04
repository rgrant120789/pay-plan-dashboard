export default function PresentationsHome({ setActiveTab }) {
  const cards = [
    {
      id: 'pres-resi-service',
      title: 'Residential Service',
      subtitle: 'Commission-based pay + spiffs',
      description: 'How commission works, service levels, belt ranks, and bonus opportunities for Residential Service technicians.',
      color: '#8dc63f',
    },
    {
      id: 'pres-resi-install',
      title: 'Residential Install',
      subtitle: 'Hourly pay + monthly bonus goals',
      description: 'Guaranteed hourly pay with up to $3,000/mo in bonus opportunities for Residential Install technicians.',
      color: '#3b82f6',
    },
    {
      id: 'pres-commercial',
      title: 'Commercial',
      subtitle: 'Hourly pay + monthly bonus goals',
      description: 'Guaranteed hourly pay with up to $3,000/mo in bonus opportunities across Service, Install, and Entry focus areas.',
      color: '#a855f7',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center py-6">
        <h1
          className="text-3xl sm:text-4xl font-black tracking-widest uppercase mb-2"
          style={{ color: '#8dc63f', fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          2026 Pay Plan Presentations
        </h1>
        <p className="text-slate-400 text-sm">Select a department to view the technician presentation.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveTab(card.id)}
            className="text-left rounded-2xl p-6 transition-all group"
            style={{
              background: 'rgba(13,43,78,0.8)',
              border: `2px solid ${card.color}40`,
              cursor: 'pointer',
            }}
            onMouseOver={(e) => { e.currentTarget.style.border = `2px solid ${card.color}`; e.currentTarget.style.background = `rgba(13,43,78,1)`; }}
            onMouseOut={(e) => { e.currentTarget.style.border = `2px solid ${card.color}40`; e.currentTarget.style.background = 'rgba(13,43,78,0.8)'; }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg font-black"
              style={{ background: `${card.color}22`, color: card.color }}
            >
              ▶
            </div>
            <h2
              className="text-lg font-black tracking-wide uppercase mb-1"
              style={{ color: card.color, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20 }}
            >
              {card.title}
            </h2>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#64748b' }}>
              {card.subtitle}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
            <div className="mt-4 text-xs font-bold tracking-widest uppercase" style={{ color: card.color }}>
              View Presentation →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
