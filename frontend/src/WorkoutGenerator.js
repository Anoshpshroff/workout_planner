import React, { useState } from 'react';
import { generateWorkout } from './api';

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
  maxWidth: '500px',
  width: '100%',
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

const inputStyle = {
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: '1rem',
  marginBottom: '1rem',
  fontSize: 16,
  width: '100%',
  boxSizing: 'border-box',
};

const buttonStyle = {
  background: colors.accent,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '1rem 2rem',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  width: '100%',
  marginBottom: '1rem',
};

const suggestionStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const suggestionButtonStyle = {
  background: colors.bg,
  color: colors.accent2,
  border: `1px solid ${colors.border}`,
  borderRadius: 20,
  padding: '0.5rem 1rem',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

function WorkoutGenerator({ onClose, onSuccess }) {
  const [workoutType, setWorkoutType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = [
    'Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body',
    'Full Body', 'Arms', 'Chest', 'Back', 'Shoulders', 'Core',
    'HIIT', 'Strength', 'Hypertrophy', 'Powerlifting', 'Beginner'
  ];

  const handleGenerate = async () => {
    if (!workoutType.trim()) {
      setError('Please enter a workout type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await generateWorkout(workoutType);
      onSuccess(result);
      onClose();
    } catch (err) {
      console.error('Workout generation error:', err);
      if (err.message.includes('503')) {
        setError('AI service is temporarily overloaded. Please try again in a few minutes.');
      } else {
        setError('Failed to generate workout. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setWorkoutType(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>
          ×
        </button>
        
        <h2 style={{ color: colors.accent, marginBottom: '1rem', marginTop: 0 }}>
          🤖 Generate AI Workout
        </h2>
        
        <p style={{ color: colors.textLight, marginBottom: '1.5rem' }}>
          Tell me what type of workout you want, and I'll create a complete workout plan with exercises for you!
        </p>

        {error && (
          <div style={{ color: colors.accent, marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ color: colors.textLight, fontSize: '14px', marginBottom: '0.5rem', display: 'block' }}>
            Workout Type
          </label>
          <input
            style={inputStyle}
            type="text"
            placeholder="e.g., Push Day, Full Body, Leg Day, HIIT..."
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: colors.textLight, fontSize: '14px', marginBottom: '0.5rem', display: 'block' }}>
            Quick Suggestions
          </label>
          <div style={suggestionStyle}>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                style={suggestionButtonStyle}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          style={{
            ...buttonStyle,
            background: loading ? colors.textLight : `linear-gradient(135deg, ${colors.accent2} 0%, ${colors.accent} 100%)`,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          disabled={loading}
        >
          {loading ? '🧠 Generating Workout...' : '✨ Generate Workout'}
        </button>

        <p style={{ color: colors.textLight, fontSize: '12px', textAlign: 'center', margin: 0 }}>
          AI will create a complete workout with exercises, sets, reps, and weights
        </p>
      </div>
    </div>
  );
}

export default WorkoutGenerator;
