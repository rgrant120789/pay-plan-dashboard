export default function SectionCard({ title, children, accent = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden">
      <div
        className="px-3 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm tracking-widest uppercase"
        style={{
          background: accent
            ? 'linear-gradient(90deg, #8dc63f 0%, #6aaa1f 100%)'
            : 'linear-gradient(90deg, #0d2b4e 0%, #1e4d8c 100%)',
          color: accent ? '#0d2b4e' : '#8dc63f',
        }}
      >
        {title}
      </div>
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  );
}
