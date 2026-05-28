import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Knife {
  id: number;
  name: string;
  price: number;
  steel: string;
  blade_length: number;
  total_length: number;
  handle_material: string;
  in_stock: boolean;
  images: string[];
}

export function Compare() {
  const [compareIds, setCompareIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('compareIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [knives, setKnives] = useState<Knife[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('compareIds', JSON.stringify(compareIds));
  }, [compareIds]);

  useEffect(() => {
    const fetchKnives = async () => {
      if (!compareIds.length) {
        setKnives([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const idsParam = compareIds.join(',');
        const response = await fetch(`http://localhost:8000/api/knives?ids=${idsParam}`);
        const data = await response.json();
        const knivesArray = Array.isArray(data) ? data : data.data || [];
        setKnives(knivesArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKnives();
  }, [compareIds]);

  const removeFromCompare = (id: number) => {
    setCompareIds(prev => prev.filter(i => i !== id));
  };

  const clearAll = () => {
    setCompareIds([]);
  };

  if (loading) {
    return <div style={styles.container}><h2>Сравнение</h2><p>Загрузка...</p></div>;
  }

  if (knives.length === 0) {
    return (
      <div style={styles.container}>
        <h2>Сравнение</h2>
        <p>Выберите ножи для сравнения (максимум 4)</p>
        <Link to="/catalog" style={styles.link}>Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Сравнение ({knives.length}/4)</h2>
        <button onClick={clearAll} style={styles.clearButton}>Очистить всё</button>
      </div>
      
      <div style={styles.table}>
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Название</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>
              <Link to={`/catalog/${knife.id}`} style={styles.knifeLink}>{knife.name}</Link>
              <button onClick={() => removeFromCompare(knife.id)} style={styles.removeButton}>✕</button>
            </div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Изображение</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>
              <img src={knife.images?.[0] || 'https://via.placeholder.com/100x80'} alt={knife.name} style={styles.image} />
            </div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Цена</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>{knife.price.toLocaleString()} ₽</div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Сталь</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>{knife.steel}</div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Длина клинка</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>{knife.blade_length} мм</div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Общая длина</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>{knife.total_length} мм</div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Материал рукояти</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>{knife.handle_material}</div>
          ))}
        </div>
        
        <div style={styles.tableRow}>
          <div style={styles.tableLabel}>Наличие</div>
          {knives.map(knife => (
            <div key={knife.id} style={styles.tableValue}>
              {knife.in_stock ? '✅ В наличии' : '❌ Нет'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  clearButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '200px repeat(auto-fit, minmax(150px, 1fr))',
    borderBottom: '1px solid #e5e7eb',
  },
  tableLabel: {
    padding: '1rem',
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    borderRight: '1px solid #e5e7eb',
  },
  tableValue: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  knifeLink: {
    textDecoration: 'none',
    color: '#2563eb',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
  },
  image: {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  link: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  },
};