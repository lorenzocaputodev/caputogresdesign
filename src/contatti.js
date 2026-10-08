import gsap from 'gsap'

import { mm } from './scorrimento.js'

// --- Contatti: increspature ---
const contatti = document.querySelector('.contatti')
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    let ultima = null
    const increspa = (e) => {
      if (e.pointerType !== 'mouse') return
      const r = contatti.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (ultima && Math.hypot(x - ultima.x, y - ultima.y) < 110) return
      ultima = { x, y }
      const onda = Object.assign(document.createElement('span'), { className: 'increspatura' })
      Object.assign(onda.style, { left: `${x}px`, top: `${y}px` })
      contatti.prepend(onda)
      gsap.fromTo(onda, { scale: 0.3, autoAlpha: 0.5 }, { scale: 2.6, autoAlpha: 0, duration: 1.8, ease: 'power2.out', onComplete: () => onda.remove() })
    }
    contatti.addEventListener('pointermove', increspa)
    return () => contatti.removeEventListener('pointermove', increspa)
  })
}
