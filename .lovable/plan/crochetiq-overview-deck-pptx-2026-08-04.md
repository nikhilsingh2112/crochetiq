# CrochetIQ Overview Deck (.pptx)

A 6-slide PowerPoint file explaining what CrochetIQ is and how the user journey works, illustrated with real screenshots from the running app.

## Slides

1. **Title** — CrochetIQ logo mark, tagline "Your AI assistant for crochet creators.", one-line positioning, hero screenshot of the landing page.
2. **What it does / who it's for** — three feature points (understands crochet, writes social-ready content, inspires the next make) with the target audience: hobbyists, handmade sellers, small crochet businesses.
3. **User flow** — visual flow strip: Landing → Upload → AI Processing → Results → Save → Dashboard, with a note on guest vs. account (guests get 2 free runs; saving requires an account).
4. **Upload & processing** — screenshots of the upload page (drag-and-drop, goal picker, notes, currency badge) and the staged processing screen.
5. **Results (the core screen)** — screenshot of the results page plus callouts: enhanced-vs-original photo, AI analysis card, caption tabs (Friendly / Professional / Playful), product description, hashtags, pricing estimate (INR/USD), five inspiration ideas.
6. **Dashboard & architecture** — dashboard screenshot (stats, saved projects, saved ideas) and a short architecture note: three independent AI services (Vision, Image Enhancement, Content Generation) behind provider adapters, Lovable Cloud for auth/data/storage.

## How screenshots are captured

Headless Playwright against the local dev server captures the landing, upload, processing, results and dashboard pages at 1440-wide viewport. The results/dashboard shots need real content, so the flow is driven end-to-end with a sample crochet image before capturing. If a live run can't complete (AI cost/limits), the affected slide uses the pages that do render and the deck notes it.

## Style

Matches the app: cream base, lavender, sage, dusty pink, warm yellow accents; rounded frames on screenshots; serif display headings paired with a clean body font. No stock-blue SaaS look. No invented metrics — only content the app actually produces.

## Technical notes

Built with pptxgenjs at 16:9, images embedded as base64. Output written to `/mnt/documents/crochetiq-overview.pptx`, validated, rendered to images, and every slide visually inspected for overflow/overlap before delivery. No app source files change.
