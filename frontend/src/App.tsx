import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Catalog } from './pages/Catalog';
import { Favorites } from './pages/Favorites';
import { getCurrentUser } from './services/api';
import { setUser, setToken } from './store/authSlice';
import { KnifeDetails } from './pages/KnifeDetails';
import { NotFound } from './pages/NotFound';
import { Home } from './pages/Home';
import { Compare } from './pages/Compare';
import { Admin } from './pages/Admin';
import type { RootState } from './store';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

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
          {/* Публичные маршруты */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<KnifeDetails />} />
          <Route path="/compare" element={<Compare />} />
          
          {/* Редиректы для авторизованных */}
          {user && <Route path="/login" element={<Navigate to="/" replace />} />}
          {user && <Route path="/register" element={<Navigate to="/" replace />} />}
          
          {/* Маршруты аутентификации (только для неавторизованных) */}
          {!user && <Route path="/login" element={<Login />} />}
          {!user && <Route path="/register" element={<Register />} />}
          
          {/* Приватные маршруты */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favorites" 
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 - должен быть последним */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;