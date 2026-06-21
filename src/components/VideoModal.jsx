import { X, ExternalLink } from 'lucide-react';

export function VideoModal({ searchQuery, onClose }) {
  const query = encodeURIComponent(searchQuery || 'como fazer exercício corretamente');
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      
      <div className="glass-panel animate-fade-in" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '1.5rem', zIndex: 101 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>
        
        <h3 style={{ marginBottom: '1rem', paddingRight: '2rem' }}>Vídeos de Execução</h3>
        
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed?listType=search&list=${query}`} 
            title="YouTube video search" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        <a 
          href={`https://www.youtube.com/results?search_query=${query}+shorts`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}
        >
          Abrir no App do YouTube <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}
