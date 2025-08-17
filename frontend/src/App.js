import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import { getWorkouts, addWorkout, deleteWorkout, getExercises, addExercise, deleteExercise, isAuthenticated, logout } from './api';
import Auth from './Auth';
import AIAnalysis from './AIAnalysis';  
import WorkoutGenerator from './WorkoutGenerator'; 

// Google Fonts import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;400&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const colors = {
  bg: '#181A20',
  card: '#23262F',
  accent: '#FF6B6B',
  accent2: '#FFD166',
  text: '#F4F4F4',
  textLight: '#B0B0B0',
  border: '#31343B',
};

const appStyle = {
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${colors.bg} 60%, ${colors.accent2} 100%)`,
  fontFamily: 'Montserrat, sans-serif',
  color: colors.text,
  padding: 0,
  margin: 0,
};

const cardStyle = {
  background: colors.card,
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  padding: '2rem',
  margin: '2rem auto',
  maxWidth: 500,
  border: `1px solid ${colors.border}`,
};

const buttonStyle = {
  background: colors.accent,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '0.5rem 1.5rem',
  fontWeight: 700,
  fontSize: 16,
  marginLeft: 8,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const inputStyle = {
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: '0.5rem 1rem',
  marginRight: 8,
  marginBottom: 8,
  fontSize: 16,
};

const linkStyle = {
  color: colors.accent2,
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: 20,
  transition: 'color 0.2s',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const exerciseCard = {
  background: colors.bg,
  borderRadius: 12,
  padding: '1rem',
  margin: '1rem 0',
  border: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const labelStyle = {
  color: colors.textLight,
  fontWeight: 400,
  fontSize: 14,
  marginRight: 8,
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
};

function Header({ user, onLogout }) {
  return (
    <div style={headerStyle}>
      <h1 style={{ color: colors.accent, letterSpacing: 2, fontSize: 36, margin: 0 }}>
        Workout Tracker
      </h1>
      <div>
        <span style={{ color: colors.textLight, marginRight: '1rem' }}>
          Welcome, {user?.username}!
        </span>
        <button 
          onClick={onLogout}
          style={{ ...buttonStyle, background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}` }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

 // Add this import at the top

