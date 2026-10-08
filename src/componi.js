import gsap from 'gsap'

import { apriWhatsApp, minuscola } from './dialoghi.js'
import { setAssembled, showcase } from './lavandini.js'
import { mqRidotto } from './scorrimento.js'
import { FORME } from './sink.js'

// --- Finiture: superficie, scarico e trascinamento ---
function gruppoRadio(gruppo, onScelta) {
  const opzioni = [...gruppo.querySelectorAll('[role="radio"]')]
  const scegli = (btn) => {
    opzioni.forEach((b) => {
      b.setAttribute('aria-checked', String(b === btn))
      b.tabIndex = b === btn ? 0 : -1
    })
    onScelta(btn)
  }
  opzioni.forEach((btn, i) => {
    btn.tabIndex = btn.getAttribute('aria-checked') === 'true' ? 0 : -1
    btn.addEventListener('click', () => scegli(btn))
    btn.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (!dir) return
      e.preventDefault()
      const next = opzioni[(i + dir + opzioni.length) % opzioni.length]
      next.focus()
      scegli(next)
    })
  })
}

const stage = document.querySelector('[data-drag]')
const copiaFiniture = document.querySelector('.finiture__copy')
const ingombro = (forma) => {
  const { L, P, T } = FORME[forma]
  const giro = (32 * Math.PI) / 180
  return (L + 2 * T) * Math.cos(giro) + (P + 2 * T) * Math.sin(giro)
}
showcase.scene.style.setProperty('--scala-doppia', ingombro('singola') / ingombro('doppia'))
export function adattaLavandino() {
  if (innerWidth <= 900) {
    showcase.scene.style.removeProperty('--u-base')
    stage.style.removeProperty('--sposta')
    return
  }
  const st = stage.getBoundingClientRect()
  const righe = document.createRange()
  righe.selectNodeContents(copiaFiniture.querySelector('h2'))
  const testo = Math.max(righe.getBoundingClientRect().right, ...[...copiaFiniture.querySelectorAll(':scope > p, .scelta, .idea')].map((el) => el.getBoundingClientRect().right))
  const sinistra = st.left - testo - 32
  const destra = document.documentElement.clientWidth - st.right - 16
  const larghezza = Math.min(st.width + sinistra + destra, ingombro('singola') * 1.7, st.height * 1.8)
  showcase.scene.style.setProperty('--u-base', `${larghezza / ingombro('singola')}px`)
  stage.style.setProperty('--sposta', `${(destra - sinistra) / 2}px`)
}
adattaLavandino()
addEventListener('resize', adattaLavandino)
const rotZ = gsap.quickTo(showcase.rig, 'rotation', { duration: 0.6, ease: 'power3.out' })
const rotX = gsap.quickTo(showcase.tilt, 'rotationX', { duration: 0.6, ease: 'power3.out' })
const rimbalzo = () => !mqRidotto.matches && gsap.fromTo(showcase.rig, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'back.out(2)' })
const notaScarico = document.querySelector('[data-scarico-nota]')
const alone = document.querySelector('.finiture__alone')
let cambio = null

function cambia(applica) {
  cambio?.progress(1)
  if (mqRidotto.matches) return applica()
  cambio = gsap.timeline()
    .to(showcase.scene, { x: -28, autoAlpha: 0, duration: 0.22, ease: 'power2.in' })
    .to(alone, { autoAlpha: 0, duration: 0.22 }, 0)
    .add(applica)
    .fromTo(showcase.scene, { x: 28 }, { x: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' })
    .to(alone, { autoAlpha: 1, duration: 0.7, ease: 'power1.out' }, '<')
}

gruppoRadio(document.querySelector('[data-gruppo="forma"]'), (btn) =>
  cambia(() => {
    showcase.build(btn.dataset.forma)
    setAssembled(showcase)
  }),
)
gruppoRadio(document.querySelector('[data-gruppo="finish"]'), (btn) =>
  cambia(() => {
    showcase.scene.dataset.finish = btn.dataset.finish
    alone.dataset.finish = btn.dataset.finish
  }),
)
showcase.dettagli({ rubinetto: 'muro' })
gruppoRadio(document.querySelector('[data-gruppo="rubinetto"]'), (btn) => {
  showcase.dettagli({ rubinetto: btn.dataset.rubinetto })
  rotX(56)
  rimbalzo()
})
gruppoRadio(document.querySelector('[data-gruppo="mensola"]'), (btn) =>
  cambia(() => {
    showcase.dettagli({ mensola: btn.dataset.mensola === 'si' })
    rotX(btn.dataset.mensola === 'si' ? 40 : 62)
  }),
)
gruppoRadio(document.querySelector('[data-gruppo="scarico"]'), (btn) => {
  showcase.scene.dataset.scarico = btn.dataset.scarico
  notaScarico.textContent = btn.dataset.nota
  rotX(44)
  rimbalzo()
})

const scelto = (gruppo) => document.querySelector(`[data-gruppo="${gruppo}"] [aria-checked="true"]`)
const SCARICHI = { scomparsa: 'uno scarico a scomparsa', scivolo: 'uno scarico a scivolo' }
document.querySelector('[data-wa-idea]').addEventListener('click', (e) => {
  e.preventDefault()
  const forma = scelto('forma').dataset.forma === 'doppia' ? 'a due vasche' : 'a una vasca'
  const superficie = minuscola(scelto('finish').textContent.trim())
  const scarico = scelto('scarico')
  const descrizioneScarico = SCARICHI[scarico.dataset.scarico] ?? `la ${minuscola(scarico.textContent.trim())}`
  const rubinetto = scelto('rubinetto').dataset.rubinetto === 'piano' ? 'rubinetto sul piano' : 'rubinetto a muro'
  const conMensola = scelto('mensola').dataset.mensola === 'si' ? ' e una mensola sotto dello stesso gres' : ''
  apriWhatsApp(`Ciao! Ho provato «Componi» sul sito: mi piace l'idea di un lavandino ${forma}, effetto ${superficie}, con ${descrizioneScarico}, ${rubinetto}${conMensola}. Vorrei capire cosa si può fare per il mio spazio.`)
})

let drag = null
stage.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || !e.isPrimary) return
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY, z: gsap.getProperty(showcase.rig, 'rotation'), rx: gsap.getProperty(showcase.tilt, 'rotationX') }
  stage.setPointerCapture(e.pointerId)
  stage.classList.add('is-dragging')
})
stage.addEventListener('pointermove', (e) => {
  if (drag?.id !== e.pointerId) return
  rotZ(drag.z - (e.clientX - drag.x) * 0.4)
  rotX(gsap.utils.clamp(0, 82, drag.rx - (e.clientY - drag.y) * 0.3))
})
const endDrag = (e) => {
  if (drag?.id !== e.pointerId) return
  drag = null
  stage.classList.remove('is-dragging')
}
stage.addEventListener('pointerup', endDrag)
stage.addEventListener('pointercancel', endDrag)
stage.addEventListener('lostpointercapture', endDrag)
