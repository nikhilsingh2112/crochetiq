# CrochetIQ — Build Plan

An AI assistant that turns a finished crochet project into social-ready content. Guests can use the full flow; accounts unlock saving and a dashboard.

## Look and feel

Warm, handmade, playful-but-professional. Pastel palette: cream base, lavender, sage green, dusty pink, warm yellow. Soft rounded cards, gentle shadows, yarn/stitch-inspired iconography and illustration accents. No generic SaaS blue.

## Pages

- **Landing (`/`)** — hero with logo, tagline "Your AI assistant for crochet creators.", short description, two CTAs ("Upload Your Crochet", "Try without Signing In"). Visual workflow strip: Upload → AI Analysis → Enhanced Photo → Content → Inspiration. Three feature cards.
- **Upload (`/upload`)** — large drag-and-drop zone (JPG/PNG), goal picker (Prepare for Social Media / Sell My Product / Get New Ideas), optional notes, "Prepare for Sharing".
- **Processing (`/processing`)** — animated staged progress with friendly messages ("Understanding your crochet", "Enhancing your photo", "Creating your content", "Thinking of fresh ideas"), not a spinner.
- **Results (`/results`)** — the core screen:
  - Enhanced image with original/enhanced compare toggle + download.
  - AI Analysis card: detected item (editable, triggers regeneration), category, difficulty, primary colors, suggested use.
  - Tabs: Captions (Friendly / Professional / Playful, each with its own Copy), Product Description (Copy), Hashtags (Copy).
  - Pricing card: estimated range, materials considered, difficulty, time investment, plus an "estimate only" note.
  - Inspiration: five idea cards with "Explore".
  - Save Project: saves for signed-in users; guests get a friendly "create a free account" modal.
- **Auth (`/auth`)** — email/password + Google sign-in.
- **Dashboard (`/dashboard`, protected)** — recent projects, saved inspirations, stats (Projects Created, Captions Generated, Ideas Saved), "New Project" button.
- **Profile (`/profile`, protected)** — account info, theme preference, "Preferred AI Provider (Coming Soon)" placeholder.

## Guest vs account

Guests get upload → generate → view → download → copy, with results held in session state. Save is the only gated action.

## Backend (Lovable Cloud)

Tables with proper foreign keys and row-level security: `profiles` (id, name, email, avatar, created_at), `projects` (user_id, original/enhanced image urls, goal, notes), `ai_analysis` (project_id, detected_item, category, colors, difficulty, suggested_use), `ai_content` (project_id, three captions, product_description, hashtags, pricing_min/max), `ideas` (project_id, title). Auto-create profile on signup. Storage bucket for uploaded and enhanced images.

## AI architecture

Three independent services behind stable interfaces, so providers can be swapped later:

- `analyzeCrochetImage()` — Vision service; returns structured crochet item data.
- `enhanceCrochetImage()` — image enhancement; fully separate from the text pipeline.
- `generateCrochetContent()` — consumes the vision output and returns captions, description, hashtags, pricing, and five ideas.

These run server-side (never in the browser), each behind a provider adapter so adding a new provider is a new adapter, not a rewrite. Responses are real model output, never hardcoded. Vision and content run through Lovable AI; enhancement uses an image model through the same gateway.

## Prepared for later, not built now

Provider registry (multi-provider, user-supplied keys), plus clear seams for AI Playground, community feed, promo videos, social publishing, seasonal trends, and analytics.

## Technical notes

TanStack Start + React + TypeScript + Tailwind, Lovable Cloud (Supabase) for auth/data/storage, server functions for all AI calls. Design tokens defined once in `src/styles.css`; components use semantic tokens only. Protected routes live under the authenticated layout; every page gets its own SEO metadata.
