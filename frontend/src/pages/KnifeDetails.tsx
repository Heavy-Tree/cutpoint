import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addToFavorites, removeFromFavorites, selectFavorites, fetchFavorites } from '../store/favoritesSlice';
import type { RootState } from '../store';

interface Knife {
  id: number;
  name: string;
  price: number;
  description: string;
  steel: string;
  blade_length: number;
  total_length: number;
  handle_material: string;
  in_stock: boolean;
  images: string[];
  views: number;
}

export function KnifeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const favorites = useSelector(selectFavorites);
  const [knife, setKnife] = useState<Knife | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState('');
  const hasRecordedView = useRef(false);

  const isFavorite = knife ? favorites.includes(knife.id) : false;

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [user, dispatch]);

  // Загрузка данных ножа
  useEffect(() => {
    const fetchKnife = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8000/api/knives/${id}`);
        
        if (response.status === 404) {
          navigate('/404');
          return;
        }
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const data = await response.json();
        setKnife(data);
        setMainImage(data.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить нож');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchKnife();
  }, [id, navigate]);

  // Увеличение счётчика просмотров (один раз за посещение)
  useEffect(() => {
    if (id && !hasRecordedView.current) {
      hasRecordedView.current = true;
      fetch(`http://localhost:8000/api/knives/${id}/view`, {
        method: 'POST',
      }).catch(console.error);
    }
  }, [id]);

  const handleFavorite = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorite) {
      dispatch(removeFromFavorites(knife!.id));
    } else {
      dispatch(addToFavorites(knife!.id));
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.skeletonImage}></div>
        <div style={styles.skeletonTitle}></div>
        <div style={styles.skeletonText}></div>
        <div style={styles.skeletonText}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBlock}>
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (!knife) return null;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Назад
      </button>
      
      <div style={styles.card}>
        <div style={styles.imageSection}>
          <img src={mainImage} alt={knife.name} style={styles.mainImage} />
          {knife.images && knife.images.length > 1 && (
            <div style={styles.thumbnails}>
              {knife.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${knife.name} ${idx + 1}`}
                  style={{ ...styles.thumbnail, border: mainImage === img ? '2px solid #2563eb' : 'none' }}
                  onMouseEnter={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div style={styles.infoSection}>
          <h1 style={styles.title}>{knife.name}</h1>
          <p style={styles.price}>{knife.price.toLocaleString()} ₽</p>
          
          <div style={styles.favoriteSection}>
            <button onClick={handleFavorite} style={styles.favoriteButton}>
              {isFavorite ? '❤️ В избранном' : '🤍 В избранное'}
            </button>
            <span style={knife.in_stock ? styles.inStock : styles.outOfStock}>
              {knife.in_stock ? '✓ В наличии' : '✗ Нет в наличии'}
            </span>
          </div>
          
          <div style={styles.section}>
            <h3>Описание</h3>
            <p style={styles.description}>{knife.description || 'Описание отсутствует'}</p>
          </div>
          
          <div style={styles.section}>
            <h3>Характеристики</h3>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tableLabel}>Сталь</td>
                  <td style={styles.tableValue}><strong>{knife.steel}</strong></td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Длина клинка</td>
                  <td style={styles.tableValue}>{knife.blade_length} мм</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Общая длина</td>
                  <td style={styles.tableValue}>{knife.total_length} мм</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Материал рукояти</td>
                  <td style={styles.tableValue}>{knife.handle_material}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>Просмотров</td>
                  <td style={styles.tableValue}>{knife.views}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  backButton: {
    backgroundColor: '#e5e7eb',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '1.5rem',
  },
  card: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mainImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
  },
  thumbnails: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    margin: 0,
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: 0,
  },
  favoriteSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginTop: '0.5rem',
  },
  favoriteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  inStock: {
    color: '#10b981',
    fontSize: '0.875rem',
  },
  outOfStock: {
    color: '#ef4444',
    fontSize: '0.875rem',
  },
  section: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem',
    marginTop: '0.5rem',
  },
  description: {
    lineHeight: '1.6',
    color: '#4b5563',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableLabel: {
    padding: '0.5rem',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
  },
  tableValue: {
    padding: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  skeletonImage: {
    width: '100%',
    height: '300px',
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonTitle: {
    height: '32px',
    width: '60%',
    backgroundColor: '#e5e7eb',
    marginTop: '1rem',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonText: {
    height: '100px',
    backgroundColor: '#e5e7eb',
    marginTop: '1rem',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  errorBlock: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
  },
  retryButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.head.querySelector('#details-styles')) {
  styleSheet.id = 'details-styles';
  document.head.appendChild(styleSheet);
}