import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, removeToken } from '../services/api';
import type { User } from '../services/api';

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) {
        navigate('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Личный кабинет</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Имя:</strong> {user?.name}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Email:</strong> {user?.email}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Роль:</strong> {user?.role}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Дата регистрации:</strong> {user && new Date(user.created_at).toLocaleDateString()}
        </div>
        
        <button
          onClick={handleLogout}
          style={{ backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}