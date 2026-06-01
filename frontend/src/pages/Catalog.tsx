import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { addToFavorites, removeFromFavorites, selectFavorites, fetchFavorites } from '../store/favoritesSlice';
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

export function Catalog() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchParams] = useSearchParams();
  const [knives, setKnives] = useState<Knife[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('');

  // Временные значения фильтров
  const [tempPriceMin, setTempPriceMin] = useState('');
  const [tempPriceMax, setTempPriceMax] = useState('');
  const [tempCategory, setTempCategory] = useState('');

  // Реальные значения фильтров
  const [activePriceMin, setActivePriceMin] = useState('');
  const [activePriceMax, setActivePriceMax] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const searchQuery = searchParams.get('search') || '';

  // Загружаем избранное при авторизации
  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const fetchKnives = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        let url = `${API_BASE_URL}/api/knives?page=${page}&limit=6`;

        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (activePriceMin) url += `&min_price=${activePriceMin}`;
        if (activePriceMax) url += `&max_price=${activePriceMax}`;
        if (activeCategory) url += `&category=${activeCategory}`;
        if (sortBy) url += `&sort_by=${sortBy}`;
        
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
  }, [page, searchQuery, activePriceMin, activePriceMax, activeCategory, sortBy]);

  const applyFilters = () => {
    setActivePriceMin(tempPriceMin);
    setActivePriceMax(tempPriceMax);
    setActiveCategory(tempCategory);
    setPage(1);
  };

  const handleFavoriteClick = (e: React.MouseEvent, knifeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorites.includes(knifeId)) {
      dispatch(removeFromFavorites(knifeId));
    } else {
      dispatch(addToFavorites(knifeId));
    }
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#333';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '14px';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2000);
  };

  const handleCompareClick = (e: React.MouseEvent, knifeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = JSON.parse(localStorage.getItem('compareIds') || '[]');
    if (!saved.includes(knifeId) && saved.length < 4) {
      localStorage.setItem('compareIds', JSON.stringify([...saved, knifeId]));
      showToast('✅ Добавлено в сравнение');
    } else if (saved.includes(knifeId)) {
      showToast('ℹ️ Уже в сравнении');
    } else if (saved.length >= 4) {
      showToast('⚠️ Максимум 4 ножа для сравнения');
    }
  };

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
      
      {/* Блок фильтров */}
      <div style={styles.filters}>
        <input
          type="number"
          placeholder="Цена от"
          value={tempPriceMin}
          onChange={(e) => setTempPriceMin(e.target.value)}
          style={styles.filterInput}
        />
        <input
          type="number"
          placeholder="Цена до"
          value={tempPriceMax}
          onChange={(e) => setTempPriceMax(e.target.value)}
          style={styles.filterInput}
        />
        <select
          value={tempCategory}
          onChange={(e) => setTempCategory(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">Все категории</option>
          <option value="охотничьи">Охотничьи</option>
          <option value="кухонные">Кухонные</option>
          <option value="тактические">Тактические</option>
        </select>
        <button onClick={applyFilters} style={styles.filterButton}>
          Применить
        </button>

        {/* Сортировка */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          style={styles.filterSelect}
        >
          <option value="">Без сортировки</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="name_asc">Название: А-Я</option>
          <option value="name_desc">Название: Я-А</option>
        </select>
      </div>
      
      <div style={styles.grid}>
        {knives.map((knife) => (
          <Link 
            to={`/catalog/${knife.id}`} 
            key={knife.id} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={styles.card}>
              <img 
                src={knife.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={knife.name}
                style={styles.image}
              />
              <h3 style={styles.cardTitle}>{knife.name}</h3>
              <p style={styles.steel}>{knife.steel}</p>
              <p style={styles.price}>{knife.price.toLocaleString()} Br</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={knife.in_stock ? styles.inStock : styles.outOfStock}>
                  {knife.in_stock ? '✓ В наличии' : '✗ Нет в наличии'}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={(e) => handleCompareClick(e, knife.id)}
                    style={styles.compareButton}
                    title="Сравнить"
                  >
                    📊
                  </button>
                  {user && (
                    <button
                      onClick={(e) => handleFavoriteClick(e, knife.id)}
                      style={styles.favoriteButton}
                      title={favorites.includes(knife.id) ? 'Удалить из избранного' : 'В избранное'}
                    >
                      {favorites.includes(knife.id) ? '❤️' : '🤍'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Link>
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
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterInput: {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: '120px',
  },
  filterSelect: {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  filterButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
    cursor: 'pointer',
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
  favoriteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  compareButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
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