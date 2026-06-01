import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFavorites, removeFromFavorites, selectFavorites } from '../store/favoritesSlice';
import type { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Knife {
  id: number;
  name: string;
  price: number;
  steel: string;
  in_stock: boolean;
  images: string[];
}

export function Favorites() {
  const dispatch = useDispatch();
  const favoritesIds = useSelector(selectFavorites);
  const { user } = useSelector((state: RootState) => state.auth);
  const [knives, setKnives] = useState<Knife[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const fetchFavoriteKnives = async () => {
      if (!favoritesIds.length) {
        setKnives([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const idsParam = favoritesIds.join(',');
        const response = await fetch(`${API_BASE_URL}/api/knives?ids=${idsParam}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();
        const knivesArray = Array.isArray(data) ? data : data.data || [];
        setKnives(knivesArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteKnives();
  }, [favoritesIds]);

  const handleRemove = (knifeId: number) => {
    dispatch(removeFromFavorites(knifeId));
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Моё избранное</h2>
        <div style={styles.grid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={styles.skeletonCard}>
              <div style={styles.skeletonImage}></div>
              <div style={styles.skeletonText}></div>
              <div style={styles.skeletonPrice}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (knives.length === 0) {
    return (
      <div style={styles.container}>
        <h2>Моё избранное</h2>
        <div style={styles.emptyBlock}>
          <p>🤍 У вас пока нет избранных ножей</p>
          <Link to="/catalog" style={styles.catalogLink}>
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Моё избранное ({knives.length})</h2>
      
      <div style={styles.grid}>
        {knives.map((knife) => (
          <div key={knife.id} style={styles.card}>
            <Link to={`/catalog/${knife.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img 
                src={knife.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={knife.name}
                style={styles.image}
              />
              <h3 style={styles.cardTitle}>{knife.name}</h3>
              <p style={styles.steel}>{knife.steel}</p>
              <p style={styles.price}>{knife.price.toLocaleString()} Br</p>
            </Link>
            <div style={styles.cardFooter}>
              <span style={knife.in_stock ? styles.inStock : styles.outOfStock}>
                {knife.in_stock ? '✓ В наличии' : '✗ Нет в наличии'}
              </span>
              <button
                onClick={() => handleRemove(knife.id)}
                style={styles.removeButton}
              >
                ❌ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: 'white',
    transition: 'box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    backgroundColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0.75rem 0 0.25rem',
  },
  steel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0.25rem 0',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: '0.5rem 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  inStock: {
    color: '#10b981',
    fontSize: '0.875rem',
  },
  outOfStock: {
    color: '#ef4444',
    fontSize: '0.875rem',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  skeletonCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: 'white',
  },
  skeletonImage: {
    width: '100%',
    height: '150px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonText: {
    height: '20px',
    backgroundColor: '#e5e7eb',
    margin: '0.75rem 0 0.25rem',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonPrice: {
    height: '24px',
    width: '60%',
    backgroundColor: '#e5e7eb',
    margin: '0.5rem 0',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  emptyBlock: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  catalogLink: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.head.querySelector('#favorites-styles')) {
  styleSheet.id = 'favorites-styles';
  document.head.appendChild(styleSheet);
}