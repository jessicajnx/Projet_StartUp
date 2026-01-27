"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api";

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
      setError(err?.response?.data?.detail || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="card card-narrow">
        <div className="card-header">
          <p className="card-kicker">Livre2main</p>
          <h1 className="card-title">Connexion</h1>
          <p className="card-sub">Ravis de vous revoir, accédez à votre bibliothèque.</p>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ gap: "16px" }}>
          <label className="field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </label>
          <label className="field">
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </label>
          {error && <p className="text-error" style={{ gridColumn: "1 / -1" }}>{error}</p>}
          <div className="actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="btn btn-ghost"
            >
              Pas de compte ? Inscription
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
