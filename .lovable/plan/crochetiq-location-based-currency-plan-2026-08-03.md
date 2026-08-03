# CrochetIQ — Location-Based Currency Plan

Add automatic location-aware currency so Indian visitors see INR pricing and everyone else sees USD. Keep the provider picker out of scope for now.

## Goals

- Detect the visitor's country/region without requiring an account.
- Pass the detected currency (`INR` for India, `USD` otherwise) into the content-generation pipeline.
- Generate pricing estimates that are realistic for the target market (INR ranges for India, USD ranges elsewhere).
- Display prices with the correct symbol and formatting across the Results page.
- Persist the currency used with each saved project so dashboard cards stay consistent.

## Detection strategy

Use a lightweight client-side check at upload time:

- Primary: `Intl.DateTimeFormat().resolvedOptions().timeZone` mapped to a country, plus `navigator.language` / `navigator.languages` as a hint.
- Fallback: browser timezone offset.
- Final fallback: `USD`.

Store the resolved currency code in the pending-upload session state alongside `goal` and `notes`, and send it to the server functions. This avoids external geo-IP APIs and Worker-runtime constraints.

## Backend changes

1. **Types**
   - Add `currency: "INR" | "USD"` to `CrochetProjectDraft` and `CrochetContent` in `src/lib/ai/types.ts`.

2. **Draft store**
   - Extend the pending-upload shape in `src/lib/draft-store.ts` to include `currency`.

3. **AI content service**
   - Update `src/lib/ai/content.server.ts` to accept a `currency` argument.
   - Update the system prompt to instruct the model:
     - For `INR`: return `pricingMin`/`pricingMax` as whole INR numbers appropriate to the Indian handmade market (e.g. ₹300–₹3,000 for small accessories, higher for garments/blankets).
     - For `USD`: return USD numbers as before.
   - Include the currency in the returned `CrochetContent` object.

4. **Server functions**
   - Update `generateCrochetContent` input schema in `src/lib/ai.functions.ts` to accept `currency`.
   - Update `saveProject` / project schema in `src/lib/projects.functions.ts` to store `currency` with `ai_content`.

## Frontend changes

1. **Upload page**
   - Detect currency on mount and show a subtle badge like "Pricing shown in ₹ for India".
   - Persist the detected currency with the pending upload.

2. **Processing page**
   - Forward `currency` to `generateCrochetContent`.

3. **Results page**
   - Format `pricingMin`–`pricingMax` with the correct symbol using `Intl.NumberFormat`.
   - Show a small note: "Estimates are in {currency} based on your location."
   - Add a manual toggle (e.g. "Show in USD / INR") so users can override if detection is wrong.

4. **Dashboard**
   - Display saved project prices using the stored currency.

## Out of scope

- Multi-provider AI picker (kept for later as requested).
- Real-time exchange-rate conversion; prices are generated once in the detected currency.
- Geo-IP-based detection using an external API.

## Verification

- Type-check and build after schema changes.
- Test the upload → processing → results flow with both `INR` and `USD` currency states.
- Confirm dashboard cards show the correct symbol for saved projects.
