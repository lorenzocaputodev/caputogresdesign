import gsap from 'gsap'

import { buildSink, GONNE_CHIUSE } from './sink.js'

// --- Lavandini 3D ---
export const hero = buildSink(document.querySelector('[data-sink="hero"]'))
export const showcase = buildSink(document.querySelector('[data-sink="finiture"]'))

// --- Fuori schermo ---
const fuoriVista = new IntersectionObserver((voci) => voci.forEach((v) => v.target.classList.toggle('is-lontano', !v.isIntersecting)), { rootMargin: '30% 0px' })
document.querySelectorAll('.sink-scene, .mappa').forEach((el) => fuoriVista.observe(el))

export function setAssembled(s) {
  for (const [lato, stato] of Object.entries(GONNE_CHIUSE)) gsap.set(s.gonne[lato], stato)
  gsap.set(s.offcuts, { autoAlpha: 0 })
  gsap.set(s.rig, { '--scavo': 1, '--cut': 0 })
  gsap.set(s.shadow, { autoAlpha: 1 })
}
setAssembled(showcase)
gsap.set(showcase.tilt, { rotationX: 62 })
gsap.set(showcase.rig, { rotation: -32 })
