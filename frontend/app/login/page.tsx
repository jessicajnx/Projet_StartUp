"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api";

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
      }
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="rounded border px-4 py-2"
        >
          Pas de compte ? Inscription
        </button>
      </form>
    </main>
  );
}
