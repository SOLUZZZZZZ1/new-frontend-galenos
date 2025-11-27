// src/lib/newsApi.js
const API = "/api";

export async function fetchNews({ source = "", tag = "", q = "" } = {}) {
  const params = new URLSearchParams();
  if (source) params.set("source", source);
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const url = `${API}/news${params.toString() ? `?${params}` : ""}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`News ${r.status}`);
  return r.json();
}
