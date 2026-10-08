import { ScrollTrigger } from 'gsap/ScrollTrigger'

// --- Header ---
const top = document.querySelector('[data-top]')
ScrollTrigger.create({
  onUpdate: (self) => top.classList.toggle('is-scrolled', self.scroll() > 40),
})

// --- Menu ---
const menu = document.querySelector('[data-menu]')
const menuBtn = document.querySelector('[data-menu-btn]')
function apriMenu(aperto) {
  top.classList.toggle('is-menu', aperto)
  menuBtn.setAttribute('aria-expanded', aperto)
  menuBtn.setAttribute('aria-label', aperto ? 'Chiudi il menu' : 'Apri il menu')
}
menuBtn.addEventListener('click', () => apriMenu(!top.classList.contains('is-menu')))
menu.addEventListener('click', (e) => e.target.closest('a') && apriMenu(false))
document.addEventListener('click', (e) => !menu.contains(e.target) && !menuBtn.contains(e.target) && apriMenu(false))
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !top.classList.contains('is-menu')) return
  apriMenu(false)
  menuBtn.focus()
})
matchMedia('(min-width: 761px)').addEventListener('change', () => apriMenu(false))

// --- Menu: sezione attiva ---
export function sezioneAttiva() {
  menu.querySelectorAll('a').forEach((voce) =>
    ScrollTrigger.create({
      trigger: voce.hash,
      start: 'top 45%',
      end: 'bottom 45%',
      refreshPriority: -1,
      onToggle: (self) => (self.isActive ? voce.setAttribute('aria-current', 'location') : voce.removeAttribute('aria-current')),
    }),
  )
}
