"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authAPI } from "@/lib/api";
import styles from "@/styles/hero.module.css";
import cardStyles from "@/styles/cards.module.css";
import formStyles from "@/styles/forms.module.css";
import buttonStyles from "@/styles/buttons.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

const formatError = (err: any): string => {
  const detail = err?.response?.data?.detail;
  if (!detail) {
    if (err?.message) return err.message;
    return "Inscription impossible";
  }
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const loc = Array.isArray(item?.loc) ? item.loc.join(".") : item?.loc;
        return `${loc || "champ"}: ${item?.msg || "erreur"}`;
      })
      .join(" | ");
  }
  if (typeof detail === "object") return detail?.msg || JSON.stringify(detail);
  return String(detail);
};

const passwordRules = [
  {
    test: (v: string) => v.length >= 8,
    message: "Au moins 8 caractères",
  },
  {
    test: (v: string) => /[A-Z]/.test(v),
    message: "Au moins une majuscule",
  },
  {
    test: (v: string) => /[a-z]/.test(v),
    message: "Au moins une minuscule",
  },
  {
    test: (v: string) => /\d/.test(v),
    message: "Au moins un chiffre",
  },
  {
    test: (v: string) => /[^\w\s]/.test(v),
    message: "Au moins un caractère spécial",
  },
];

const getPasswordErrors = (password: string): string[] =>
  passwordRules
    .filter(rule => !rule.test(password))
    .map(rule => rule.message);

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    villes: "",
    age: "",
    mdp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);


  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));

    if (key === "mdp") {
      setPasswordErrors(getPasswordErrors(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const ageNumber = Number(form.age);
    if (!Number.isFinite(ageNumber) || ageNumber < 0) {
      setLoading(false);
      setError("Âge invalide");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setLoading(false);
      setError("Email invalide (format requis: nom@domaine.ext)");
      return;
    }
    const pwdErrors = getPasswordErrors(form.mdp);
    if (pwdErrors.length > 0) {
      setLoading(false);
      setPasswordErrors(pwdErrors);
      return;
    }
    setPasswordErrors([]);

    try {
      await authAPI.register({
        ...form,
        age: ageNumber,
        role: "Pauvre",
      });
      setSuccess("Compte créé. Vous pouvez vous connecter.");
      setTimeout(() => router.push("/login"), 600);
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header hideAuthActions />
      <main className={styles.main}>
        <div style={{ padding: '4rem 2rem', maxWidth: '720px', margin: '0 auto' }}>
          <div className={cardStyles.card}>
            <div className={cardStyles.cardHeader}>
              <p className={cardStyles.cardKicker}>Livre2Main</p>
              <h1 className={cardStyles.cardTitle}>Inscription</h1>
              <p className={cardStyles.cardSub}>Créez votre compte et commencez à échanger vos livres.</p>
            </div>
            <form onSubmit={handleSubmit} className={formStyles.form}>
              <div className={formStyles.formGrid}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Prénom
                    <input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={formStyles.input}
                      required
                    />
                  </label>
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Nom
                    <input
                      value={form.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                      className={formStyles.input}
                      required
                    />
                  </label>
                </div>
              </div>
              <div className={formStyles.formGrid}>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={formStyles.input}
                      required
                    />
                  </label>
                </div>
                <div className={formStyles.formGroup}>
                  <label className={formStyles.label}>
                    Ville
                    <input
                      value={form.villes}
                      onChange={(e) => handleChange("villes", e.target.value)}
                      className={formStyles.input}
                      required
                    />
                  </label>
                </div>
              </div>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label}>
                  Âge
                  <input
                    type="number"
                    min={0}
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
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
                    value={form.mdp}
                    pattern={passwordRegex.source}
                    onChange={(e) => handleChange("mdp", e.target.value)}
                    className={formStyles.input}
                    required
                  />
                </label>
              </div>
              {passwordErrors.length > 0 && (
                <ul
                  style={{
                    marginTop: "0.5rem",
                    paddingLeft: "1.2rem",
                    color: "var(--color-error)",
                    fontSize: "0.9rem",
                  }}
                >
                  {passwordRules.map(rule => {
                    const ok = !passwordErrors.includes(rule.message);
                    return (
                      <li key={rule.message} style={{ color: ok ? "var(--color-success)" : "var(--color-error)" }}>
                        {ok ? "✅" : "❌"} {rule.message}
                      </li>
                    );
                  })}
                </ul>
              )}

              {error && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {String(error)}
                </p>
              )}
              {success && (
                <p style={{ color: 'var(--color-success)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {String(success)}
                </p>
              )}
              <div className={formStyles.actions}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${buttonStyles.btn} ${buttonStyles.btnPrimary} ${buttonStyles.btnFull}`}
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className={`${buttonStyles.btn} ${buttonStyles.btnGhost} ${buttonStyles.btnFull}`}
                >
                  Déjà inscrit ? Connexion
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
