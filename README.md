# Vizion Technologies — Website

**Bringing Your Vision into Focus**
Custom software agency based in Harare, Zimbabwe.

---

## File Structure

```
vizion_website/
├── index.html          — Main homepage
├── portfolio.html      — Portfolio / work page
├── css/
│   └── style.css       — All styles
├── js/
│   └── main.js         — All JavaScript (GSAP, cursor, form, etc.)
├── assets/
│   ├── logo.png        — Company logo (extracted from original HTML)
│   └── favicon.svg     — SVG favicon
└── README.md
```

---

## Setup

### 1. Connect the Contact Form (Formspree)

The contact form uses [Formspree](https://formspree.io) — free for up to 50 submissions/month.

**Steps:**
1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your form ID (looks like `xbjnjqpv`)
3. Open `index.html` and find this line:
   ```html
   <form ... action="https://formspree.io/f/YOUR_FORM_ID" ...>
   ```
4. Replace `YOUR_FORM_ID` with your actual form ID:
   ```html
   <form ... action="https://formspree.io/f/xbjnjqpv" ...>
   ```
5. In your Formspree dashboard, set the notification email to `hello@vizion.co.zw`

### 2. Update Social Links

In both `index.html` and `portfolio.html`, update the footer social links:

```html
<a href="https://linkedin.com/company/vizion-tech" ...>in</a>
<a href="https://github.com/vizion-tech" ...>gh</a>
```

### 3. Deploy

The site is static HTML/CSS/JS — deploy anywhere:

| Platform | Command / Steps |
|----------|----------------|
| **Vercel** | `npx vercel` in the project folder |
| **Netlify** | Drag the folder into [app.netlify.com](https://app.netlify.com) |
| **GitHub Pages** | Push to a repo → Settings → Pages → Deploy from `main` |
| **cPanel / hosting** | Upload all files via FTP to `public_html/` |

### 4. Custom Domain (vizion.co.zw)

After deploying, point your domain's DNS to the hosting platform:
- **Vercel**: Add domain in project settings → update nameservers or A record
- **Netlify**: Site settings → Domain management → Add custom domain

---

## Contact Details

| Field | Value |
|-------|-------|
| WhatsApp | +263 77 868 6550 |
| Email | hello@vizion.co.zw |
| WhatsApp link | `https://wa.me/263778686550` |
| Location | Harare, Zimbabwe |

---

## Features

| Feature | Implementation |
|---------|---------------|
| Scroll progress bar | CSS + JS `window.scroll` event |
| Custom cursor | Canvas-based dot + ring follower |
| Particle field (hero) | HTML5 Canvas |
| GSAP scroll animations | `ScrollTrigger` + `.reveal` class |
| Marquee ticker | CSS `animation: mq` + JS-populated track |
| Nav active state | `IntersectionObserver` on `section[id]` |
| Contact form | Formspree POST + `fetch()` |
| Form validation | Client-side required field highlighting |
| WhatsApp float button | Fixed position + CSS pulse animation |
| Cookie notice | `localStorage` flag (`vzn_cookie_ok`) |
| Mobile hamburger menu | CSS transform slide-in |
| Accessibility | `aria-label`, `role`, `for`/`id` pairs, `:focus-visible` |
| SEO | Meta description, OG tags, canonical, Twitter card |

---

## Brand Reference

```
Primary blue:  #1A4F8A
Accent blue:   #2E86C1
Dark bg:       #080F18
Dark-2:        #0D1B2A
Dark-3:        #112235
Green accent:  #4ade80
WhatsApp:      #25D366

Headings/body: Outfit (Google Fonts)
Labels/code:   DM Mono (Google Fonts)
```

---

## Dependencies (CDN — no install required)

- [GSAP 3.12.2](https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js)
- [GSAP ScrollTrigger 3.12.2](https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js)
- [Google Fonts — Outfit + DM Mono](https://fonts.google.com)

No build step. No npm. Just open `index.html`.
