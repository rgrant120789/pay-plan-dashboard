import BeltBadge from './BeltBadge';

export default function BeltLevelsTable({ levels }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#8dc63f] text-[#0d2b4e]">
            <th className="px-4 py-2.5 text-left font-bold tracking-wide">Title</th>
            <th className="px-4 py-2.5 text-left font-bold tracking-wide">Belt</th>
            <th className="px-4 py-2.5 text-left font-bold tracking-wide">Base Pay</th>
            <th className="px-4 py-2.5 text-left font-bold tracking-wide">Experience</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((row, i) => (
            <tr
              key={row.title}
              className={i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}
            >
              <td className="px-4 py-2.5 text-white font-semibold">{row.title}</td>
              <td className="px-4 py-2.5"><BeltBadge belt={row.belt} /></td>
              <td className="px-4 py-2.5 text-[#8dc63f] font-bold">{row.basePay}</td>
              <td className="px-4 py-2.5 text-slate-300">{row.tenure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
