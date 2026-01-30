"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI, userAPI } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "@/styles/hero.module.css";
import cardStyles from "@/styles/cards.module.css";
import formStyles from "@/styles/forms.module.css";
import buttonStyles from "@/styles/buttons.module.css";

// Fonction pour décoder un JWT basique
function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.login({ email, mdp: password });
      const token = res.data?.access_token;
      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
        
        // Récupérer les informations de l'utilisateur
        const userRes = await userAPI.getMe();
        const userName = userRes.data?.name;
        const userId = userRes.data?.id ?? userRes.data?.ID;
        if (userName) {
          localStorage.setItem("userName", userName);
        }
        if (userId !== undefined && userId !== null) {
          localStorage.setItem("userId", String(userId));
        }
        
        // Décoder le token pour récupérer le rôle
        const decoded = decodeToken(token);
        const userRole = decoded?.role;
        
        // Rediriger en fonction du rôle
        if (userRole === "Admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      const errorDetail = err?.response?.data?.detail;
      let errorMsg = "Connexion impossible";
      
      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorMsg = errorDetail;
        } else if (Array.isArray(errorDetail)) {
          // Erreur de validation Pydantic (array d'objets)
          errorMsg = errorDetail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
        } else {
          errorMsg = JSON.stringify(errorDetail);
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header hideAuthActions />
      <main className={styles.main}>
        <div style={{ padding: '4rem 2rem', maxWidth: '480px', margin: '0 auto' }}>
          <div className={`${cardStyles.card} ${cardStyles.cardNarrow}`}>
            <div className={cardStyles.cardHeader}>
              <p className={cardStyles.cardKicker}>Livre2Main</p>
              <h1 className={cardStyles.cardTitle}>Connexion</h1>
              <p className={cardStyles.cardSub}>Ravis de vous revoir, accédez à votre bibliothèque.</p>
            </div>
            <form onSubmit={handleSubmit} className={formStyles.form}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={formStyles.input}
                    required
                  />
                </label>
              </div>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>
                  Mot de passe
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={formStyles.input}
                    required
                  />
                </label>
              </div>
              {error && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {String(error)}
                </p>
              )}
              <div className={formStyles.actions}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnFull}`}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className={`${buttonStyles.btn} ${buttonStyles.btnGhost} ${buttonStyles.btnFull}`}
                >
                  Pas de compte ? Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
