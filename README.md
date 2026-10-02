# SHREWD. — Cybersecurity Research Blog

> **Security, Tested.**

A production-ready cybersecurity research blog built with Astro, Decap CMS, and deployed to Cloudflare Pages. Every post follows the SHREWD. methodology: Question → Research → Lab → Evidence → Fix → Retest → Result.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) (static site generator) |
| CMS | [Decap CMS](https://decapcms.org) (browser-based editor at `/admin`) |
| Auth | [Sveltia CMS Auth](https://github.com/sveltia/sveltia-cms-auth) (GitHub OAuth proxy) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) (free tier) |
| Styling | Pure CSS (hand-written, no framework) |
| Language | TypeScript + Astro components |
| Content | Markdown files in `src/content/blog/` |

---

## Project Structure

```
shrewd-blog/
├── public/
│   ├── admin/
│   │   ├── index.html          # Decap CMS admin panel
│   │   └── config.yml          # CMS configuration
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Header.astro        # Sticky nav with theme toggle
│   │   ├── Footer.astro        # Footer with category links
│   │   ├── BlogCard.astro      # Card with hover effects
│   │   ├── HeroSection.astro   # Homepage hero + terminal
│   │   ├── MethodologyBar.astro # Question→...→Result strip
│   │   ├── FocusAreas.astro    # 6 category cards
│   │   └── LatestPosts.astro   # Latest 3 posts grid
│   ├── content/
│   │   ├── config.ts           # Zod content schema
│   │   └── blog/               # Markdown posts go here
│   ├── layouts/
│   │   ├── BaseLayout.astro    # HTML shell + SEO meta
│   │   └── BlogPostLayout.astro # Post with progress bar
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── about.astro
│   │   ├── blog/index.astro    # Blog listing + filters
│   │   ├── blog/[...slug].astro # Dynamic post routes
│   │   ├── write-for-us.astro
│   │   ├── contact.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css          # Complete design system
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
# http://localhost:4321
```

### Build for Production

```bash
npm run build

# Preview the production build
npm run preview
```

---

## Writing Content Locally

Add a new `.md` file to `src/content/blog/` with this frontmatter:

```yaml
---
title: "Your Title Here"
description: "A clear description of what you tested."
pubDate: 2026-09-01
author: "Your Name"
authorBio: "One sentence about you."
category: "Windows Security"    # See valid categories below
tags: ["tag1", "tag2"]
difficulty: "Intermediate"      # Beginner | Intermediate | Advanced
featured: false
draft: false                    # Set true to hide from listing
---

Your markdown content here...
```

**Valid categories:**
- `Windows Security`
- `Vulnerability Management`
- `Windows Server`
- `Nessus & Tenable`
- `Hardening & Compliance`
- `Lab Experiments`

---

## Deployment Setup (Step by Step)

### Step 1: Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial SHREWD. blog setup"
gh repo create shrewd-blog --public
git push -u origin main
```

### Step 2: Connect Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Pages → Create a project → Connect to Git**
3. Select your `shrewd-blog` repository
4. Configure build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Click **Save and Deploy**

Your site will be live at `https://shrewd-blog.pages.dev` after the first build.

### Step 3: Set Up Decap CMS

#### 3a. Create GitHub OAuth App

1. GitHub → **Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** `SHREWD CMS`
   - **Homepage URL:** `https://shrewd-blog.pages.dev`
   - **Authorization callback URL:** `https://YOUR-AUTH-APP.pages.dev/callback`
3. Click **Register application**
4. Copy the **Client ID** and generate a **Client Secret**

#### 3b. Deploy Sveltia CMS Auth (Free OAuth Proxy)

1. Fork [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) or click **Deploy to Cloudflare Pages** in their README
2. Set environment variables in your Cloudflare Pages auth project:
   ```
   GITHUB_CLIENT_ID     = your-oauth-app-client-id
   GITHUB_CLIENT_SECRET = your-oauth-app-client-secret
   ```
3. Note your auth app URL (e.g., `https://shrewd-auth.pages.dev`)

#### 3c. Update CMS Config

Edit `public/admin/config.yml`:
```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/shrewd-blog
  branch: main
  base_url: https://shrewd-auth.pages.dev  # Your auth app URL
```

### Step 4: Add GitHub Secrets for Actions

In your GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret Name | Where to Get It |
|-------------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token (use "Edit Cloudflare Pages" template) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → any page → right sidebar |

### Step 5: Write Your First Post

1. Go to `https://shrewd-blog.pages.dev/admin`
2. Click **Login with GitHub**
3. Click **New Blog Post**
4. Fill in all fields following the SHREWD. methodology
5. Click **Publish** → GitHub PR created automatically
6. Go to your GitHub repo → merge the PR
7. Cloudflare Pages rebuilds → post goes live in ~60 seconds

---

## Multi-Author Workflow

Contributors can write and submit posts without direct repo access:

1. You add them as a **Collaborator** in GitHub repo settings
2. They log in at `/admin` with their GitHub account
3. They write their post and click **Submit for Review** (creates a draft PR)
4. You review the PR in GitHub, leave comments, approve
5. Merge the PR → post goes live

---

## Content Guidelines

All posts must follow the SHREWD. methodology:

| Step | Requirement |
|------|-------------|
| **Question** | One specific, testable question |
| **Research** | Background research documented |
| **Lab** | Isolated environment with documented setup |
| **Evidence** | Terminal output, screenshots, event logs |
| **Fix** | Remediation steps if a problem was found |
| **Retest** | Verification after fix |
| **Result** | Clear verdict with specific recommendation |

**Prohibited:**
- Articles without lab evidence
- News commentary without original research
- Theoretical advice without proof

---

## Theme System

The blog defaults to **dark mode**. Users can toggle with the sun/moon button in the header.
Preference is saved in `localStorage` under the key `shrewd-theme`.

**CSS variables** are defined in `src/styles/global.css` under `:root` (light) and `[data-theme="dark"]` (dark).

---

## Brand

| Element | Value |
|---------|-------|
| Name | shrewd. |
| Tagline | Security, Tested. |
| Primary | `#00d2ff` (cyan) |
| Secondary | `#0070f3` (blue) |
| Background | `#0b1120` (dark navy) |
| Text | `#e2e8f0` |
| Font | Inter + JetBrains Mono |

---

## License

Content is copyright SHREWD. All rights reserved.
Code structure is MIT licensed.

---

**SHREWD. — Security, Tested.**
