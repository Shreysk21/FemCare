import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FemCare Crash Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#fff1f2',
          color: '#1e293b'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(225, 29, 72, 0.15)',
            border: '1px solid #fecdd3',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌸</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#be123c', margin: '0 0 8px 0' }}>
              FemCare Notice
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '16px' }}>
              A UI rendering error occurred:
            </p>
            <div style={{
              background: '#fef2f2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'monospace',
              marginBottom: '20px',
              wordBreak: 'break-word',
              textAlign: 'left',
              border: '1px solid #fee2e2'
            }}>
              {this.state.error?.toString()}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                  } catch (e) {}
                  window.location.reload();
                }}
                style={{
                  background: 'linear-gradient(to right, #db2777, #be185d)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear Cache & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
