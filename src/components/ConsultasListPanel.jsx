import React from "react";
import ConsultaCard from "./ConsultaCard.jsx";

export default function ConsultasListPanel({
  cases,
  filters,
  onFiltersChange,
  selectedCaseId,
  onSelectCase,
  onToggleFavorite,
  onToggleStatus,
}) {
  function handleStatusChange(e) {
    onFiltersChange({ status: e.target.value });
  }

  function handleSearchChange(e) {
    onFiltersChange({ search: e.target.value });
  }

  function handleFavoritesToggle() {
    onFiltersChange({ favoritesOnly: !filters.favoritesOnly });
  }

  return (
    <aside className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Buscar por titulo, sintoma, especialidad..."
            className="sr-input w-full text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="sr-input text-xs w-[130px]"
          >
            <option value="open">Abiertas</option>
            <option value="all">Todas</option>
            <option value="closed">Cerradas</option>
          </select>

          <button
            type="button"
            onClick={handleFavoritesToggle}
            className={`px-2 py-1 rounded-full border text-[11px] ${
              filters.favoritesOnly
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filters.favoritesOnly ? "⭐ Solo favoritas" : "⭐ Incluir favoritas"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[260px] max-h-[560px] overflow-y-auto space-y-2">
        {(!cases || cases.length === 0) && (
          <p className="text-xs text-slate-500">
            No hay consultas que coincidan con los filtros.
          </p>
        )}

        {(cases || []).map((c) => (
          <ConsultaCard
            key={c.id}
            item={c}
            isSelected={selectedCaseId === c.id}
            onClick={() => onSelectCase(c.id)}
            onToggleFavorite={onToggleFavorite}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </aside>
  );
}

