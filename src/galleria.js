import gsap from 'gsap'

import { apriDialogo, apriWhatsApp, chiudiSulFondo, chiusoDialogo, minuscola } from './dialoghi.js'
import { arrivato, ferma, mm, riprendi, stato } from './scorrimento.js'

const PAUSA_GALLERY = 0.45
const RIARMO = 0.97

// --- Lavori: scorrimento orizzontale ---
const track = document.querySelector('[data-lavori]')
const lavoriViewport = track.parentElement

mm.add('(prefers-reduced-motion: no-preference)', () => {
  lavoriViewport.removeAttribute('tabindex')
  const distanza = () => track.scrollWidth - lavoriViewport.clientWidth
  let blocco = 'libero'
  let sblocco
  const scorri = gsap.to(track, {
    x: () => -distanza(),
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-lavori-pin]',
      start: 'top top',
      end: () => `+=${distanza()}`,
      pin: true,
      scrub: 0.6,
      refreshPriority: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (self.progress < RIARMO && blocco === 'fatto') blocco = 'libero'
        if (blocco !== 'libero' || !arrivato(self)) return
        blocco = 'fatto'
        stato.lenis.scrollTo(self.end, { immediate: true, force: true })
        ferma('gallery')
        sblocco = gsap.delayedCall(PAUSA_GALLERY, () => riprendi('gallery'))
      },
    },
  })
  const annullaPausa = () => {
    sblocco?.kill()
    riprendi('gallery')
  }
  stato.annulla.add(annullaPausa)

  track.querySelectorAll('.lavoro').forEach((card) => {
    const media = card.querySelector('.lavoro__media')
    const segui = { trigger: card, containerAnimation: scorri, scrub: true }
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { ...segui, start: 'left right', end: 'right left' } })
      .fromTo(media.querySelector('img'), { xPercent: -4 }, { xPercent: 4 }, 0)
      .fromTo(card.querySelector('.cornice__lastra'), { xPercent: 6, yPercent: 3 }, { xPercent: -6, yPercent: -3 }, 0)
    const arrivo = () => ((card.offsetLeft - distanza()) / lavoriViewport.clientWidth) * 100
    gsap.timeline({ scrollTrigger: { ...segui, start: 'left 95%', end: () => `left ${Math.max(45, arrivo() + 2)}%` } })
      .fromTo(card.querySelector('.lavoro__velo'), { scaleX: 1 }, { scaleX: 0, ease: 'power2.out', duration: 1 }, 0)
      .from(card.querySelector('figcaption'), { autoAlpha: 0, ease: 'power1.out', duration: 0.6 }, 0.2)
  })

  return () => {
    annullaPausa()
    stato.annulla.delete(annullaPausa)
  }
})

mm.add('(prefers-reduced-motion: reduce)', () => {
  lavoriViewport.tabIndex = 0
})

// --- Lavori: foto grandi ---
const fotoDialog = document.querySelector('[data-foto]')
const fotoImg = fotoDialog.querySelector('.foto__img')
const schede = [...track.querySelectorAll('.lavoro')]
const testoScheda = (scheda, sel) => scheda.querySelector(sel).textContent.trim()
let fotoAperta = 0

function mostraFoto(i) {
  fotoAperta = (i + schede.length) % schede.length
  const scheda = schede[fotoAperta]
  const img = scheda.querySelector('img')
  fotoImg.src = img.getAttribute('src')
  fotoImg.alt = img.alt
  fotoDialog.querySelector('#foto-titolo').textContent = testoScheda(scheda, 'figcaption strong')
  fotoDialog.querySelector('[data-foto-desc]').textContent = testoScheda(scheda, 'figcaption span')
  fotoDialog.querySelector('[data-foto-finitura]').textContent = testoScheda(scheda, '.cornice__etichetta')
  fotoDialog.querySelector('[data-foto-conta]').textContent = `${fotoAperta + 1} di ${schede.length}`
}

schede.forEach((scheda, i) =>
  scheda.querySelector('[data-ingrandisci]').addEventListener('click', () => {
    mostraFoto(i)
    apriDialogo(fotoDialog, 'foto')
  }),
)
fotoDialog.querySelectorAll('[data-passo]').forEach((btn) => btn.addEventListener('click', () => mostraFoto(fotoAperta + Number(btn.dataset.passo))))
fotoDialog.addEventListener('keydown', (e) => {
  const passo = { ArrowLeft: -1, ArrowRight: 1 }[e.key]
  if (!passo || e.target.closest('textarea')) return
  e.preventDefault()
  mostraFoto(fotoAperta + passo)
})
let swipe = null
fotoImg.addEventListener('pointerdown', (e) => (swipe = e.isPrimary ? e.clientX : null))
fotoImg.addEventListener('pointerup', (e) => {
  if (swipe === null || Math.abs(e.clientX - swipe) < 50) return
  mostraFoto(fotoAperta + (e.clientX < swipe ? 1 : -1))
  swipe = null
})
chiudiSulFondo(fotoDialog)
fotoDialog.addEventListener('close', () => chiusoDialogo('foto'))
fotoDialog.querySelector('[data-wa-simile]').addEventListener('click', (e) => {
  e.preventDefault()
  const scheda = schede[fotoAperta]
  fotoDialog.close()
  apriWhatsApp(`Ciao! Ho visto sul sito il lavoro «${testoScheda(scheda, 'figcaption strong')}» (${minuscola(testoScheda(scheda, '.cornice__etichetta'))}) e vorrei qualcosa di simile per il mio spazio.`)
})
