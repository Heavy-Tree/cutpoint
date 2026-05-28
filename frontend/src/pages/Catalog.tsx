import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Knife {
  id: number;
  name: string;
  price: number;
  steel: string;
  in_stock: boolean;
  images: string[];
}

export function Catalog() {
  const [searchParams] = useSearchParams();
  const [knives, setKnives] = useState<Knife[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchKnives = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const url = `http://localhost:8000/api/knives?page=${page}&limit=6${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
        
        const response = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки');
        
        const data = await response.json();
        const knivesArray = Array.isArray(data) ? data : data.data || [];
        setKnives(knivesArray);
        setTotalPages(data.pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить ножи');
      } finally {
        setLoading(false);
      }
    };
    
    fetchKnives();
  }, [page, searchQuery]);

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Каталог ножей</h2>
        <div style={styles.grid}>
          {[...Array(6)].map((_, i) => (
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

  if (error) {
    return (
      <div style={styles.container}>
        <h2>Каталог ножей</h2>
        <div style={styles.errorBlock}>
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Каталог ножей</h2>
      {searchQuery && <p>Результаты поиска: "{searchQuery}"</p>}
      
      <div style={styles.grid}>
        {knives.map((knife) => (
          <div key={knife.id} style={styles.card}>
            <img 
              src={knife.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
              alt={knife.name}
              style={styles.image}
            />
            <h3 style={styles.cardTitle}>{knife.name}</h3>
            <p style={styles.steel}>{knife.steel}</p>
            <p style={styles.price}>{knife.price.toLocaleString()} ₽</p>
            <span style={knife.in_stock ? styles.inStock : styles.outOfStock}>
              {knife.in_stock ? '✓ В наличии' : '✗ Нет в наличии'}
            </span>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={styles.pageButton}
          >
            ← Назад
          </button>
          <span>Страница {page} из {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={styles.pageButton}
          >
            Вперёд →
          </button>
        </div>
      )}
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
  inStock: {
    color: '#10b981',
    fontSize: '0.875rem',
  },
  outOfStock: {
    color: '#ef4444',
    fontSize: '0.875rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    paddingBottom: '2rem',
  },
  pageButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  errorBlock: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
    marginTop: '1rem',
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
document.head.appendChild(styleSheet);