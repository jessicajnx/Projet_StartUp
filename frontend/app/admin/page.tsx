"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import api from "@/lib/api";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  villes: string;
  age: number;
  role: string;
  signalement: number;
}

interface EditingUser extends User {
  mdp?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const decodeTokenRole = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.role ?? null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    const role = decodeTokenRole(token);
    if (role !== "Admin") {
      router.push("/");
      return;
    }

    setAuthorized(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api.get("/users/admin/users-report");
      setUsers(response.data || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Erreur lors du chargement des utilisateurs"
      );
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      setEditLoading(true);
      const updateData: any = {
        name: editingUser.name,
        surname: editingUser.surname,
        email: editingUser.email,
        villes: editingUser.villes,
        age: editingUser.age,
        role: editingUser.role,
      };

      if (editingUser.mdp) {
        updateData.mdp = editingUser.mdp;
      }

      await api.put(`/users/${editingUser.id}`, updateData);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erreur lors de la mise à jour");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?"))
      return;

    try {
      await api.delete(`/users/${userId}`);
      await fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortOrder === "desc") {
      return b.signalement - a.signalement;
    }
    return a.signalement - b.signalement;
  });

  const handleToggleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!authorized) {
    return (
      <div style={styles.container}>
        <main style={styles.main}>
          <p style={styles.loading}>Chargement...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.adminTopbar}>
        <div style={styles.topbarTitle}>Espace Administrateur</div>
        <div style={styles.topbarActions}>
          <button
            style={styles.topbarButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d9c5ae";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#E8D8C4";
            }}
            onClick={() => router.push("/profil")}
          >
            Profil
          </button>
          <button
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#a81810";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#b42318";
            }}
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.adminHeader}>
          <h1 style={styles.title}>Gestion Administrateur</h1>
          <p style={styles.subtitle}>
            Gestion des utilisateurs et signalements
          </p>
        </section>

        <section style={styles.content}>
          <div style={styles.controls}>
            <button
              onClick={handleToggleSort}
              style={styles.sortButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#764d32";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B7355";
              }}
            >
              Trier par signalements ({sortOrder === "desc" ? "↓" : "↑"})
            </button>
            <button
              onClick={fetchUsers}
              style={styles.refreshButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4B59E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E8D8C4";
              }}
            >
              Rafraîchir
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          {loading ? (
            <p style={styles.loading}>Chargement...</p>
          ) : sortedUsers.length === 0 ? (
            <p style={styles.noData}>Aucun utilisateur trouvé</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.headerCell}>Prénom</th>
                    <th style={styles.headerCell}>Nom</th>
                    <th style={styles.headerCell}>Email</th>
                    <th style={styles.headerCell}>Ville</th>
                    <th style={styles.headerCell}>Âge</th>
                    <th style={styles.headerCell}>Rôle</th>
                    <th style={styles.headerCell}>Signalements</th>
                    <th style={styles.headerCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        ...styles.bodyRow,
                        backgroundColor:
                          user.signalement > 0
                            ? "rgba(180, 35, 24, 0.08)"
                            : "transparent",
                      }}
                    >
                      <td style={styles.cell}>{user.name}</td>
                      <td style={styles.cell}>{user.surname}</td>
                      <td style={styles.cell}>{user.email}</td>
                      <td style={styles.cell}>{user.villes}</td>
                      <td style={styles.cell}>{user.age}</td>
                      <td style={styles.cell}>
                        <span
                          style={{
                            ...styles.roleBadge,
                            backgroundColor:
                              user.role === "Admin" ? "#8B7355" : "#D4B59E",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.cell,
                          fontWeight: "bold",
                          color:
                            user.signalement > 0 ? "#b42318" : "#1f8f55",
                        }}
                      >
                        {user.signalement}
                      </td>
                      <td style={styles.cell}>
                        <button
                          onClick={() => handleEditClick(user)}
                          style={styles.actionButton}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#D4B59E";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#E8D8C4";
                          }}
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={styles.deleteButton}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#a81810";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#b42318";
                          }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {editingUser && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Éditer l'utilisateur</h2>

              <div style={styles.formGroup}>
                <label>Prénom:</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Nom:</label>
                <input
                  type="text"
                  value={editingUser.surname}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, surname: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Ville:</label>
                <input
                  type="text"
                  value={editingUser.villes}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, villes: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Âge:</label>
                <input
                  type="number"
                  value={editingUser.age}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      age: Number(e.target.value),
                    })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label>Rôle:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="Pauvre">Pauvre</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label>Mot de passe (optionnel):</label>
                <input
                  type="password"
                  placeholder="Laisser vide pour ne pas changer"
                  value={editingUser.mdp ?? ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, mdp: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={handleSaveUser}
                  disabled={editLoading}
                  style={styles.saveButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#764d32";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#8B7355";
                  }}
                >
                  {editLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  style={styles.cancelButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#D4B59E";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#E8D8C4";
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  main: {
    flex: 1,
  },
  adminHeader: {
    backgroundColor: "#5D4E37",
    color: "white",
    padding: "2rem",
    textAlign: "center",
  },
  adminTopbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "#5D4E37",
    color: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  topbarTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    margin: 0,
  },
  topbarActions: {
    display: "flex",
    gap: "0.75rem",
  },
  topbarButton: {
    backgroundColor: "#E8D8C4",
    color: "#5D4E37",
    border: "2px solid #D4B59E",
    padding: "0.6rem 1.1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "background-color 0.3s",
  },
  logoutButton: {
    backgroundColor: "#b42318",
    color: "white",
    border: "none",
    padding: "0.6rem 1.1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "background-color 0.3s",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
    margin: 0,
  },
  subtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
    margin: 0,
  },
  content: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    width: "100%",
  },
  controls: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  sortButton: {
    backgroundColor: "#8B7355",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background-color 0.3s",
  },
  refreshButton: {
    backgroundColor: "#E8D8C4",
    color: "#5D4E37",
    border: "2px solid #D4B59E",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background-color 0.3s",
  },
  error: {
    color: "#b42318",
    padding: "1rem",
    backgroundColor: "rgba(180, 35, 24, 0.1)",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  loading: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#5D4E37",
    padding: "2rem",
  },
  noData: {
    textAlign: "center",
    fontSize: "1.1rem",
    color: "#8B7355",
    padding: "2rem",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
  },
  headerRow: {
    backgroundColor: "#D4B59E",
    borderBottom: "3px solid #8B7355",
  },
  headerCell: {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "bold",
    color: "#5D4E37",
    fontSize: "0.95rem",
  },
  bodyRow: {
    borderBottom: "1px solid #E8D8C4",
    transition: "background-color 0.2s",
  },
  cell: {
    padding: "1rem",
    color: "#2f241d",
    fontSize: "0.95rem",
  },
  roleBadge: {
    display: "inline-block",
    padding: "0.35rem 0.75rem",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#E8D8C4",
    color: "#5D4E37",
    border: "1px solid #D4B59E",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginRight: "0.5rem",
    transition: "background-color 0.3s",
  },
  deleteButton: {
    backgroundColor: "#b42318",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "background-color 0.3s",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontSize: "1.5rem",
    color: "#5D4E37",
    marginBottom: "1.5rem",
    margin: 0,
  },
  formGroup: {
    marginBottom: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "2px solid #D4B59E",
    fontSize: "1rem",
    marginTop: "0.5rem",
    color: "#5D4E37",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  },
  saveButton: {
    backgroundColor: "#8B7355",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background-color 0.3s",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#E8D8C4",
    color: "#5D4E37",
    border: "2px solid #D4B59E",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background-color 0.3s",
    flex: 1,
  },
};
