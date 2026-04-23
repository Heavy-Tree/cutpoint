const API_URL = 'http://localhost:8000/api';

// Используем export type для TypeScript типов
export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const register = async (email: string, password: string, name: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }
  
  const data = await response.json();
  setToken(data.access_token);
  return data.user;
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Invalid email or password');
  }
  
  const data = await response.json();
  setToken(data.access_token);
  return data.user;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;
  
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    removeToken();
    return null;
  }
  
  return response.json();
};