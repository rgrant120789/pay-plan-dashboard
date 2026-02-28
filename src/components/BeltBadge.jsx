const beltColors = {
  Gray:  { bg: '#9ca3af', text: '#fff' },
  Blue:  { bg: '#3b82f6', text: '#fff' },
  Green: { bg: '#84cc16', text: '#1e3a5f' },
  Brown: { bg: '#92400e', text: '#fff' },
  Black: { bg: '#111827', text: '#fff' },
};

export default function BeltBadge({ belt }) {
  const colors = beltColors[belt] || { bg: '#ccc', text: '#000' };
  return (
    <span
      style={{ backgroundColor: colors.bg, color: colors.text }}
      className="inline-block px-2 py-0.5 rounded text-xs font-bold tracking-wide"
    >
      {belt}
    </span>
  );
}
