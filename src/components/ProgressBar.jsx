export function ProgressBar({ label, current, max, color }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
  const isOver = max > 0 && current > max;
  const barColor = isOver ? 'var(--status-danger)' : (color || 'var(--accent-primary)');

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="flex justify-between text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: '500' }}>
        <span>{label}</span>
        <span>
          {current} / {max} {isOver && <span style={{ color: 'var(--status-danger)', fontWeight: 'bold' }}>(Excedeu)</span>}
        </span>
      </div>
      <div style={{ 
        width: '100%', 
        height: '10px', 
        background: '#0D1424', 
        borderRadius: '9999px', 
        overflow: 'hidden',
        boxShadow: 'inset 1px 1px 3px #05070D',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: barColor,
            borderRadius: '9999px',
            boxShadow: `0 0 10px ${barColor}60`,
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease'
          }} 
        />
      </div>
    </div>
  );
}
