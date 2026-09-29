# Vizion Technologies — marketing site

Static, light-theme marketing site for Vizion Technologies (custom software for SMEs in Harare, Zimbabwe). Plain HTML/CSS/JS — no build step, no package.json. Hosted on Vercel at `https://viziontechnologies.vercel.app`.

## Layout
- `index.html` — homepage (all sections: services, process, pricing, apps, FAQ, insights, contact form)
- `portfolio.html`, `privacy.html`, `404.html`, `apps/tylliq.html`, `blog/5-signs-pos-system.html`
- `css/style.css` — one shared stylesheet for every page
- `js/main.js` — one shared script (GSAP + ScrollTrigger from cdnjs, custom cursor, contact form, cookie notice)
- `assets/` — images; `manifest.webmanifest`, `sitemap.xml`, `robots.txt`

## Running locally
`python -m http.server 8765` in the repo root, then open `http://127.0.0.1:8765/`. In headless browsers the homepage hero looks blank because the GSAP intro doesn't run; that is not a bug.

## Conventions
- Sub-pages (`apps/`, `blog/`) use `../` paths; root pages use plain relative paths; `404.html` uses root-absolute paths (`/css/style.css`) because it can be served from any URL.
- Every page repeats the nav and footer markup (no templating). When changing the footer, nav, social icons or head tags, update **all** pages: index, portfolio, privacy, 404, tylliq, blog.
- Images: use WebP, resized (max ~1200px wide), with `width`/`height` attributes and `loading="lazy"` below the fold. Keep `logo.png` as PNG (used for og:image and structured data).
- Footer social icons are inline SVGs, not text.
- New pages need: canonical URL, og/twitter tags, `apple-touch-icon` link, and an entry in `sitemap.xml`.
- The domain `viziontechnologies.vercel.app` is hardcoded in canonicals, og tags, JSON-LD, sitemap and robots (~28 places). If the domain changes, replace it everywhere.

## Contact form and privacy
- The form posts to Formspree (`https://formspree.io/f/xojbkzjw`) via `fetch` in `js/main.js`; on failure it shows a WhatsApp/email fallback (`showFormFallback`).
- There is **no analytics** on the site. The cookie notice and `privacy.html` say so. If analytics is added, update the notice text in `index.html` and `portfolio.html` and rewrite the "Cookies" and "Third-party resources" sections of `privacy.html` first.
- Cookie notice remembers dismissal in localStorage key `vzn_cookie_ok`.

## Content rules
- Don't invent client results, statistics or testimonials. The removed "Coming soon" blog cards (hardware store case study, WhatsApp vs software) should only come back as real articles.
- Contact details: WhatsApp +263 77 868 6550 (`wa.me/263778686550`), email viziontechnologies.zw@gmail.com.
- Founder: Brian Mahove.

## Known leftovers
- No analytics yet (choice of tool pending).

