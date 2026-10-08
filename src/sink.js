export const FORME = {
  singola: { L: 340, P: 190, T: 62, B: 52, vasche: [{ cx: 0, w: 210, h: 116 }] },
  doppia: { L: 540, P: 190, T: 62, B: 52, vasche: [{ cx: -128, w: 196, h: 116 }, { cx: 128, w: 196, h: 116 }] },
}

export const GONNE_CHIUSE = {
  front: { rotationX: -90, '--shade': 0.04 },
  back: { rotationX: 90, '--shade': 0.3 },
  left: { rotationY: -90, '--shade': 0.18 },
  right: { rotationY: 90, '--shade': 0.34 },
}

const u = (n) => `calc(var(--u) * ${n})`

function pezzo(classe, x, y, w, h, devX, devY) {
  const el = document.createElement('div')
  el.className = classe
  Object.assign(el.style, { left: u(x), top: u(y), width: u(w), height: u(h), backgroundPosition: `${u(-devX)} ${u(-devY)}` })
  return el
}

const ALZA = 7
const MENSOLA = { distanza: 60, spessore: 22 }
const RUBINETTO = { piano: { alto: 58, sporge: 58 }, muro: { alto: 34, sporge: 66 }, largo: 9 }

function inPiedi(classe, x, y, w, h, giro = 0) {
  const el = pezzo(classe, x - w / 2, y - h, w, h, 0, 0)
  Object.assign(el.style, { transformOrigin: '50% 100%', transform: `rotateZ(${giro}deg) rotateX(-90deg)` })
  return el
}

function rubinetto(tipo, cx, P) {
  const { alto, sporge } = RUBINETTO[tipo]
  const { largo } = RUBINETTO
  const retro = -P / 2
  const base = tipo === 'muro' ? retro : retro + 16
  const fine = base + sporge
  const becco = pezzo('rubinetto rubinetto--becco', cx - largo / 2, base, largo, sporge, 0, 0)
  becco.style.transform = `translateZ(${u(alto)})`
  const bocca = pezzo('rubinetto rubinetto--bocca', cx - largo / 2, fine, largo, 8, 0, 0)
  Object.assign(bocca.style, { transformOrigin: '50% 0', transform: `translateZ(${u(alto)}) rotateX(-90deg)` })
  if (tipo === 'muro') {
    const rosetta = inPiedi('rubinetto rubinetto--rosetta', cx, retro, 22, 22)
    rosetta.style.transform = `translateZ(${u(alto - 11)}) rotateX(-90deg)`
    return [rosetta, becco, bocca]
  }
  return [inPiedi('rubinetto rubinetto--colonna', cx, base + 5, 11, alto), inPiedi('rubinetto rubinetto--colonna', cx, base + 5, 11, alto, 90), becco, bocca]
}

function mensola(L, P, T, sviluppo) {
  const { distanza, spessore: S } = MENSOLA
  const giu = `translateZ(${u(-(T + distanza))})`
  const piano = pezzo('lastra mensola', -L / 2, -P / 2, L, P, sviluppo.dx(-L / 2), sviluppo.dy(-P / 2))
  piano.style.transform = giu
  const lati = [
    ['front', -L / 2, P / 2, L, S, '50% 0', 'rotateX(-90deg)', 0.04],
    ['back', -L / 2, -P / 2 - S, L, S, '50% 100%', 'rotateX(90deg)', 0.3],
    ['left', -L / 2 - S, -P / 2, S, P, '100% 50%', 'rotateY(-90deg)', 0.18],
    ['right', L / 2, -P / 2, S, P, '0 50%', 'rotateY(90deg)', 0.34],
  ].map(([lato, x, y, w, h, perno, giro, ombra]) => {
    const el = pezzo(`lastra mensola mensola--${lato}`, x, y, w, h, sviluppo.dx(x), sviluppo.dy(y))
    Object.assign(el.style, { transformOrigin: perno, transform: `${giu} ${giro}` })
    el.style.setProperty('--shade', ombra)
    return el
  })
  return [piano, ...lati]
}

function faldeVasca(W, H, devX, devY) {
  const lungaY = Math.hypot(H / 2, ALZA)
  const lungaX = Math.hypot(W / 2, ALZA)
  const angY = (Math.atan2(ALZA, H / 2) * 180) / Math.PI
  const angX = (Math.atan2(ALZA, W / 2) * 180) / Math.PI
  return [
    ['back', 0, 0, W, lungaY, `rotateX(${-angY}deg)`, '50% 0', 'polygon(0 0, 100% 0, 50% 100%)', 'M0 0L50 100M100 0L50 100'],
    ['front', 0, H - lungaY, W, lungaY, `rotateX(${angY}deg)`, '50% 100%', 'polygon(0 100%, 100% 100%, 50% 0)', 'M0 100L50 0M100 100L50 0'],
    ['left', 0, 0, lungaX, H, `rotateY(${angX}deg)`, '0 50%', 'polygon(0 0, 100% 50%, 0 100%)', 'M0 0L100 50M0 100L100 50'],
    ['right', W - lungaX, 0, lungaX, H, `rotateY(${-angX}deg)`, '100% 50%', 'polygon(100% 0, 0 50%, 100% 100%)', 'M100 0L0 50M100 100L0 50'],
  ].map(([lato, x, y, w, h, giro, perno, forma, tagli]) => {
    const el = pezzo(`lastra falda falda--${lato}`, x, y, w, h, devX + x, devY + y)
    Object.assign(el.style, { transform: `translateZ(${u(ALZA)}) ${giro}`, transformOrigin: perno, clipPath: forma })
    el.innerHTML = `<span class="falda__ombra"></span><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${tagli}"/></svg>`
    return el
  })
}

