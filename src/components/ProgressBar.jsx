export function ProgressBar({ label, current, max, color }) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100)) || 0;
  const isOver = current > max;
  const barColor = isOver ? 'var(--accent-red)' : color;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="flex justify-between text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
        <span>{label}</span>
        <span>{current} / {max} {isOver && <span style={{ color: 'var(--accent-red)' }}>(Excedeu)</span>}</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: barColor,
            transition: 'width 0.5s ease-out, background 0.3s ease'
          }} 
        />
      </div>
    </div>
  );
}
