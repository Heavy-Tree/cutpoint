import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.message}>Страница не найдена</p>
      <Link to="/" style={styles.link}>
        Вернуться на главную
      </Link>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: 'center',
    padding: '4rem 1rem',
    minHeight: '60vh',
  },
  code: {
    fontSize: '6rem',
    margin: 0,
    color: '#2563eb',
  },
  message: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    color: '#6b7280',
  },
  link: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
  },
};