function striscePiano(L, P, vasche) {
  const { h } = vasche[0]
  const y0 = -h / 2
  const y1 = h / 2
  const strisce = [[-L / 2, -P / 2, L, y0 + P / 2], [-L / 2, y1, L, P / 2 - y1]]
  let x = -L / 2
  for (const v of vasche) {
    strisce.push([x, y0, v.cx - v.w / 2 - x, h])
    x = v.cx + v.w / 2
  }
  strisce.push([x, y0, L / 2 - x, h])
  return strisce
}

export function buildSink(scene) {
  const tilt = document.createElement('div')
  tilt.className = 'sink-tilt'
  const rig = document.createElement('div')
  rig.className = 'sink-rig'
  tilt.append(rig)
  const shadow = document.createElement('div')
  shadow.className = 'sink-shadow'
  scene.append(shadow, tilt)
  scene.setAttribute('role', 'img')
  scene.setAttribute('aria-label', 'Lavandino in gres porcellanato')

  const sink = { scene, tilt, rig, shadow, extra: { mensola: false, rubinetto: null }, forma: 'singola' }

  sink.build = (forma) => {
    const { L, P, T, B, vasche } = FORME[forma]
    const dx = (x) => x + L / 2 + T
    const dy = (y) => y + P / 2 + T
    rig.replaceChildren()
    scene.dataset.forma = forma
    rig.style.setProperty('--sviluppo-w', u(L + 2 * T))
    rig.style.setProperty('--sviluppo-h', u(P + 2 * T))
    rig.style.setProperty('--scavo-max', B)
    Object.assign(shadow.style, { width: u(L * 1.4), height: u(P * 0.6) })

    const piano = striscePiano(L, P, vasche).map(([x, y, w, h]) => pezzo('lastra', x, y, w, h, dx(x), dy(y)))

    const gonne = {
      back: pezzo('lastra gonna gonna--back', -L / 2, -P / 2 - T, L, T, dx(-L / 2), 0),
      front: pezzo('lastra gonna gonna--front', -L / 2, P / 2, L, T, dx(-L / 2), dy(P / 2)),
      left: pezzo('lastra gonna gonna--left', -L / 2 - T, -P / 2, T, P, 0, dy(-P / 2)),
      right: pezzo('lastra gonna gonna--right', L / 2, -P / 2, T, P, dx(L / 2), dy(-P / 2)),
    }

    const offcuts = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => {
      const x = sx < 0 ? -L / 2 - T : L / 2
      const y = sy < 0 ? -P / 2 - T : P / 2
      const el = pezzo('lastra offcut', x, y, T, T, dx(x), dy(y))
      el.dataset.dir = `${sx},${sy}`
      return el
    })

    const conche = vasche.map((v) => {
      const x = v.cx - v.w / 2
      const y = -v.h / 2
      const fondo = pezzo('lastra fondo', x, y, v.w, v.h, dx(x), dy(y))
      fondo.style.setProperty('--bx', dx(x))
      fondo.style.setProperty('--by', dy(y))
      const piletta = document.createElement('span')
      piletta.className = 'piletta'
      const copertura = document.createElement('div')
      copertura.className = 'copertura'
      fondo.append(...faldeVasca(v.w, v.h, dx(x), dy(y)), copertura, piletta)
      const pareti = ['back', 'front', 'left', 'right'].map((lato) => {
        const orizz = lato === 'back' || lato === 'front'
        const px = lato === 'right' ? v.cx + v.w / 2 : x
        const py = lato === 'front' ? v.h / 2 : y
        const el = pezzo(`lastra parete parete--${lato}`, px, py, orizz ? v.w : 0, orizz ? 0 : v.h, dx(x), dy(y))
        el.style[orizz ? 'height' : 'width'] = ''
        return el
      })
      return { fondo, pareti }
    })

    rig.append(...offcuts, ...Object.values(gonne), ...conche.flatMap((c) => [c.fondo, ...c.pareti]), ...piano)
    Object.assign(sink, { gonne, offcuts, forma })
    return sink.dettagli()
  }

  sink.dettagli = (scelte = {}) => {
    Object.assign(sink.extra, scelte)
    const { L, P, T, vasche } = FORME[sink.forma]
    rig.querySelectorAll('.mensola, .rubinetto').forEach((el) => el.remove())
    const sviluppo = { dx: (x) => x + L / 2 + T, dy: (y) => y + P / 2 + T }
    if (sink.extra.mensola) rig.prepend(...mensola(L, P, T, sviluppo))
    if (sink.extra.rubinetto) rig.append(...vasche.flatMap((v) => rubinetto(sink.extra.rubinetto, v.cx, P)))
    scene.dataset.mensola = sink.extra.mensola ? 'si' : 'no'
    return sink
  }

  return sink.build('singola')
}
