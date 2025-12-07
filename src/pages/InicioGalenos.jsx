// src/pages/InicioGalenos.jsx — Landing Galenos.pro (CORREGIDA)
// La landing YA NO llama a Stripe. Siempre manda primero al alta del médico.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InicioGalenos() {
  const nav = useNavigate();

  // ⛔ Eliminamos toda lógica Stripe en la landing
  async function handleStartProTrial() {
    console.log("👉 Redirigiendo al alta del médico desde la landing...");
    nav("/alta-medico?next=pro");
  }

  return (
    <main className="min-h-[80vh] flex flex-col">
      {/* HERO PRINCIPAL */}
      <section className="sr-container flex-1 grid md:grid-cols-2 gap-10 items-center px-4 py-10">
        {/* COLUMNA IZQUIERDA: MENSAJE PRINCIPAL */}
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-sky-700 uppercase mb-2">
            IA clínica prudente para médicos
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
            Menos burocracia.
            <span className="block text-sky-800">Más medicina.</span>
          </h1>

          <p className="text
