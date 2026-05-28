# NovelNest

NovelNest is a comprehensive web platform designed for serial novel authors and avid readers. It provides a seamless environment for writing, publishing, monetizing, and reading stories.

## 🚀 Features

- **Author Workspace:** A dedicated editor featuring markdown support, focus mode, and real-time previews.
- **AI Author Copilot:** Powered by Google Gemini, the built-in AI assistant helps authors brainstorm plot points, edit drafts, and generate creative inspiration based on the current chapter's context.
- **Reader Experience:** A customizable reading interface with varied font choices, theme selection, and an integrated comment system (CommentBox.io).
- **AI Reader Guide:** A contextual AI companion that helps readers summarize chapters, recall character details, and explore the story deeper without leaving the page.
- **Monetization & Publishing:** Integrated Stripe billing allows authors to upgrade their publisher tiers (Monthly/Yearly) and reach audiences efficiently.
- **Backend & Auth:** Secure user authentication and real-time database management powered by Supabase.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, DaisyUI, React Router, Zustand, React Query
- **Backend/BaaS:** Supabase (Database, Auth, Edge Functions)
- **AI Integration:** Google Gemini API
- **Payments:** Stripe

## 📦 Running Locally

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your API keys (Supabase, Stripe, Gemini, etc.):

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
   ...
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