// Update your WorkoutList component:
function WorkoutList({ user, onLogout }) {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({ name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);  // Add this state

  useEffect(() => { fetchData(); }, []);
  
  async function fetchData() {
    try {
      setWorkouts(await getWorkouts());
    } catch (err) {
      setError('Failed to load workouts');
    }
  }

  async function handleAddWorkout(e) {
    e.preventDefault();
    try {
      await addWorkout(newWorkout);
      setNewWorkout({ name: '' });
      fetchData();
    } catch (err) {
      setError('Failed to add workout');
    }
  }
  
  async function handleDeleteWorkout(id) {
    try {
      await deleteWorkout(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete workout');
    }
  }

  // Add this new function
  function handleGeneratorSuccess(result) {
    setSuccess(result.message || 'Workout generated successfully!');
    fetchData(); // Refresh workout list
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(''), 5000);
  }

  return (
    <div style={appStyle}>
      <div style={cardStyle}>
        <Header user={user} onLogout={onLogout} />
        
        {error && (
          <div style={{ color: colors.accent, marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ color: colors.accent2, marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
            ✅ {success}
          </div>
        )}
        
        <form onSubmit={handleAddWorkout} style={{ display: 'flex', marginBottom: 24, justifyContent: 'center' }}>
          <input
            style={inputStyle}
            placeholder="Workout Name"
            value={newWorkout.name}
            onChange={e => setNewWorkout({ name: e.target.value })}
            required
          />
          <button type="submit" style={buttonStyle}>Add</button>
        </form>

        {/* Add AI Generate Workout Button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => setShowGenerator(true)}
            style={{
              ...buttonStyle,
              background: `linear-gradient(135deg, ${colors.accent2} 0%, ${colors.accent} 100%)`,
              fontSize: '16px',
              padding: '0.75rem 2rem',
              boxShadow: '0 4px 15px rgba(255, 213, 102, 0.3)',
              marginLeft: 0,
            }}
          >
            🤖 Generate AI Workout
          </button>
        </div>
        
        <ul style={listStyle}>
          {workouts.map(w => (
            <li key={w.id} style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link to={`/workouts/${w.id}`} style={linkStyle}>{w.name}</Link>
              <button onClick={() => handleDeleteWorkout(w.id)} style={{ ...buttonStyle, background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}` }}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      
      <footer style={{ textAlign: 'center', color: colors.textLight, marginTop: 32, fontSize: 14 }}>
        <span>Made with <span style={{ color: colors.accent }}>&#10084;</span> for your fitness journey</span>
      </footer>

      {/* AI Workout Generator Modal */}
      {showGenerator && (
        <WorkoutGenerator 
          onClose={() => setShowGenerator(false)}
          onSuccess={handleGeneratorSuccess}
        />
      )}
    </div>
  );
}

function WorkoutDetail({ user, onLogout }) {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', weight: '' });
  const [error, setError] = useState('');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);  // Add this state
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);
  
  async function fetchData() {
    try {
      const workouts = await getWorkouts();
      setWorkout(workouts.find(w => w.id === parseInt(id)));
      const allExercises = await getExercises();
      setExercises(allExercises.filter(ex => ex.workout === parseInt(id)));
    } catch (err) {
      setError('Failed to load workout details');
    }
  }

  async function handleAddExercise(e) {
    e.preventDefault();
    try {
      const exerciseToSend = {
        ...newExercise,
        sets: newExercise.sets ? parseInt(newExercise.sets, 10) : 0,
        reps: newExercise.reps ? parseInt(newExercise.reps, 10) : 0,
        weight: newExercise.weight ? parseFloat(newExercise.weight) : 0,
        workout: parseInt(id),
      };
      await addExercise(exerciseToSend);
      setNewExercise({ name: '', sets: '', reps: '', weight: '' });
      fetchData();
    } catch (err) {
      setError('Failed to add exercise');
    }
  }
  
  async function handleDeleteExercise(eid) {
    try {
      await deleteExercise(eid);
      fetchData();
    } catch (err) {
      setError('Failed to delete exercise');
    }
  }

  if (!workout) return <div style={appStyle}>Loading...</div>;
  
  return (
    <div style={appStyle}>
      <div style={cardStyle}>
        <Header user={user} onLogout={onLogout} />
        
        <button onClick={() => navigate(-1)} style={{ ...buttonStyle, background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}`, marginBottom: 16 }}>&larr; Back</button>
        
        <h2 style={{ color: colors.accent2, fontSize: 28, marginBottom: 24 }}>{workout.name}</h2>
        
        {error && (
          <div style={{ color: colors.accent, marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddExercise} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 24, gap: 8 }}>
          <input
            style={inputStyle}
            placeholder="Exercise Name"
            value={newExercise.name}
            onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
            required
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Sets"
            value={newExercise.sets}
            onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })}
            required
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Reps"
            value={newExercise.reps}
            onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })}
            required
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Weight (kg)"
            value={newExercise.weight}
            onChange={e => setNewExercise({ ...newExercise, weight: e.target.value })}
            required
          />
          <button type="submit" style={buttonStyle}>Add</button>
        </form>
        
        <ul style={listStyle}>
          {exercises.map(ex => (
            <li key={ex.id} style={exerciseCard}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 18 }}>{ex.name}</span>
                <span style={labelStyle}> &nbsp; {ex.sets} x {ex.reps} @ {ex.weight}kg</span>
              </div>
              <button onClick={() => handleDeleteExercise(ex.id)} style={{ ...buttonStyle, background: colors.bg, color: colors.accent, border: `1px solid ${colors.accent}` }}>Delete</button>
            </li>
          ))}
        </ul>
        
        {/* Add AI Analysis Button - only show if there are exercises */}
        {exercises.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => setShowAIAnalysis(true)}
              style={{
                ...buttonStyle,
                background: `linear-gradient(135deg, ${colors.accent2} 0%, ${colors.accent} 100%)`,
                fontSize: '18px',
                padding: '1rem 2rem',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              }}
            >
              🤖 AI Analysis
            </button>
          </div>
        )}
      </div>
      
      {/* AI Analysis Modal */}
      {showAIAnalysis && (
        <AIAnalysis 
          workoutId={parseInt(id)}
          workoutName={workout.name}
          onClose={() => setShowAIAnalysis(false)}
        />
      )}
    </div>
  );
}


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      // You might want to fetch user details here
      setUser({ username: 'User' }); // Placeholder, you could fetch real user data
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
  };

  if (loading) {
    return <div style={appStyle}>Loading...</div>;
  }

  if (!user || !isAuthenticated()) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkoutList user={user} onLogout={handleLogout} />} />
        <Route path="/workouts/:id" element={<WorkoutDetail user={user} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;
