import gsap from 'gsap'

// --- Cursore ---
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cursore = document.createElement('div')
  cursore.className = 'cursore is-fuori'
  cursore.setAttribute('aria-hidden', 'true')
  cursore.innerHTML = '<div class="cursore__anello"><span>Trascina</span></div><div class="cursore__punto"></div>'
  document.body.append(cursore)
  document.documentElement.classList.add('ha-cursore')

  const [anello, punto] = cursore.children
  const anelloX = gsap.quickTo(anello, 'x', { duration: 0.45, ease: 'power3.out' })
  const anelloY = gsap.quickTo(anello, 'y', { duration: 0.45, ease: 'power3.out' })
  const puntoX = gsap.quickSetter(punto, 'x', 'px')
  const puntoY = gsap.quickSetter(punto, 'y', 'px')

  let ultimo = null
  const stato = (sotto) => {
    const trascina = !!sotto?.closest('[data-drag]')
    cursore.classList.toggle('is-trascina', trascina)
    cursore.classList.toggle('is-link', !trascina && !!sotto?.closest('a, button:not(:disabled), [role="radio"], label, textarea'))
  }

  addEventListener('pointermove', (e) => {
    const mouse = e.pointerType === 'mouse'
    document.documentElement.classList.toggle('ha-cursore', mouse)
    if (!mouse) return cursore.classList.add('is-fuori')
    ultimo = { x: e.clientX, y: e.clientY }
    cursore.classList.remove('is-fuori')
    anelloX(e.clientX)
    anelloY(e.clientY)
    puntoX(e.clientX)
    puntoY(e.clientY)
    stato(e.target instanceof Element ? e.target : null)
  })
  let fineScroll
  addEventListener(
    'scroll',
    () => {
      clearTimeout(fineScroll)
      fineScroll = setTimeout(() => ultimo && stato(document.elementFromPoint(ultimo.x, ultimo.y)), 120)
    },
    { passive: true },
  )
  addEventListener('pointerdown', () => cursore.classList.add('is-premuto'))
  addEventListener('pointerup', () => cursore.classList.remove('is-premuto'))
  document.documentElement.addEventListener('pointerleave', () => cursore.classList.add('is-fuori'))
}
