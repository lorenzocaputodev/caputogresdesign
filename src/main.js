import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './lavandini.js'
import './scorrimento.js'
import { quandoAperta } from './apertura.js'
import './dialoghi.js'
import { sezioneAttiva } from './menu.js'
import './hero.js'
import './galleria.js'
import './ingressi.js'
import { adattaLavandino } from './componi.js'
import './contatti.js'
import './cursore.js'

// --- Anno ---
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()))

// --- Immagini ---
const inAttesa = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 200))
const risparmio = navigator.connection?.saveData || /(^|-)2g$/.test(navigator.connection?.effectiveType ?? '')
const primoScroll = () => addEventListener('scroll', () => setTimeout(decodifica, 300), { once: true, passive: true })
if (!risparmio) addEventListener('load', () => quandoAperta(primoScroll))
function decodifica() {
  const coda = [
    ...document.querySelectorAll('img[loading="lazy"]'),
    ...[...document.querySelectorAll('[data-gruppo="finish"] [data-finish]')].map((b) => Object.assign(new Image(), { src: `/textures/${b.dataset.finish}.webp` })),
  ]
  const prossima = () => {
    const img = coda.shift()
    if (!img) return
    img.loading = 'eager'
    img.decode().catch(() => {}).finally(() => inAttesa(prossima))
  }
  inAttesa(prossima)
}

// --- Avvio ---
sezioneAttiva()
document.fonts?.ready.then(() => {
  adattaLavandino()
  ScrollTrigger.refresh()
})
