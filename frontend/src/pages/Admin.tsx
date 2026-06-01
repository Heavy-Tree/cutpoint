import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';

interface Knife {
  id: number;
  name: string;
  price: number;
  steel: string;
  in_stock: boolean;
  images?: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Admin() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [knives, setKnives] = useState<Knife[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', price: '', steel: '', in_stock: true, imageUrl: '' });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchKnives();
  }, [user, navigate]);

  const fetchKnives = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/knives`);
      const data = await response.json();
      const knivesArray = Array.isArray(data) ? data : data.data || [];
      setKnives(knivesArray);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createKnife = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/knives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          ...form, 
          price: parseFloat(form.price), 
          images: form.imageUrl ? [form.imageUrl] : [] 
        }),
      });
      if (response.ok) {
        setForm({ name: '', price: '', steel: '', in_stock: true, imageUrl: '' });
        fetchKnives();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteKnife = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/knives/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchKnives();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div style={styles.container}>
      <h2>Админ-панель</h2>
      
      <div style={styles.formCard}>
        <h3>Добавить нож</h3>
        <form onSubmit={createKnife} style={styles.form}>
          <input
            type="text"
            placeholder="Название"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Цена"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Сталь"
            value={form.steel}
            onChange={(e) => setForm({ ...form, steel: e.target.value })}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Ссылка на изображение (URL)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            style={styles.input}
          />
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={form.in_stock}
              onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
            />
            В наличии
          </label>
          <button type="submit" style={styles.button}>Добавить</button>
        </form>
      </div>
      
      <div style={styles.tableCard}>
        <h3>Список ножей</h3>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Сталь</th>
                <th>Наличие</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {knives.map(knife => (
                <tr key={knife.id}>
                  <td>{knife.id}</td>
                  <td>{knife.name}</td>
                  <td>{knife.price.toLocaleString()} ₽</td>
                  <td>{knife.steel}</td>
                  <td>{knife.in_stock ? '✅' : '❌'}</td>
                  <td>
                    <button onClick={() => deleteKnife(knife.id)} style={styles.deleteButton}>
                      Удалить
                    </button>
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  button: {
    padding: '0.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.head.querySelector('#admin-styles')) {
  styleSheet.id = 'admin-styles';
  document.head.appendChild(styleSheet);
}