import { CONFIG } from './config.js'
import { ferma, riprendi } from './scorrimento.js'

// --- WhatsApp ---
const waDialog = document.querySelector('[data-wa]')
const waText = waDialog.querySelector('textarea')
let ultimoTesto = CONFIG.whatsappText
const NOMI_PROPRI = /^(Carrara|Calacatta)/
export const minuscola = (s) => s.replace(/^\S+/, (p) => (NOMI_PROPRI.test(p) ? p : p.toLowerCase()))
waText.value = CONFIG.whatsappText

export function apriDialogo(dialogo, chi) {
  dialogo.showModal()
  document.documentElement.classList.add('con-dialogo')
  ferma(chi)
}
export function chiusoDialogo(chi) {
  if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('con-dialogo')
  riprendi(chi)
}
export function chiudiSulFondo(dialogo) {
  let premutoSulFondo = false
  dialogo.addEventListener('pointerdown', (e) => (premutoSulFondo = e.target === dialogo))
  dialogo.addEventListener('click', (e) => premutoSulFondo && e.target === dialogo && dialogo.close())
}
export function apriWhatsApp(testo = CONFIG.whatsappText) {
  if (testo !== ultimoTesto) waText.value = testo
  ultimoTesto = testo
  apriDialogo(waDialog, 'wa')
}

document.querySelectorAll('[data-wa-open]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault()
    apriWhatsApp()
  }),
)
chiudiSulFondo(waDialog)
waDialog.querySelector('form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'invia') return
  const testo = waText.value.trim() || CONFIG.whatsappText
  window.open(`https://wa.me/${atob(CONFIG.whatsapp)}?text=${encodeURIComponent(testo)}`, '_blank', 'noopener')
})
waDialog.addEventListener('close', () => chiusoDialogo('wa'))
