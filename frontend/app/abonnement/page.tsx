'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function AbonnementPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    hours: 20,
    minutes: 0,
    seconds: 0,
  });
  const [currentRole, setCurrentRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);

    // Récupérer le rôle actuel de l'utilisateur
    const fetchUserRole = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentRole(data.role || '');
          console.log('Rôle actuel de l\'utilisateur:', data.role);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };

    fetchUserRole();
  }, [router]);

  // Compteur de 20h
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 20);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (plan: 'Pauvre' | 'Premium') => {
    // Empêcher de souscrire à l'abonnement gratuit
    if (plan === 'Pauvre') {
      alert('L\'abonnement gratuit est votre abonnement par défaut. Vous ne pouvez pas y souscrire.');
      return;
    }

    if (currentRole.toLowerCase() === 'riche' || currentRole.toLowerCase() === 'premium') {
      alert('Vous avez déjà l\'abonnement Premium');
      return;
    }

    // Rediriger vers la page de paiement pour l'abonnement Premium
    router.push('/paiement');
  };

  // Vérifier si l'utilisateur a l'abonnement gratuit
  // Tous les utilisateurs sauf Premium/Riche sont considérés comme ayant l'abonnement gratuit
  const hasFreePlan = currentRole.toLowerCase() !== 'riche' && currentRole.toLowerCase() !== 'premium' && currentRole.toLowerCase() !== 'admin';
  const hasPremiumPlan = currentRole.toLowerCase() === 'riche' || currentRole.toLowerCase() === 'premium';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.pageContainer}>
      <Header />

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>Choisissez votre abonnement</h1>

          {/* Bannière de réduction */}
          <div style={styles.discountBanner}>
            <div style={styles.discountIcon}>🔥</div>
            <div style={styles.discountContent}>
              <h3 style={styles.discountTitle}>Offre limitée : -50% sur l'abonnement Premium !</h3>
              <p style={styles.discountSubtitle}>Cette offre se termine dans :</p>
              <div style={styles.countdown}>
                <div style={styles.timeBlock}>
                  <span style={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span style={styles.timeLabel}>heures</span>
                </div>
                <span style={styles.timeSeparator}>:</span>
                <div style={styles.timeBlock}>
                  <span style={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span style={styles.timeLabel}>minutes</span>
                </div>
                <span style={styles.timeSeparator}>:</span>
                <div style={styles.timeBlock}>
                  <span style={styles.timeNumber}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span style={styles.timeLabel}>secondes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plans d'abonnement */}
          <div style={styles.plansContainer}>
            {/* Plan Gratuit */}
            <div style={{...styles.planCard, ...(hasFreePlan ? styles.currentPlan : {})}}>
              {hasFreePlan && (
                <div style={styles.currentBadge}>✓ Abonnement actuel</div>
              )}
              <div style={styles.cardContent}>
                <div style={styles.planHeader}>
                  <h2 style={styles.planName}>Gratuit</h2>
                  <div style={styles.priceContainer}>
                    <span style={styles.price}>0€</span>
                    <span style={styles.period}>/mois</span>
                  </div>
                </div>

                <ul style={styles.featuresList}>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    Accès à tous les livres du site
                  </li>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    1 échange à la fois
                  </li>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    10 Go de stockage pour votre bibliothèque
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe('Pauvre')}
                style={{
                  ...styles.subscribeButton,
                  ...(hasFreePlan ? styles.currentButton : {}),
                  ...(hasPremiumPlan ? styles.disabledButton : {}),
                }}
                disabled={hasFreePlan || hasPremiumPlan}
              >
                {hasFreePlan ? '✓ Abonnement actuel' : hasPremiumPlan ? '✗ Non disponible' : 'Choisir ce plan'}
              </button>
            </div>

            {/* Plan Premium */}
            <div style={{...styles.planCard, ...styles.premiumCard, ...(hasPremiumPlan ? styles.currentPlan : {})}}>
              <div style={styles.popularBadge}>⭐ Le plus populaire</div>
              {hasPremiumPlan && (
                <div style={styles.currentBadge}>✓ Abonnement actuel</div>
              )}

              <div style={styles.cardContent}>
                <div style={styles.planHeader}>
                  <h2 style={styles.planName}>Premium</h2>
                  <div style={styles.priceContainer}>
                    <span style={styles.oldPrice}>9,99€</span>
                    <span style={styles.price}>4,99€</span>
                    <span style={styles.period}>/mois</span>
                  </div>
                  <p style={styles.savingsBadge}>Économisez 50% 🎉</p>
                </div>

                <ul style={styles.featuresList}>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    Accès à tous les livres du site
                  </li>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    <strong>Échanges de livres illimités en cours</strong>
                  </li>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    <strong>5 To de stockage pour votre bibliothèque</strong>
                  </li>
                  <li style={styles.feature}>
                    <span style={styles.checkmark}>✓</span>
                    <strong>Accès prioritaire à la hotline</strong>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe('Premium')}
                style={{
                  ...styles.subscribeButton,
                  ...styles.premiumButton,
                  ...(hasPremiumPlan ? styles.currentButton : {}),
                }}
                disabled={hasPremiumPlan}
              >
                {hasPremiumPlan ? '✓ Abonnement actuel' : 'Passer à Premium'}
              </button>
            </div>
          </div>

          {/* Note de bas de page */}
          <p style={styles.footnote}>
            💡 Vous pouvez changer d'abonnement à tout moment. Le changement est immédiat.
          </p>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)',
  },
  main: {
    padding: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#2f241d',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  discountBanner: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '3rem',
    boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  discountIcon: {
    fontSize: '4rem',
  },
  discountContent: {
    flex: 1,
  },
  discountTitle: {
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
  },
  discountSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1rem',
    margin: '0 0 1rem 0',
  },
  countdown: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  timeBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '0.5rem 1rem',
    backdropFilter: 'blur(10px)',
  },
  timeNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'white',
    lineHeight: 1,
  },
  timeLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.9)',
    marginTop: '0.25rem',
  },
  timeSeparator: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'white',
  },
  plansContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 8px 24px rgba(47,36,29,0.1)',
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '550px',
  },
  premiumCard: {
    border: '3px solid #FFD700',
    transform: 'scale(1.05)',
    boxShadow: '0 12px 32px rgba(255,215,0,0.3)',
  },
  currentPlan: {
    border: '3px solid #4CAF50',
    boxShadow: '0 12px 32px rgba(76,175,80,0.3)',
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  popularBadge: {
    position: 'absolute',
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#FFD700',
    color: '#2f241d',
    padding: '0.5rem 1.5rem',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(255,215,0,0.4)',
  },
  currentBadge: {
    position: 'absolute',
    top: '-15px',
    right: '20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.85rem',
    boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
  },
  planHeader: {
    marginBottom: '2rem',
  },
  planName: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#2f241d',
    marginBottom: '1rem',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  oldPrice: {
    fontSize: '1.5rem',
    color: '#999',
    textDecoration: 'line-through',
  },
  price: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#2f241d',
  },
  period: {
    fontSize: '1.2rem',
    color: '#666',
  },
  savingsBadge: {
    display: 'inline-block',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.3rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 2rem 0',
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    color: '#5c4b3a',
    lineHeight: 1.5,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: '1.5rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  subscribeButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'white',
    background: '#8b5e3c',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(139,94,60,0.3)',
  },
  premiumButton: {
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    boxShadow: '0 6px 20px rgba(255,215,0,0.4)',
  },
  currentButton: {
    background: '#4CAF50',
    cursor: 'not-allowed',
    boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
  },
  disabledButton: {
    background: '#999',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  footnote: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1rem',
    marginTop: '2rem',
  },
};
