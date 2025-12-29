export function mskKey(imagingId) {
  return imagingId ? `msk_atlas_cfg_${imagingId}` : "";
}

export function loadMskCfg(imagingId) {
  const key = mskKey(imagingId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveMskCfg(imagingId, cfg) {
  const key = mskKey(imagingId);
  if (!key) return false;
  try {
    localStorage.setItem(key, JSON.stringify(cfg));
    return true;
  } catch {
    return false;
  }
}
