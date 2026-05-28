import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Catalog } from './pages/Catalog';
import { getCurrentUser } from './services/api';
import { setUser, setToken } from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  // Загружаем пользователя при старте приложения (если есть токен)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
      getCurrentUser().then(user => {
        if (user) {
          dispatch(setUser(user));
        }
      });
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Header />
      <main style={{ minHeight: '100vh', padding: '2rem 0' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/favorites" element={<div style={{ textAlign: 'center' }}>Страница избранного (скоро)</div>} />
          <Route path="/compare" element={<div style={{ textAlign: 'center' }}>Страница сравнения (скоро)</div>} />
          <Route path="/" element={<div style={{ textAlign: 'center' }}>Главная страница (скоро)</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;