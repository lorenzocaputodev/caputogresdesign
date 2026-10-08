import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

import { quandoAperta } from './apertura.js'
import { hero, setAssembled } from './lavandini.js'
import { mm, stato } from './scorrimento.js'
import { GONNE_CHIUSE } from './sink.js'

// --- Hero ---
const goccia = document.createElement('span')
goccia.className = 'goccia'
goccia.innerHTML = '<svg viewBox="27.9 13.5 4.2 5.9" aria-hidden="true"><path d="M30 13.6s-2 2.4-2 3.7a2 2 0 0 0 4 0c0-1.3-2-3.7-2-3.7z"/><path class="goccia__luce" d="M29.1 17.1c-.1.7.2 1.2.6 1.4"/></svg>'
const onde = [0, 1].map(() => Object.assign(document.createElement('span'), { className: 'onda' }))
hero.rig.querySelector('.fondo').append(...onde, goccia)

mm.add('(prefers-reduced-motion: reduce)', () => {
  setAssembled(hero)
  gsap.set(hero.scene, { '--zoom-p': 1 })
  gsap.set(hero.tilt, { rotationX: 60 })
  gsap.set(hero.rig, { rotationZ: -30 })
})

mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.set(hero.tilt, { rotationX: 48 })
  gsap.set(hero.rig, { rotationZ: -22, '--scavo': 0 })
  gsap.set(hero.shadow, { autoAlpha: 0 })

  const split = SplitText.create('[data-split]', {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit: (self) => {
      const righe = gsap.from(self.lines, { yPercent: 105, duration: 1.2, stagger: 0.09, ease: 'expo.out', paused: true })
      quandoAperta(() => righe.play())
      document.documentElement.classList.remove('intro-titolo')
      return righe
    },
  })
  const ingresso = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true })
    .from('.hero__lead', { y: 16, autoAlpha: 0, duration: 0.9 }, 0.4)
    .from(hero.scene, { autoAlpha: 0, scale: 0.85, rotation: -8, duration: 1.6 }, 0.1)
  quandoAperta(() => ingresso.play())
  document.documentElement.classList.remove('intro')

  const fold = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
  fold.to(hero.rig, { '--cut': 1, duration: 0.6 })
  hero.offcuts.forEach((el) => {
    const [sx, sy] = el.dataset.dir.split(',').map(Number)
    fold.to(el, { x: sx * 120, y: sy * 120, autoAlpha: 0, duration: 1 }, 'cut')
  })
  const piega = { duration: 1.2, ease: 'power2.inOut' }
  fold
    .to(hero.gonne.back, { ...GONNE_CHIUSE.back, ...piega }, 'fold')
    .to(hero.gonne.left, { ...GONNE_CHIUSE.left, ...piega }, 'fold+=0.25')
    .to(hero.gonne.right, { ...GONNE_CHIUSE.right, ...piega }, 'fold+=0.5')
    .to(hero.gonne.front, { ...GONNE_CHIUSE.front, ...piega }, 'fold+=0.75')
    .addLabel('scavo', 'fold+=1.4')
    .to(hero.rig, { '--scavo': 1, duration: 1.4, ease: 'power2.inOut' }, 'scavo')
    .to(hero.rig, { '--cut': 0, duration: 0.6 }, 'scavo+=0.9')
    .to(hero.tilt, { rotationX: 60, y: 30, duration: 1.6, ease: 'power1.inOut' }, 'fold+=0.6')
    .to(hero.rig, { rotationZ: -30, duration: 1.6, ease: 'power1.inOut' }, 'fold+=0.6')
    .fromTo(hero.scene, { '--zoom-p': 0 }, { '--zoom-p': 1, duration: 1.6, ease: 'power1.inOut' }, 'fold+=0.6')
    .to(hero.shadow, { autoAlpha: 1, duration: 0.8 }, 'scavo+=0.6')
    .addLabel('acqua', 'scavo+=1.6')
    .to('.hero__hint', { autoAlpha: 0, duration: 0.4 }, 'acqua')
    .fromTo(goccia, { '--alto': 320 }, { '--alto': 2, duration: 0.9, ease: 'power2.in' }, 'acqua')
    .fromTo(goccia, { autoAlpha: 0 }, { autoAlpha: 0.95, duration: 0.2 }, 'acqua')
    .to(goccia, { autoAlpha: 0, duration: 0.1 }, 'acqua+=0.88')
    .fromTo(onde, { scale: 0.5, autoAlpha: 0.9 }, { scale: 3.4, autoAlpha: 0, duration: 0.8, ease: 'power2.out', stagger: 0.15, immediateRender: false }, 'acqua+=0.9')
    .fromTo(hero.rig, { '--luce': -40 }, { '--luce': 140, duration: 0.9, ease: 'power1.inOut' }, 'acqua+=0.95')

  const scena = ScrollTrigger.create({
    trigger: '[data-hero]',
    start: 'top top',
    end: () => `+=${innerHeight * 1.8}`,
    pin: true,
    scrub: 0.4,
    animation: fold,
    refreshPriority: 2,
    onRefresh: (self) => (stato.fineHero = self.end),
  })
  stato.fineHero = scena.end

  return () => {
    scena.kill()
    stato.fineHero = 0
    split.revert()
  }
})
