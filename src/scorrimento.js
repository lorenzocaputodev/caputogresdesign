import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)
ScrollTrigger.config({ ignoreMobileResize: true })

// --- Scroll fluido ---
export const mm = gsap.matchMedia()
export const mqRidotto = matchMedia('(prefers-reduced-motion: reduce)')
export const stato = { lenis: undefined, annulla: new Set(), navigazione: false, fineHero: 0, tocco: false }
const pause = new Set()
const muoviLenis = (t) => stato.lenis?.raf(t * 1000)
const scorta = { px: 150, t: 0 }
let gestoNelHero = false
const FRENO = { wheel: { px: 150, ritmo: 0.9 }, touch: { px: 70, ritmo: 1.4 } }

function frenaHero(data) {
  const e = data.event
  const lenis = stato.lenis
  if (!lenis || e.ctrlKey) return
  const tocco = e.type.startsWith('touch')
  const dentro = !stato.navigazione && lenis.targetScroll < stato.fineHero
  if (tocco) {
    if (e.type === 'touchstart') gestoNelHero = !stato.navigazione && lenis.targetScroll < stato.fineHero - 2
    lenis.options.syncTouch = gestoNelHero
    lenis.options.touchInertiaExponent = dentro ? 1.25 : 1.7
  }
  if (!dentro || !data.deltaY || e.type === 'touchend') return
  const freno = FRENO[tocco ? 'touch' : 'wheel']
  const ora = performance.now()
  scorta.px = Math.min(freno.px, scorta.px + (ora - scorta.t) * freno.ritmo)
  scorta.t = ora
  data.deltaY = gsap.utils.clamp(-scorta.px, scorta.px, data.deltaY)
  scorta.px -= Math.abs(data.deltaY)
  if (data.deltaY) return
  if (e.cancelable) e.preventDefault()
  return false
}

export function ferma(chi) {
  pause.add(chi)
  stato.lenis?.stop()
}
export function riprendi(chi) {
  pause.delete(chi)
  if (!pause.size) stato.lenis?.start()
}

mm.add('(prefers-reduced-motion: no-preference)', () => {
  stato.lenis = new Lenis({ autoRaf: false, anchors: { onComplete: () => (stato.navigazione = false) }, lerp: 0.1, virtualScroll: frenaHero })
  stato.lenis.on('scroll', ScrollTrigger.update)
  if (pause.size) stato.lenis.stop()
  gsap.ticker.add(muoviLenis)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(muoviLenis)
    gsap.ticker.lagSmoothing(500, 33)
    stato.lenis.destroy()
    stato.lenis = undefined
  }
})

addEventListener(
  'click',
  (e) => {
    if (!e.target.closest?.('a[href^="#"]:not([data-wa-open], [data-wa-idea], [data-wa-simile])')) return
    stato.navigazione = true
    stato.annulla.forEach((annulla) => annulla())
  },
  true,
)
for (const tipo of ['wheel', 'touchstart', 'keydown'])
  addEventListener(
    tipo,
    (e) => {
      stato.navigazione = false
      stato.tocco = e.type === 'touchstart'
    },
    { passive: true },
  )

export const arrivato = (self) => self.progress >= 1 && self.direction > 0 && !!stato.lenis && !stato.navigazione && !stato.tocco
