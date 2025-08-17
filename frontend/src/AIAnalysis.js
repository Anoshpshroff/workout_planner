import React, { useState } from 'react';
import { analyzeWorkout } from './api';

const colors = {
  bg: '#181A20',
  card: '#23262F',
  accent: '#FF6B6B',
  accent2: '#FFD166',
  text: '#F4F4F4',
  textLight: '#B0B0B0',
  border: '#31343B',
};

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '2rem',
};

const modalContentStyle = {
  background: colors.card,
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(0,0,0,0.24)',
  padding: '2rem',
  maxWidth: '800px',
  maxHeight: '80vh',
  overflow: 'auto',
  border: `1px solid ${colors.border}`,
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  color: colors.accent,
  fontSize: '24px',
  cursor: 'pointer',
  padding: '0.5rem',
};

const analysisStyle = {
  color: colors.text,
  lineHeight: 1.6,
  fontSize: '16px',
  whiteSpace: 'pre-wrap',
};

const loadingStyle = {
  textAlign: 'center',
  color: colors.accent2,
  fontSize: '18px',
  padding: '2rem',
};

function AIAnalysis({ workoutId, workoutName, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await analyzeWorkout(workoutId);
      setAnalysis(result.analysis);
    } catch (err) {
      setError('Failed to analyze workout. Please try again.');
      console.error('AI Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start analysis when component mounts
  React.useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          ×
        </button>
        
        <h2 style={{ color: colors.accent, marginBottom: '1rem', marginTop: 0 }}>
          🤖 AI Workout Analysis
        </h2>
        
        <h3 style={{ color: colors.accent2, marginBottom: '1.5rem', fontSize: '20px' }}>
          {workoutName}
        </h3>
        
        {loading && (
          <div style={loadingStyle}>
            <div>🧠 Analyzing your workout...</div>
            <div style={{ fontSize: '14px', marginTop: '0.5rem' }}>
              This may take a few seconds
            </div>
          </div>
        )}
        
        {error && (
          <div style={{ color: colors.accent, textAlign: 'center', padding: '1rem' }}>
            {error}
            <br />
            <button 
              onClick={handleAnalyze}
              style={{
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.5rem 1rem',
                marginTop: '1rem',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        )}
        
        {analysis && !loading && (
          <div style={analysisStyle}>
            {analysis}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIAnalysis;

