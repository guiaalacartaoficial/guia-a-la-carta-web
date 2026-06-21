import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("[ErrorBoundary Catch Logged]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', background: '#f8f7f2', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', margin: '15px 0' }}>
          <h4 style={{ color: '#0A3B31', marginBottom: '10px' }}>Operación temporalmente no disponible</h4>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0E5B4C',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
