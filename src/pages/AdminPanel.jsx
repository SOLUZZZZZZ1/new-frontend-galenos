// src/pages/AdminPanel.jsx — Panel Admin con Tabs (sin backend aún)
import React, { useState } from "react";

export default function AdminPanel() {
  const email = localStorage.getItem("galenos_email") || "";
  const isMaster = email === "soluzziona@gmail.com";

  // TAB actual
  const [tab, setTab] = useState("requests");

  // Datos MOCK (solo para visualizar diseño)
  const mockRequests = [
    { id: 1, name: "Dr. Luis", email: "luis@hospital.com", country: "España", city: "Sevilla" },
    { id: 2, name: "Dra. Ana", email: "ana@hospital.com", country: "Chile", city: "Santiago" },
  ];

  const mockUsers = [
    { id: 1, email: "medico1@hospital.com", name: "Dr. Usuario 1" },
    { id: 2, email: "medico2@hospital.com", name: "Dra. Usuario 2" },
  ];

  const mockInvitations = [
    { id: 1, token: "abc123", used_count: 0, max_uses: 1 },
    { id: 2, token: "def456", used_count: 1, max_uses: 1 },
  ];

  // Si NO es master, bloquear
  if (!isMaster) {
    return (
      <main className="sr-container py-8">
        <section className="sr-card max-w-xl mx-auto space-y-3">
          <h1
