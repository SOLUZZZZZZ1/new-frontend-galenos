// src/pages/DeGuardiaPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API =
  import.meta.env.VITE_API_URL || "https://galenos-backend.onrender.com";

/**
 * Página principal del módulo "De guardia / Cartelera clínica".
 * - Lista de consultas en la columna izquierda
 * - Hilo de mensajes en la derecha
 * - Alias de guardia obligatorio (se pide si falta)
 *
 * Esta versión solo se apoya en endpoints REST, sin websockets,
 * para no romper nada del backend actual.
 */

// ⬇️ IMPORTS ADAPTADOS: componentes en src/components/
import ConsultasListPanel from "../components/ConsultasListPanel.jsx";
import HiloPanel from "../components/HiloPanel.jsx";
import AliasGuardiaModal from "../components/AliasGuardiaModal.jsx";
import NuevaConsultaModal from "../components/NuevaConsultaModal.jsx";

export default function DeGuardiaPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("galenos_token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardAlias, setGuardAlias] = useState(
    localStorage.getItem("galenos_guard_alias") || ""
  );

  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState({
    status: "open",
    favoritesOnly: false,
    search: "",
  });
  const [selectedCaseId, setSelectedCase
