import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Логотип */}
        <Link to="/" style={styles.logo}>
          CutPoint
        </Link>

        {/* Навигация */}
        <nav style={styles.nav}>
          <Link to="/catalog" style={styles.navLink}>Каталог</Link>
          <Link to="/favorites" style={styles.navLink}>Избранное</Link>
          <Link to="/compare" style={styles.navLink}>Сравнение</Link>
        </nav>

        {/* Поиск */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Поиск ножей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>🔍</button>
        </form>

        {/* Пользовательское меню */}
        <div style={styles.userMenu}>
          {user ? (
            <>
              <span style={styles.userName}>Привет, {user.name}!</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.loginLink}>Войти</Link>
          )}
        </div>
      </div>
    </header>
  );
}

// Стили (временно inline, потом можно вынести в CSS)
const styles: { [key: string]: React.CSSProperties } = {
  header: {
    backgroundColor: '#1f2937',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '1.5rem',
  },
  navLink: {
    color: '#e5e7eb',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  searchForm: {
    display: 'flex',
    flex: 1,
    maxWidth: '300px',
  },
  searchInput: {
    flex: 1,
    padding: '0.5rem',
    border: 'none',
    borderRadius: '4px 0 0 4px',
    outline: 'none',
  },
  searchButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    color: '#e5e7eb',
    fontSize: '0.875rem',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  loginLink: {
    color: '#e5e7eb',
    textDecoration: 'none',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#2563eb',
    borderRadius: '4px',
  },
};