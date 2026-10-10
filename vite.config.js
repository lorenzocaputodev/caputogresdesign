import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { CONFIG } from './src/config.js'
import { LAVORI } from './src/lavori.js'

// --- SEO ---
const datiStrutturati = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'Caputo Gres Design',
  description: 'Lavandini e lavabi su misura in gres porcellanato, tagliati e uniti a 45° a mano a Ugento.',
  url: `${CONFIG.sito}/`,
  logo: `${CONFIG.sito}/logo.png`,
  image: `${CONFIG.sito}/og.jpg`,
  email: CONFIG.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Ugento', addressRegion: 'LE', postalCode: '73059', addressCountry: 'IT' },
  hasMap: CONFIG.mappa,
  areaServed: [{ '@type': 'City', name: 'Ugento' }, { '@type': 'AdministrativeArea', name: 'Provincia di Lecce' }, { '@type': 'Place', name: 'Salento' }],
  sameAs: [CONFIG.instagram, CONFIG.tiktok],
}

// --- Lavori ---
const html = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const minuscola = (s) => s.charAt(0).toLowerCase() + s.slice(1)
const piccola = (foto) => foto.replace(/\.webp$/, '-720.webp')
const srcset = (foto, sizes) => existsSync(`public/${piccola(foto)}`) ? ` srcset="${html(piccola(foto))} 720w, ${html(foto)} 1080w" sizes="${sizes}"` : ''

const lavori = LAVORI.map((l) => `
            <figure class="lavoro" data-finish="${html(l.materiale)}">
              <div class="cornice">
                <span class="cornice__lastra" aria-hidden="true"><span class="cornice__etichetta">${html(l.finitura)}</span></span>
                <button class="lavoro__media" type="button" aria-label="${html(`Ingrandisci: ${l.titolo}`)}" data-ingrandisci>
                  <img src="${html(l.foto)}"${srcset(l.foto, '(max-width: 760px) 86vw, 520px')} alt="${html(`${l.titolo}: ${minuscola(l.descrizione)}, ${minuscola(l.finitura)}`)}" width="1080" height="1350" loading="lazy" decoding="async" fetchpriority="low">
                  <span class="lavoro__velo" aria-hidden="true"></span>
                </button>
              </div>
              <figcaption>
                <strong>${html(l.titolo)}</strong>
                <span>${html(l.descrizione)}.</span>
              </figcaption>
            </figure>`).join('')

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${CONFIG.sito}/sitemap.xml\n`

const sitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${CONFIG.sito}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>
</urlset>
`

const seo = () => ({
  name: 'seo',
  transformIndexHtml: (pagina) =>
    pagina
      .replaceAll('%SITO%', CONFIG.sito)
      .replaceAll('%EMAIL%', CONFIG.email)
      .replaceAll('%MAPPA%', html(CONFIG.mappa))
      .replaceAll('%INSTAGRAM%', CONFIG.instagram)
      .replaceAll('%TIKTOK%', CONFIG.tiktok)
      .replace('<div class="lavori__track" data-lavori></div>', `<div class="lavori__track" data-lavori>${lavori}
          </div>`)
      .replace('</head>', `  <script type="application/ld+json">${JSON.stringify(datiStrutturati)}</script>\n</head>`),
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() })
  },
})

// --- Font ---
const precarica = () => ({
  name: 'precarica-font',
  transformIndexHtml: {
    order: 'post',
    handler: (pagina, { bundle }) => {
      const font = bundle && Object.keys(bundle).find((f) => /archivo-latin-standard-normal-.*\.woff2$/.test(f))
      return font ? pagina.replace('<link rel="stylesheet"', `<link rel="preload" href="/${font}" as="font" type="font/woff2" crossorigin>\n  <link rel="stylesheet"`) : pagina
    },
  },
})

// --- Header di Cloudflare ---
const impronta = (codice) => `'sha256-${createHash('sha256').update(codice).digest('base64')}'`
const politica = (script) =>
  [
    "default-src 'self'",
    `script-src 'self' ${script.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')

const intestazioni = () => ({
  name: 'intestazioni',
  apply: 'build',
  writeBundle({ dir }) {
    const pagina = readFileSync(join(dir, 'index.html'), 'utf8')
    const script = [...pagina.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, codice]) => impronta(codice))
    writeFileSync(
      join(dir, '_headers'),
      `/*
  Content-Security-Policy: ${politica(script)}
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/textures/*
  Cache-Control: public, max-age=604800

/lavori/*
  Cache-Control: public, max-age=604800
`,
    )
  },
})

// --- Config ---
export default defineConfig({
  plugins: [seo(), precarica(), intestazioni()],
})
