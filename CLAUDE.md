# Vizion Technologies — marketing site

Static, light-theme marketing site for Vizion Technologies (custom software for SMEs in Harare, Zimbabwe). Plain HTML/CSS/JS — no build step, no package.json. Hosted on Vercel at `https://viziontechnologies.vercel.app`.

## Layout
- `index.html` — homepage (all sections: services, process, pricing, apps, FAQ, insights, contact form)
- `portfolio.html`, `privacy.html`, `404.html`, `apps/tylliq.html`, `blog/5-signs-pos-system.html`
- `css/style.css` — one shared stylesheet for every page
- `js/main.js` — one shared script (GSAP + ScrollTrigger from cdnjs, custom cursor, contact form, cookie notice)
- `js/devices3d.js` — the 3D laptop + phone scenes (Three.js 0.160 as an ES module from jsdelivr, via an import map in each page that uses it). Mounts on `#hero3d` in the homepage hero (apps cycle on the phone, matching laptop screen, notifications, app bubble with WhatsApp link) and on `[data-devices3d]` boxes in `work/*.html` headers (`data-phone="<app keys>"`, `data-laptop="<theme>"`). App and laptop-theme lists are `APPS` and `THEMES` at the top. Phone screens come from `assets/screenshots/<app>/` (real) or `assets/screenshots/prototypes/` (captures of our prototypes, labelled "Prototype"); keep those labels honest. Night mode only with `?night=1`; `?still` renders one settled frame.
- `assets/` — images; `manifest.webmanifest`, `sitemap.xml`, `robots.txt`
- `prototypes/` — clickable wireframes of our work, shown in the "Tap through our apps" section of `portfolio.html`: phone apps (`dellinoo`, `tylliq`, `agrixpert`, `zimsec-ai`, `guesthouse` (a staff app, rebuilt from its real screenshots), `church-app`), desktop apps (`rutz-pos`, `innsuite`), web systems (`vizion-portal`, `case-management`, `shanduko`, `zimtech`).
- `preview/p-74b2a0be4268ed44/` — the Pride Transport website redesign (a copy of that client repo minus its old-site files). **Private, link-only**: shared by sending the URL directly. Never link it from any page, the sitemap or robots.txt, and keep its `noindex` meta tags. The random folder name is the only protection; if the link leaks, rename the folder. Each is a standalone page (`noindex`, not in the sitemap) using the app's own colours and fonts, sharing `proto.css` and `proto.js` (screen router: `data-go`, `data-back`, `data-tab`, `data-toast`). Web and desktop prototypes use `<body class="web">` and the shared sidebar layout, which collapses to icons under 1000px and to a top strip under 720px. Content is sample data, so keep it believable but never present it as real client figures. To add one: a page in `prototypes/`, a `.proto-tab` button (`data-kind` phone|desktop|web, `data-devices` e.g. "desktop tablet phone", optional `data-url` for the window bar) + `.proto-info` panel in `portfolio.html`, a `#try-<id>` link on its project card, and a `data-cat` on the card (mobile, desktop, web, website, ai) for the filter chips.
- Real screenshots: `assets/screenshots/<app>/`, listed in a `<template id="shots-<app>">` in `portfolio.html` and switched on by `data-shots="shots-<app>"` on that app's `.proto-tab` (adds the "Real screenshots" view). Before adding any screenshot, pixelate names, phone numbers, ID numbers, addresses and anything that identifies an anonymous client (faces, logos, venue names); say so in the image's `data-cap`. A notice above every prototype says it's sample data that may be older than the real app, with "Download the real app" (tabs with `data-apk`) and an email link.
- Client names: Dellinoo, Rutz Cosmetics and our own products may be named. The labour case management client, the two church websites and Pride Transport (shown publicly as "Transport booking website", a regional bus company) are kept anonymous: no names, route lists or live links. The guesthouse and church *apps* are our own demos, not client work, so describe them as demos.

## Running locally
`python -m http.server 8765` in the repo root, then open `http://127.0.0.1:8765/`. In headless browsers the homepage hero looks blank because the GSAP intro doesn't run; that is not a bug.

## Conventions
- Sub-pages (`apps/`, `blog/`) use `../` paths; root pages use plain relative paths; `404.html` uses root-absolute paths (`/css/style.css`) because it can be served from any URL.
- Every page repeats the nav and footer markup (no templating). When changing the footer, nav, social icons or head tags, update **all** pages: index, portfolio, privacy, 404, tylliq, blog.
- Images: use WebP, resized (max ~1200px wide), with `width`/`height` attributes and `loading="lazy"` below the fold. Keep `logo.png` as PNG (used in structured data). The share image is `assets/og-image.jpg` (1200×630, the 3D scene with the headline), used as og:image/twitter:image on every page.
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

