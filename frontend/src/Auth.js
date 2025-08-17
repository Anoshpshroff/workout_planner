import React, { useState } from 'react';
import { login, register } from './api';

const colors = {
  bg: '#181A20',
  card: '#23262F',
  accent: '#FF6B6B',
  accent2: '#FFD166',
  text: '#F4F4F4',
  textLight: '#B0B0B0',
  border: '#31343B',
};

const authStyle = {
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${colors.bg} 60%, ${colors.accent2} 100%)`,
  fontFamily: 'Montserrat, sans-serif',
  color: colors.text,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
};

const cardStyle = {
  background: colors.card,
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  padding: '3rem',
  width: '100%',
  maxWidth: 400,
  border: `1px solid ${colors.border}`,
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

const linkStyle = {
  color: colors.accent2,
  textDecoration: 'none',
  fontWeight: 700,
  cursor: 'pointer',
};

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userData;
      if (isLogin) {
        userData = await login(formData.username, formData.password);
      } else {
        userData = await register(formData.username, formData.password, formData.email);
      }
      onLogin(userData);
    } catch (err) {
      setError(isLogin ? 'Invalid username or password' : 'Registration failed. Username might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyle}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: 'center', color: colors.accent, marginBottom: '2rem' }}>
          Workout Tracker
        </h1>
        <h2 style={{ textAlign: 'center', color: colors.accent2, marginBottom: '2rem' }}>
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && (
          <div style={{ color: colors.accent, marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          {!isLogin && (
            <input
              style={inputStyle}
              type="email"
              name="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={handleChange}
            />
          )}
          
          <input
            style={inputStyle}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: 0 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={linkStyle}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
