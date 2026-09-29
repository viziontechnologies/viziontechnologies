# Vizion Technologies — Website

**Bringing Your Vision into Focus**
Custom software agency based in Harare, Zimbabwe.

Live site: https://viziontechnologies.vercel.app

---

## File Structure

```
vizion.com/
├── index.html                  — Homepage (services, process, pricing, apps, FAQ, insights, contact)
├── portfolio.html              — Portfolio / work page
├── privacy.html                — Privacy policy
├── 404.html                    — Not-found page (uses root-absolute paths)
├── apps/
│   └── tylliq.html             — Tylliq app page
├── blog/
│   └── 5-signs-pos-system.html — Article: 5 signs you need a POS system
├── css/
│   └── style.css               — Shared stylesheet for every page
├── js/
│   └── main.js                 — Shared script (GSAP, cursor, contact form, cookie notice)
├── assets/                     — WebP images, logo.png, favicon.svg, app icons
├── manifest.webmanifest
├── sitemap.xml
├── robots.txt
└── README.md
```

---

## Running Locally

No build step and no npm. Serve the folder with any static server:

```bash
python -m http.server 8765
```

Then open http://127.0.0.1:8765/.

---

## Deploy

Hosted on Vercel as a static site.

The domain `viziontechnologies.vercel.app` is hardcoded in canonical URLs, og tags, JSON-LD, `sitemap.xml` and `robots.txt`. If the domain changes, replace it everywhere.

---

## Contact Form

The form in `index.html` posts to Formspree (`https://formspree.io/f/xojbkzjw`) via `fetch()` in `js/main.js`. If the request fails, it shows a WhatsApp/email fallback instead.

---

## Adding a Page

Every page repeats the nav and footer markup (no templating), so changes to the nav, footer, social icons or head tags must be made on **all** pages.

New pages need:
- a canonical URL
- og/twitter tags
- an `apple-touch-icon` link
- an entry in `sitemap.xml`

Pages in `apps/` and `blog/` use `../` paths.

---

## Contact Details

| Field | Value |
|-------|-------|
| WhatsApp | +263 77 868 6550 |
| Email | viziontechnologies.zw@gmail.com |
| WhatsApp link | `https://wa.me/263778686550` |
| Location | Harare, Zimbabwe |

---

## Features

| Feature | Implementation |
|---------|---------------|
| Scroll progress bar | CSS + JS scroll listener |
| Custom cursor | Dot + follower ring (`#cur`, `#curf`) |
| GSAP scroll animations | `ScrollTrigger` + `.reveal` class |
| Marquee ticker | CSS animation + JS-populated track |
| Nav active state | `IntersectionObserver` on `section[id]` |
| Contact form | Formspree POST + `fetch()`, with WhatsApp/email fallback |
| WhatsApp float button | Fixed position + CSS pulse animation |
| Cookie notice | `localStorage` flag (`vzn_cookie_ok`) — no analytics on the site |
| Mobile hamburger menu | CSS transform slide-in |
| Accessibility | `aria-label`, `role`, `for`/`id` pairs, `:focus-visible` |
| SEO | Meta description, OG/Twitter tags, canonical, JSON-LD, sitemap |

---

## Brand Reference

Light theme. Colours are CSS variables at the top of `css/style.css`.

```
Background:    #ffffff
Text:          #0f172a
Accent blue:   #2563eb
Accent blue 2: #3b82f6
Violet:        #7c3aed
Green:         #059669
Dark sections: #0f172a

Headings/body: Sora (Google Fonts)
Labels/code:   DM Mono (Google Fonts)
```

---

## Dependencies (CDN — no install required)

- [GSAP 3.12.2](https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js)
- [GSAP ScrollTrigger 3.12.2](https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js)
- [Google Fonts — Sora + DM Mono](https://fonts.google.com)
