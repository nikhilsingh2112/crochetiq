# Crochet Creator Studio

You are an expert product designer, UX designer, and full-stack software engineer.

Build a modern, responsive web application called **CrochetIQ**.

CrochetIQ is an AI-powered assistant that helps crochet creators transform a finished crochet project into beautiful, social-media-ready content.

The target audience includes crochet hobbyists, handmade product sellers, and small crochet businesses.

The application should feel warm, creative, welcoming, and handmade. Avoid a generic SaaS appearance. Use soft rounded cards, subtle shadows, crochet-inspired illustrations or icons, and a pastel color palette with cream, lavender, sage green, dusty pink, and warm yellow. The UI should feel playful but professional.

Use React, TypeScript, Tailwind CSS, Supabase, and Supabase Authentication.

Design the project with clean architecture so future AI providers can easily be added.

Guests should be able to use the application without creating an account.

Guest users should be able to:

- Upload an image

- Generate AI content

- View AI results

- Download the enhanced image

- Copy generated captions

Guest users should not be able to save projects or view a dashboard. If they attempt to save a project, show a friendly modal inviting them to create a free account.

Create the following pages.

Landing Page:

Include a hero section with the CrochetIQ logo, the tagline "Your AI assistant for crochet creators.", a short description explaining that CrochetIQ helps creators prepare their crochet projects for sharing online, and two call-to-action buttons: "Upload Your Crochet" and "Try without Signing In". Show a simple visual workflow demonstrating Upload → AI Analysis → Enhanced Photo → Content → Inspiration. Include three feature cards explaining that CrochetIQ understands crochet projects, creates social-ready content, and inspires future creations.

Upload Page:

Provide a large drag-and-drop image upload component supporting JPG and PNG images. Ask the user what they would like help with using three options: Prepare for Social Media, Sell My Product, or Get New Ideas. Include an optional notes field and a primary button labeled "Prepare for Sharing".

Processing Page:

Display an animated progress experience instead of a simple loading spinner. Show friendly progress messages such as "Understanding your crochet", "Enhancing your photo", "Creating your content", and "Thinking of fresh ideas".

Results Page:

This is the core experience of the application.

Display the enhanced image with options to compare the original and enhanced versions and download the enhanced image.

Display an AI Analysis card showing:

- Detected Item

- Category

- Difficulty

- Primary Colors

- Suggested Use

Allow the detected item to be edited for future regeneration.

Display generated content using tabs.

The Caption tab should provide three versions:

- Friendly

- Professional

- Playful

Each version should have its own Copy button.

Provide a Product Description tab with a Copy button.

Provide a Hashtags tab with a Copy button.

Display a Pricing Suggestion card showing:

- Estimated Price Range

- Materials Considered

- Difficulty

- Estimated Time Investment

Include a note explaining that pricing is an estimate only.

Display an Inspiration section showing five related crochet project ideas using attractive cards with an "Explore" button on each card.

Provide a Save Project button. Logged-in users should save successfully. Guest users should be prompted to create an account.

Dashboard:

Authenticated users should have access to a dashboard displaying recent projects, saved inspirations, quick statistics such as Projects Created, Captions Generated, and Ideas Saved, and a button to start a new project.

Profile and Settings:

Create a simple profile page with basic account information, theme preference, and a placeholder section labeled "Preferred AI Provider (Coming Soon)". This prepares the application for future support of multiple AI providers.

Create a Supabase database schema with the following tables.

Users:

- id

- name

- email

- avatar

- created_at

Projects:

- id

- user_id

- original_image_url

- enhanced_image_url

- goal

- notes

- created_at

AI_Analysis:

- id

- project_id

- detected_item

- category

- colors

- difficulty

- suggested_use

AI_Content:

- id

- project_id

- friendly_caption

- professional_caption

- playful_caption

- product_description

- hashtags

- pricing_min

- pricing_max

Ideas:

- id

- project_id

- title

Design proper relationships between all tables.

Design the AI architecture as three independent services.

Vision Service:

Responsible only for understanding the uploaded crochet image. Return structured information describing the crochet item.

Image Enhancement Service:

Responsible for improving the uploaded photo by enhancing lighting, improving color quality, reducing distractions, creating a cleaner presentation, and preparing the image for sharing on social media. This service should remain independent from the language generation pipeline.

Content Generation Service:

Consumes the structured Vision output and generates:

- Instagram captions

- Product descriptions

- Hashtags

- Estimated pricing suggestions

- Five related crochet ideas

Implement placeholder service functions named:

- analyzeCrochetImage()

- enhanceCrochetImage()

- generateCrochetContent()

Do not hardcode AI responses. Build the project so real AI APIs can easily be connected later.

Prepare the project architecture for future capabilities without implementing them. Future capabilities include:

- Multiple AI providers

- User-supplied API keys

- AI Playground

- Community feed

- AI-generated promotional videos

- Social media publishing

- Seasonal crochet trend recommendations

- Analytics dashboard

Prioritize simplicity. The primary user journey should be:

Landing Page → Upload Photo → AI Processing → Results → Save Project → Dashboard (if authenticated)

The application should feel polished enough to be a real startup MVP and something that crochet creators would genuinely enjoy using.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://crochetiq.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c8efe745-70e4-4fb0-85cd-803f28e73b31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
