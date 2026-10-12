// --- Testo ---
const NOMI_PROPRI = /^(Carrara|Calacatta)/
export const minuscola = (s) => s.replace(/^\S+/, (p) => (NOMI_PROPRI.test(p) ? p : p.toLowerCase()))
