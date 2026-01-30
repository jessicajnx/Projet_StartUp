'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function PaiementPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string>('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);


    const requestPaymentToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/request-payment-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPaymentToken(data.payment_token);
          console.log('Token de paiement obtenu, expire dans', data.expires_in, 'secondes');
        } else {
          const error = await response.json();
          alert(error.detail || 'Impossible d\'obtenir le token de paiement');
          router.push('/abonnement');
        }
      } catch (error) {
        console.error('Erreur lors de la demande du token de paiement:', error);
        alert('Erreur lors de l\'initialisation du paiement');
        router.push('/abonnement');
      }
    };

    requestPaymentToken();
  }, [router]);


  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };


  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 6);
    }
    return numbers;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (formattedValue.length > 7) return;
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 3) return;
    } else if (name === 'cardName') {
      formattedValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: formattedValue });


    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    };

    let isValid = true;


    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberClean || cardNumberClean.length !== 16) {
      newErrors.cardNumber = 'Le numéro de carte doit contenir 16 chiffres';
      isValid = false;
    }


    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Le nom du titulaire est requis';
      isValid = false;
    }


    if (!formData.expiryDate || formData.expiryDate.length !== 7) {
      newErrors.expiryDate = 'Format: MM/YYYY';
      isValid = false;
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Mois invalide';
        isValid = false;
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Carte expirée';
        isValid = false;
      }
    }


    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = 'Le CVV doit contenir 3 chiffres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {

      if (!paymentToken) {
        alert('Token de paiement manquant. Veuillez réessayer.');
        setIsProcessing(false);
        return;
      }


      await new Promise(resolve => setTimeout(resolve, 2000));


      const token = localStorage.getItem('token');
      console.log('Envoi de la requête d\'upgrade premium avec token de paiement...');

      const response = await fetch('http://localhost:8000/users/upgrade-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_token: paymentToken,
        }),
      });

      console.log('Statut de la réponse:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Utilisateur mis à jour:', updatedUser);
        console.log('Nouveau rôle:', updatedUser.role);


        setShowSuccessAnimation(true);


        setTimeout(() => {
          window.location.href = '/profil';
        }, 3000);
      } else {
        const error = await response.json();
        console.error('Erreur de mise à jour:', error);
        alert(`Erreur: ${error.detail || 'Impossible de mettre à jour l\'abonnement'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Erreur lors du traitement du paiement');
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={styles.pageContainer}>
      {}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomRotate {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 50px rgba(255, 215, 0, 1));
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <Header />

      {}
      {showSuccessAnimation && (
        <div style={styles.successOverlay}>
          <div style={styles.successAnimation}>
            <div style={styles.starContainer}>
              <div style={styles.star}>⭐</div>
              <div style={styles.premiumText}>PREMIUM</div>
            </div>
          </div>
        </div>
      )}

      <main style={styles.main}>
        <div style={styles.container}>
          <button onClick={() => router.back()} style={styles.backButton}>
            ← Retour
          </button>

          <h1 style={styles.title}>Paiement sécurisé</h1>

          <div style={styles.contentGrid}>
            {}
            <div style={styles.paymentCard}>
              <div style={styles.lockIcon}>🔒</div>
              <h2 style={styles.cardTitle}>Informations de paiement</h2>
              <p style={styles.securityText}>Vos données sont sécurisées et cryptées</p>

              <form onSubmit={handleSubmit} style={styles.form}>
                {}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Numéro de carte</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.cardIcon}>💳</span>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      style={{...styles.input, ...styles.inputWithIcon}}
                    />
                  </div>
                  {errors.cardNumber && <span style={styles.error}>{errors.cardNumber}</span>}
                </div>

                {}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom du titulaire</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="JEAN DUPONT"
                    style={styles.input}
                  />
                  {errors.cardName && <span style={styles.error}>{errors.cardName}</span>}
                </div>

                {}
                <div style={styles.rowGroup}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date d'expiration</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YYYY"
                      style={styles.input}
                    />
                    {errors.expiryDate && <span style={styles.error}>{errors.expiryDate}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      style={styles.input}
                    />
                    {errors.cvv && <span style={styles.error}>{errors.cvv}</span>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    ...styles.submitButton,
                    ...(isProcessing ? styles.submitButtonDisabled : {}),
                  }}
                >
                  {isProcessing ? 'Traitement en cours...' : 'Payer 4,99€'}
                </button>
              </form>

              <div style={styles.securityBadges}>
                <span style={styles.badge}>🔒 Paiement sécurisé SSL</span>
                <span style={styles.badge}>✓ Cryptage AES-256</span>
              </div>
            </div>

            {}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Récapitulatif</h3>

              <div style={styles.summaryItem}>
                <span>Abonnement Premium</span>
                <span style={styles.oldPriceSummary}>9,99€</span>
              </div>

              <div style={styles.summaryItem}>
                <span style={styles.discountLabel}>Réduction -50% 🎉</span>
                <span style={styles.discountAmount}>-5,00€</span>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.summaryItem}>
                <span style={styles.totalLabel}>Total à payer</span>
                <span style={styles.totalAmount}>4,99€</span>
              </div>

              <p style={styles.billingInfo}>Facturation mensuelle</p>

              <div style={styles.featuresBox}>
                <h4 style={styles.featuresTitle}>Votre abonnement inclut :</h4>
                <ul style={styles.featuresList}>
                  <li style={styles.featureItem}>✓ Échanges illimités</li>
                  <li style={styles.featureItem}>✓ 5 To de stockage</li>
                  <li style={styles.featureItem}>✓ Hotline prioritaire</li>
                  <li style={styles.featureItem}>✓ Sans engagement</li>
                </ul>
              </div>
            </div>
          </div>
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
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#5c4b3a',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#2f241d',
    textAlign: 'center',
    marginBottom: '3rem',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 8px 24px rgba(47,36,29,0.1)',
  },
  lockIcon: {
    fontSize: '2.5rem',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#2f241d',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  securityText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#2f241d',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  cardIcon: {
    position: 'absolute',
    left: '1rem',
    fontSize: '1.5rem',
  },
  input: {
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'monospace',
  },
  inputWithIcon: {
    paddingLeft: '3rem',
  },
  rowGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  error: {
    color: '#d32f2f',
    fontSize: '0.85rem',
    marginTop: '0.25rem',
  },
  submitButton: {
    padding: '1.2rem',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'white',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(255,215,0,0.4)',
    marginTop: '1rem',
  },
  submitButtonDisabled: {
    background: '#999',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  securityBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '0.85rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 8px 24px rgba(47,36,29,0.1)',
    position: 'sticky',
    top: '2rem',
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#2f241d',
    marginBottom: '1.5rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontSize: '1rem',
    color: '#5c4b3a',
  },
  oldPriceSummary: {
    color: '#999',
    textDecoration: 'line-through',
  },
  discountLabel: {
    color: '#4CAF50',
    fontWeight: 600,
  },
  discountAmount: {
    color: '#4CAF50',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '1.5rem 0',
  },
  totalLabel: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#2f241d',
  },
  totalAmount: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#FFD700',
  },
  billingInfo: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    marginBottom: '2rem',
  },
  featuresBox: {
    backgroundColor: '#f5f0e8',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  featuresTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2f241d',
    marginBottom: '1rem',
  },
  featuresList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  featureItem: {
    fontSize: '0.95rem',
    color: '#5c4b3a',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
  },
  successOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease-in',
  },
  successAnimation: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'zoomRotate 1s ease-out',
  },
  star: {
    fontSize: '15rem',
    filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))',
    animation: 'pulse 1.5s infinite',
  },
  premiumText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '3.5rem',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 4px 20px rgba(255, 215, 0, 0.5)',
    letterSpacing: '0.1em',
    animation: 'shimmer 2s infinite',
  },
};
