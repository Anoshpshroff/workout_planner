const API_BASE = 'http://localhost:8000/api';

// Token management
export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function isAuthenticated() {
  return !!getToken();
}

// Helper function to add auth headers
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

// Helper function to handle errors
async function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Authentication API calls
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    throw new Error('Login failed');
  }
  
  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function register(username, password, email = '') {
  const res = await fetch(`${API_BASE}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });
  
  if (!res.ok) {
    throw new Error('Registration failed');
  }
  
  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  removeToken();
}

// Workout API calls
export async function getWorkouts() {
  const res = await fetch(`${API_BASE}/workouts/`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function addWorkout(data) {
  const res = await fetch(`${API_BASE}/workouts/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteWorkout(id) {
  const res = await fetch(`${API_BASE}/workouts/${id}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
}

// Exercise API calls
export async function getExercises() {
  const res = await fetch(`${API_BASE}/exercises/`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function addExercise(data) {
  const res = await fetch(`${API_BASE}/exercises/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteExercise(id) {
  const res = await fetch(`${API_BASE}/exercises/${id}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
}

// AI API calls
export async function analyzeWorkout(workoutId) {
  const res = await fetch(`${API_BASE}/workouts/${workoutId}/analyze/`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function generateWorkout(workoutType) {
  const res = await fetch(`${API_BASE}/workouts/generate/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ workout_type: workoutType }),
  });
  return handleResponse(res);
}
