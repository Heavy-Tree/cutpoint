import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
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
          {user && <Link to="/favorites" style={styles.navLink}>Избранное</Link>}
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
            <div style={styles.profileWrapper}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                style={styles.profileButton}
              >
                <div style={styles.avatar}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
              {menuOpen && (
                <div style={styles.dropdownMenu}>
                  <Link to="/profile" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    👤 Мой профиль
                  </Link>
                  <Link to="/favorites" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    ❤️ Избранное
                  </Link>
                  <button onClick={handleLogout} style={styles.dropdownButton}>
                    🚪 Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.loginLink}>Войти</Link>
          )}
        </div>
      </div>
    </header>
  );
}

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
    position: 'relative',
  },
  profileWrapper: {
    position: 'relative',
  },
  profileButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '50px',
    right: 0,
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    minWidth: '180px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'block',
    padding: '0.75rem 1rem',
    color: '#374151',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
    textAlign: 'left',
    borderBottom: '1px solid #e5e7eb',
  },
  dropdownButton: {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    color: '#374151',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
  },
  loginLink: {
    color: '#e5e7eb',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    borderRadius: '4px',
  },
};