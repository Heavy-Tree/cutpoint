import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
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
          {/* Временные заглушки для новых страниц */}
          <Route path="/catalog" element={<div style={{ textAlign: 'center' }}>Страница каталога (скоро)</div>} />
          <Route path="/favorites" element={<div style={{ textAlign: 'center' }}>Страница избранного (скоро)</div>} />
          <Route path="/compare" element={<div style={{ textAlign: 'center' }}>Страница сравнения (скоро)</div>} />
          <Route path="/" element={<div style={{ textAlign: 'center' }}>Главная страница (скоро)</div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;