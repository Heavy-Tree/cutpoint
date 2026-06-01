import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Knife {
  id: number;
  name: string;
  price: number;
  steel: string;
  images: string[];
}

export function Home() {
  const [popularKnives, setPopularKnives] = useState<Knife[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/knives?limit=3`);
        const data = await response.json();
        const knivesArray = Array.isArray(data) ? data : data.data || [];
        setPopularKnives(knivesArray);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero блок */}
      <div style={styles.hero}>
        <h1 style={styles.title}>CutPoint</h1>
        <p style={styles.subtitle}>Острота, достойная легенд</p>
        <Link to="/catalog" style={styles.ctaButton}>
          Смотреть каталог
        </Link>
      </div>

      {/* Популярные ножи */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Популярное</h2>
        <div style={styles.grid}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonImage}></div>
              </div>
            ))
          ) : (
            popularKnives.map((knife) => (
              <Link to={`/catalog/${knife.id}`} key={knife.id} style={styles.cardLink}>
                <div style={styles.card}>
                  <img 
                    src={knife.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={knife.name} 
                    style={styles.cardImage} 
                  />
                  <h3 style={styles.cardTitle}>{knife.name}</h3>
                  <p style={styles.cardPrice}>{knife.price.toLocaleString()} ₽</p>
                  <p style={styles.cardSteel}>{knife.steel}</p>
                </div>
              </Link>
            ))
          )}
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
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '16px',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: 'white',
    transition: 'box-shadow 0.2s',
  },
  cardImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0.75rem 0 0.25rem',
  },
  cardPrice: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: '0.5rem 0',
  },
  cardSteel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  skeletonCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
  },
  skeletonImage: {
    width: '100%',
    height: '150px',
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (!document.head.querySelector('#home-styles')) {
  styleSheet.id = 'home-styles';
  document.head.appendChild(styleSheet);
}