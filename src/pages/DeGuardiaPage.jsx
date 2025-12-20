// src/pages/DeGuardiaPage.jsx — De guardia (favoritos + resuelta UX segura)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

import ConsultasListPanel from "../components/ConsultasListPanel.jsx";
import HiloPanel from "../components/HiloPanel.jsx";
import NuevaConsultaModal from "../components/NuevaConsultaModal.jsx";

export default function DeGuardiaPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardAlias, setGuardAlias] = useState("");

  const [casesRaw, setCasesRaw] = useState([]);
  const [filters, setFilters] = useState({
    status: "open",
    favoritesOnly: false,
    search: "",
  });
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const [showNewCaseModal, setShowNewCaseModal] = useState(false);

  async function loadCases(currentFilters) {
    if (!token) return;

    const params = new URLSearchParams();
    params.set("status", currentFilters.status || "open");
    if (currentFilters.favoritesOnly) params.set("favorites_only", "true");

    const url = `${API}/guard/cases?${params.toString()}`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const raw = await res.text();
      console.log("👉 [DeGuardia] GET /guard/cases (raw):", raw);

      if (!res.ok) {
        setError("No se pudieron cargar las consultas de De guardia.");
        return;
      }

      let data;
      try { data = JSON.parse(raw); } catch { data = { items: [] }; }
      const items = Array.isArray(data.items) ? data.items : [];
      setCasesRaw(items);

      if (!selectedCaseId && items.length > 0) setSelectedCaseId(items[0].id);
    } catch (err) {
      console.error("❌ [DeGuardia] Error cargando casos:", err);
      setError("Error de conexión al cargar la cartelera de guardia.");
    }
  }

  useEffect(() => {
    async function loadInitial() {
      if (!token) {
        setError("No hay sesión activa. Inicia sesión para acceder a De guardia.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const resProfile = await fetch(`${API}/doctor/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawProfile = await resProfile.text();
        console.log("👉 [DeGuardia] /doctor/profile/me (raw):", rawProfile);

        if (resProfile.status === 404) {
          setError("Antes de usar De guardia, completa tu perfil médico. Te llevamos al perfil.");
          navigate("/perfil");
          return;
        }
        if (!resProfile.ok) {
          setError("No se pudo cargar el perfil médico para De guardia.");
          setLoading(false);
          return;
        }

        let profile;
        try { profile = JSON.parse(rawProfile); } catch { profile = null; }
        const aliasBackend = profile?.guard_alias || "";

        if (!aliasBackend) {
          setError("Antes de usar De guardia, debes definir tu alias clínico en tu Perfil Médico.");
          navigate("/perfil");
          return;
        }

        setGuardAlias(aliasBackend);
        localStorage.setItem("galenos_guard_alias", aliasBackend);

        await loadCases(filters);
        setLoading(false);
      } catch (err) {
        console.error("❌ [DeGuardia] Error inicial:", err);
        setError("No se pudo conectar con el servidor de De guardia.");
        setLoading(false);
      }
    }

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cases = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    if (!q) return casesRaw;

    return (casesRaw || []).filter((c) => {
      const hay = `${c.title || ""} ${c.anonymized_summary || ""} ${c.author_alias || ""} ${c.context || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [casesRaw, filters.search]);

  function handleFiltersChange(nextFilters) {
    const merged = { ...filters, ...nextFilters };
    setFilters(merged);
    loadCases(merged);
  }

  function handleCaseCreated(newCase) {
    setShowNewCaseModal(false);
    loadCases(filters);
    if (newCase?.id) setSelectedCaseId(newCase.id);
  }

  async function handleToggleFavorite(caseId, nextIsFavorite) {
    try {
      const method = nextIsFavorite ? "POST" : "DELETE";
      const res = await fetch(`${API}/guard/cases/${caseId}/favorite`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      await loadCases(filters);
    } catch (err) {
      console.error("❌ Error toggling favorite:", err);
    }
  }

  async function handleToggleStatus(caseId, nextStatus) {
    try {
      const endpoint = nextStatus === "closed" ? "close" : "reopen";
      const res = await fetch(`${API}/guard/cases/${caseId}/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      if (filters.status === "open" && nextStatus === "closed") {
        const merged = { ...filters, status: "all" };
        setFilters(merged);
        await loadCases(merged);
      } else {
        await loadCases(filters);
      }
    } catch (err) {
      console.error("❌ Error toggling status:", err);
    }
  }

  if (loading) {
    return (
      <main className="sr-container py-8">
        <p className="text-slate-600">Cargando módulo De guardia…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sr-container py-8">
        <h1 className="text-2xl font-semibold mb-2">De guardia · Cartelera clínica</h1>
        <p className="text-sm text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="sr-container py-6 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">De guardia · Cartelera clínica</h1>
          <p className="text-sm text-slate-600">
            Espacio entre médicos para debatir casos sin datos identificativos.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          {guardAlias && (
            <p className="text-xs text-slate-500">
              Estás en guardia como <span className="font-semibold">{guardAlias}</span>
            </p>
          )}
          <button type="button" onClick={() => setShowNewCaseModal(true)} className="sr-btn-primary text-sm">
            Nueva consulta de diagnóstico
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] gap-4 min-h-[480px]">
        <ConsultasListPanel
          cases={cases}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          selectedCaseId={selectedCaseId}
          onSelectCase={setSelectedCaseId}
          onToggleFavorite={handleToggleFavorite}
          onToggleStatus={handleToggleStatus}
        />

        <HiloPanel selectedCaseId={selectedCaseId} apiBase={API} token={token} />
      </section>

      <NuevaConsultaModal
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        apiBase={API}
        token={token}
        onCreated={handleCaseCreated}
      />
    </main>
  );
}
