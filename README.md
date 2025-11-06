# Dynamic Portfolio (Next.js)

Minimal, fast, and fully data-driven portfolio site.

## Highlights

- **Data-driven content**: Edit a single file `portfolioData.ts` to update personal info, navigation, projects, testimonials, skills, work experience, education, articles, newsletter, and footer.
- **Modern stack**: Next.js App Router + TypeScript.
- **Styling**: Tailwind CSS with CSS variables and `tw-animate-css` utilities.
- **UI primitives**: shadcn/ui components are wired where relevant.
- **Responsive + accessible**: Semantic markup and keyboard-friendly components.
- **Optimized images**: `next/image` for automatic sizing and optimization.
- **Easy theming**: Tweak tokens in `app/globals.css` (light/dark, radii, charts, sidebar, etc.).

## Quickstart

```bash
npm i
npm run dev
# open http://localhost:3000
```

## Customize Content

- Edit `portfolio/portfolioData.ts` to change all content.
- If using external image URLs, add their domains to `next.config.ts` under `images.domains`.
- Update internal anchors via `navigation` in `portfolioData.ts`.

## Build & Deploy

```bash
npm run build
npm start
```

Deploy on any Node-compatible host (Vercel, Netlify, Fly, etc.).

## Notes

- Newsletter form is UI-only; connect your backend/service to handle submissions.
- Internal navigation uses `next/link`. External links use `<a>`.
