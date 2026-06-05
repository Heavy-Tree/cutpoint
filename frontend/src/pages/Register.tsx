import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';

const PASSWORD_PATTERN = "(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>]).*";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(email, password, name);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Регистрация</h2>
        
        {error && (
          <div style={styles.errorBlock}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              style={styles.input}
            />
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>Пароль</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                pattern={PASSWORD_PATTERN}
                title="Пароль должен содержать: заглавную букву, цифру и спецсимвол (!@#$%^&*)"
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? '🔒' : '👁'}
              </button>
            </div>
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>Подтверждение пароля</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? '🔒' : '👁'}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p style={styles.footer}>
          Уже есть аккаунт? <Link to="/login" style={styles.link}>Войти</Link>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  card: {
    maxWidth: '400px',
    width: '100%',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  errorBlock: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.875rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
};