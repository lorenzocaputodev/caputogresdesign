import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

import { ferma, mqRidotto, riprendi } from './scorrimento.js'

// --- Apertura ---
const inAttesa = []
let aperta = true
export const quandoAperta = (fn) => (aperta ? fn() : inAttesa.push(fn))
const apri = () => {
  aperta = true
  inAttesa.splice(0).forEach((fn) => fn())
}
const VENE = '<path d="M-80 120L-7 149L34 169L77 183L145 201L187 221L228 243L276 252L328 271L402 274L464 256L552 237L608 224L667 214L754 205L832 205L893 219L938 226L991 233L1051 236L1125 227L1208 205L1288 187L1358 172L1448 175L1545 175L1594 168"/><path d="M-80 520L12 545L55 571L100 603L152 649L186 673L243 707L331 742L400 784L477 807L520 820L599 865L680 895L727 904L801 928L851 948L898 968L937 983L983 1004L1020 1027L1092 1083L1138 1113L1192 1144L1272 1183L1357 1232L1401 1247L1446 1264"/><path d="M300 -80L368 -34L402 5L459 79L506 152L541 242L550 320L561 368L564 411L549 481L535 574L551 661L552 715L554 770L546 845L541 894L514 983L501 1056L471 1144L473 1214L461 1285L452 1351L445 1403L423 1449L392 1511L368 1566L354 1635"/><path d="M900 -80L953 2L986 59L1027 117L1064 164L1109 233L1132 296L1146 336L1176 400L1186 445L1177 541L1175 588L1170 674L1164 731L1142 821L1110 903L1076 990L1043 1056L1023 1097L994 1172L965 1262L939 1335L907 1419L894 1463L869 1518L849 1589L830 1634"/><path d="M-80 860L-35 871L49 902L99 932L151 951L200 965L259 996L346 1038L391 1095L427 1142L438 1203L439 1271L440 1341L437 1384L423 1438L405 1479L384 1517L350 1583L310 1643L264 1711L235 1797L215 1893L200 1941L188 1983L187 2072L170 2154L166 2241"/>'
const RAMI = '<path d="M938 226L999 215L1027 206L1067 166L1089 133L1109 82"/><path d="M228 243L279 229L316 236L361 253L412 265L471 262L506 244L555 249"/><path d="M1051 236L1092 235L1150 242L1192 261L1242 293L1267 321L1307 332"/><path d="M801 928L819 987L830 1031L830 1059L817 1104L777 1137L751 1162L717 1205L684 1237L657 1260"/><path d="M520 820L564 785L609 756L670 742L703 737L747 714L784 677L822 664L852 658L895 648"/><path d="M801 928L851 925L904 906L963 908L1017 922L1049 931L1104 926L1162 905L1203 910"/><path d="M473 1214L528 1215L571 1226L630 1213L669 1196"/><path d="M461 1285L502 1266L534 1249L563 1196L586 1141L610 1105L627 1067L639 1017"/><path d="M501 1056L549 1083L592 1115L635 1141L672 1191L678 1225L672 1269"/><path d="M965 1262L1002 1261L1050 1274L1078 1310L1106 1353L1116 1389"/><path d="M1064 164L1066 198L1084 238L1100 292L1114 332"/><path d="M994 1172L989 1211L1023 1256L1052 1286L1088 1302L1114 1317L1158 1347"/><path d="M391 1095L444 1064L472 1022L504 983L544 937L557 911L575 890L593 858L611 819"/><path d="M259 996L306 965L340 919L362 892L409 873"/><path d="M310 1643L351 1679L386 1714L410 1735L440 1755"/>'

if (document.documentElement.classList.contains('con-sipario') && !mqRidotto.matches) {
  try {
    sessionStorage.setItem('sipario', '1')
  } catch {}
  ferma('sipario')
  aperta = false
  document.querySelectorAll('.sipario__lastra').forEach((lastra) =>
    lastra.insertAdjacentHTML('afterbegin', `<svg class="sipario__vene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><g class="morbide">${VENE}</g><g class="nette">${VENE}</g><g class="rami">${RAMI}</g></svg>`),
  )
  const marchio = document.querySelector('.brand__mark').cloneNode(true)
  marchio.querySelector('mask').id = 'sipario-mask'
  marchio.querySelector('[mask]').setAttribute('mask', 'url(#sipario-mask)')
  document.querySelector('.sipario__marchio').prepend(marchio)
  gsap.set(marchio, { autoAlpha: 0 })
  const lontano = () => Math.max(innerWidth, innerHeight)
  const avvia = () => {
    const lettere = SplitText.create('.sipario__nome', { type: 'chars', mask: 'chars' })
    gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('con-sipario')
        lettere.revert()
        riprendi('sipario')
      },
    })
      .from(marchio, { autoAlpha: 0, y: 10, scale: 0.9, duration: 0.8, ease: 'power3.out' })
      .from(lettere.chars, { yPercent: 110, duration: 0.9, stagger: 0.035, ease: 'expo.out' }, 0.2)
      .fromTo('.sipario__bordo', { rotation: 45, scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.6)
      .to('.sipario__marchio', { autoAlpha: 0, y: -8, duration: 0.4, ease: 'power2.in' }, 2.2)
      .set('.sipario', { backgroundColor: 'transparent' }, 2.5)
      .to('.sipario__lastra--a', { x: () => -lontano(), y: () => lontano(), duration: 1.2, ease: 'power3.inOut' }, 2.5)
      .to('.sipario__lastra--b', { x: () => lontano(), y: () => -lontano(), duration: 1.2, ease: 'power3.inOut' }, 2.5)
      .call(apri, null, 3.1)
    gsap.set('.sipario__nome', { visibility: 'visible' })
  }
  const pronto = new Promise((ok) => setTimeout(ok, 400))
  Promise.race([document.fonts?.ready ?? pronto, pronto]).then(() => requestAnimationFrame(() => requestAnimationFrame(avvia)))
} else {
  document.documentElement.classList.remove('con-sipario')
}
