"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authAPI } from "@/lib/api";

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

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    villes: "",
    age: "",
    mdp: "",
    role: "Pauvre",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const ageNumber = Number(form.age);
    if (!Number.isFinite(ageNumber) || ageNumber <= 0) {
      setLoading(false);
      setError("Âge invalide");
      return;
    }
    try {
      await authAPI.register({
        ...form,
        age: ageNumber,
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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Inscription</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Prénom
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Nom
          <input
            value={form.surname}
            onChange={(e) => handleChange("surname", e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Ville
          <input
            value={form.villes}
            onChange={(e) => handleChange("villes", e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Âge
          <input
            type="number"
            min={0}
            value={form.age}
            onChange={(e) => handleChange("age", e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Rôle
          <select
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="rounded border px-3 py-2"
          >
            <option value="Pauvre">Pauvre</option>
            <option value="Admin">Admin</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Mot de passe
          <input
            type="password"
            value={form.mdp}
            onChange={(e) => handleChange("mdp", e.target.value)}
            className="rounded border px-3 py-2"
            required
          />
        </label>
        {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
        {success && <p className="md:col-span-2 text-sm text-green-600">{success}</p>}
        <div className="md:col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="rounded border px-4 py-2"
          >
            Déjà inscrit ? Connexion
          </button>
        </div>
      </form>
    </main>
  );
}
