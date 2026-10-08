import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

import { mm } from './scorrimento.js'

// --- Come nasce: passi ---
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const passi = gsap.utils.toArray('.process__list li')
  gsap.set(passi, { autoAlpha: 0, y: 36, '--traccia': 0 })
  ScrollTrigger.batch(passi, {
    start: 'top 86%',
    once: true,
    onEnter: (gruppo) => {
      gsap.to(gruppo, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.18, overwrite: true })
      gsap.to(gruppo, { '--traccia': 1, duration: 1.4, ease: 'power2.inOut', stagger: 0.18, delay: 0.5 })
    },
  })
})

// --- Titoli, testi e foto delle sezioni ---
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const sezioni = [
    ['.lavori__head h2', '.lavori__head p'],
    ['.process__aside h2', '.process__aside > p'],
    ['.finiture__copy h2', '.finiture__copy > p'],
    ['.contatti__testo h2', '.contatti__testo > p:first-of-type'],
  ]
  const titoli = sezioni.map(([titolo, testo]) => {
    const h2 = document.querySelector(titolo)
    const p = document.querySelector(testo)
    gsap.set(p, { autoAlpha: 0, y: 18 })
    return SplitText.create(h2, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.timeline({ scrollTrigger: { trigger: h2, start: 'top 86%', once: true } })
          .from(self.lines, { yPercent: 105, duration: 1.1, stagger: 0.08, ease: 'expo.out' })
          .to(p, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.3),
    })
  })

  gsap.utils.toArray('.process__foto, .contatti__foto').forEach((foto) => {
    gsap.timeline({ scrollTrigger: { trigger: foto, start: 'top 82%', once: true } })
      .fromTo(foto.querySelector('img'), { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power3.inOut' })
      .from(foto.querySelector('.cornice__lastra'), { autoAlpha: 0, x: -24, y: -16, duration: 1.1, ease: 'power3.out' }, 0.55)
  })

  return () => titoli.forEach((t) => t.revert())
})

// --- Giunti ---
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.utils.toArray('.giunto').forEach((giunto) => {
    gsap.timeline({ scrollTrigger: { trigger: giunto, start: 'top 80%', once: true } })
      .fromTo(giunto, { '--apertura': 0 }, { '--apertura': 1, duration: 2.2, ease: 'power2.inOut' }, 0.35)
      .from(giunto.querySelector('span'), { scale: 0, rotation: -90, duration: 1.2, ease: 'power2.out' }, 0)
  })
})
