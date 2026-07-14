import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', marginTop: '20vh' }}>
          <h2 style={{ color: 'var(--accent-red)' }}>Oops, ocorreu um erro!</h2>
          <p className="text-muted" style={{ margin: '1rem 0' }}>Desculpe pelo transtorno. Tente recarregar a página.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Recarregar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
