<![CDATA[# SHREWD. — Cybersecurity Research Blog

> **Security, Tested.**

A production-ready cybersecurity research blog built with [Astro 7](https://astro.build), [Decap CMS](https://decapcms.org), and deployed to [Cloudflare Pages](https://pages.cloudflare.com). Every post follows the SHREWD. methodology:

**Question → Research → Lab → Evidence → Fix → Retest → Result**

No theory without proof. No advice without lab logs.

---

## Tech Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| Framework | [Astro](https://astro.build) `^7.3.5` | Static site generator with content collections |
| CMS | [Decap CMS](https://decapcms.org) `^3.0.0` | Browser-based editor at `/admin` |
| Auth | Custom Cloudflare Worker | GitHub OAuth proxy at `shrewd-auth.shr3wd.workers.dev` |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com) | Automatic deployments on push to `main` |
| CI/CD | GitHub Actions | Build + deploy via `cloudflare/pages-action@v1` |
| Styling | Pure CSS | Hand-written design system — no framework |
| Language | TypeScript + Astro | Strict TypeScript config with path aliases |
| Typography | Google Fonts | [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| Syntax Highlighting | [Shiki](https://shiki.style) | `one-dark-pro` theme via Astro's built-in support |
| Content | Markdown | Zod-validated frontmatter with `glob()` loader |
| Node.js | `>=22.12.0` | Required runtime version |

---

## Architecture

```
                    ┌──────────────────────────────────────────────────┐
                    │               Content Pipeline                   │
                    │                                                   │
  Author writes     │  src/content/blog/*.md                           │
  via /admin or  ──►│        │                                         │
  local editor      │        ▼                                         │
                    │  content.config.ts (Zod schema validation)       │
                    │        │                                         │
                    │        ▼                                         │
                    │  Pages ──► Layouts ──► Components ──► global.css │
                    │        │                                         │
                    │        ▼                                         │
                    │  dist/ (static HTML/CSS/JS)                      │
                    └──────────┬───────────────────────────────────────┘
                               │
                               ▼
                    GitHub Actions ──► Cloudflare Pages
```

**CMS Flow:**
```
/admin (Decap CMS) ──► GitHub OAuth (Cloudflare Worker) ──► GitHub API
       │                                                        │
       └── Creates PR (editorial workflow) ──── Merge ──► Auto-deploy
```

---

## Project Structure

```
shrewd/
├── public/
│   ├── admin/
│   │   ├── index.html              # Decap CMS admin panel
│   │   └── config.yml              # CMS collection & field configuration
│   ├── favicon.ico
│   ├── favicon.svg
│   └── robots.txt                  # Blocks /admin from indexing
├── src/
│   ├── components/
│   │   ├── Header.astro            # Sticky nav, theme toggle, mobile hamburger menu
│   │   ├── Footer.astro            # 4-column grid: brand, categories, links, methodology
│   │   ├── BlogCard.astro          # Post card with image/placeholder, badges, author avatar
│   │   ├── HeroSection.astro       # Split hero: content left + Nmap terminal mockup right
│   │   ├── MethodologyBar.astro    # Horizontal step strip (Question → ... → Result)
│   │   ├── FocusAreas.astro        # 6 category cards with emoji icons + hover animations
│   │   └── LatestPosts.astro       # Latest 3 non-draft posts grid
│   ├── content/
│   │   └── blog/                   # Markdown posts go here
│   │       ├── sample-post-1.md    # "Does Windows Defender Block Mimikatz?"
│   │       └── sample-post-2.md    # Second sample post
│   ├── content.config.ts           # Zod content collection schema (glob loader)
│   ├── layouts/
│   │   ├── BaseLayout.astro        # HTML shell, SEO meta (OG + Twitter), theme init
│   │   └── BlogPostLayout.astro    # Post page: progress bar, share buttons, author bio
│   ├── pages/
│   │   ├── index.astro             # Homepage: hero, methodology, focus areas, latest posts, CTA
│   │   ├── about.astro             # About SHREWD. page
│   │   ├── blog/
│   │   │   ├── index.astro         # Blog listing with client-side category filtering
│   │   │   └── [...slug].astro     # Dynamic post routes via getStaticPaths()
│   │   ├── write-for-us.astro      # Contributor application & guidelines
│   │   ├── contact.astro           # Contact page
│   │   └── 404.astro               # Custom 404 error page
│   └── styles/
│       └── global.css              # Complete design system (1,669 lines)
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: build + deploy to Cloudflare Pages
├── astro.config.mjs                # Site URL, static output, Shiki config
├── tsconfig.json                   # Strict TS with @components, @layouts, @styles aliases
├── package.json
└── README.md
```

---

## Local Development

### Prerequisites

- **Node.js** `>=22.12.0`
- **npm** (included with Node.js)

### Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Site is available at http://localhost:4321
```

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Astro dev server with hot-reload |
| `npm run build` | Build the production site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run Astro CLI commands directly |

---

## Content Schema

Posts are Markdown files in `src/content/blog/` validated by a [Zod schema](src/content.config.ts). Add a new `.md` file with this frontmatter:

```yaml
---
title: "Your Title Here"                    # Required — post title
description: "What you tested and found."   # Required — used in cards, meta, OG
pubDate: 2026-09-01                         # Required — publish date
author: "Your Name"                         # Required — displayed on card & post
authorBio: "One sentence about you."        # Optional — shown in author bio card
authorGitHub: "yourusername"                # Optional — links to GitHub profile
category: "Windows Security"                # Required — see valid options below
tags: ["tag1", "tag2"]                      # Optional — displayed on post page
image: "/images/blog/your-cover.jpg"        # Optional — cover image path
difficulty: "Intermediate"                  # Optional — Beginner | Intermediate | Advanced
featured: false                             # Optional — mark as featured (default: false)
draft: false                                # Optional — hide from listings (default: false)
---

Your markdown content here...
```

### Valid Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| `Windows Security` | 🪟 | Hardening, misconfigs, security baselines |
| `Vulnerability Management` | 🔍 | Scan, prioritize, patch, verify lifecycle |
| `Windows Server` | 🖥️ | AD, GPO, RDP, server hardening |
| `Nessus & Tenable` | 📊 | Scan outputs, false positives, plugin breakdowns |
| `Hardening & Compliance` | 🛡️ | CIS Benchmarks, DISA STIGs |
| `Lab Experiments` | 🔬 | Controlled tests with documented methodology |

### Difficulty Levels

| Level | Badge Color | Intended Audience |
|-------|-------------|-------------------|
| `Beginner` | Green | New to cybersecurity or the specific topic |
| `Intermediate` | Yellow | Familiar with fundamentals, has lab experience |
| `Advanced` | Red | Deep expertise, complex multi-step procedures |

---

## Content Guidelines

All posts **must** follow the SHREWD. methodology:

| Step | What It Means | Requirement |
|------|--------------|-------------|
| **Question** | Define the problem | One specific, testable question |
| **Research** | Background context | Documented prior research and references |
| **Lab** | Build the environment | Isolated lab setup with documented configuration |
| **Evidence** | Capture proof | Terminal output, screenshots, event logs |
| **Fix** | Apply remediation | Step-by-step fix if a problem was found |
| **Retest** | Verify the fix | Re-run the same test to confirm resolution |
| **Result** | Conclude | Clear verdict with a specific, actionable recommendation |

### What's Not Accepted

- ❌ Articles without lab evidence
- ❌ News commentary without original research
- ❌ Theoretical advice without proof
- ❌ Vendor marketing disguised as research

---

## Deployment

### How It Works

1. Code is pushed to `main` (or a PR is opened)
2. GitHub Actions runs the workflow in `.github/workflows/deploy.yml`
3. Astro builds the static site to `dist/`
4. `cloudflare/pages-action@v1` deploys to Cloudflare Pages
5. Site is live at the configured Cloudflare Pages domain

### Required GitHub Secrets

In your GitHub repo → **Settings → Secrets and variables → Actions**:

| Secret | Where to Get It |
|--------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → "Edit Cloudflare Pages" template |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → any domain → right sidebar → Account ID |

### Cloudflare Pages Configuration

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `22` (to match `package.json` engine requirement) |

---

## CMS Setup (Decap CMS)

### How It Works

The admin panel at `/admin` uses [Decap CMS](https://decapcms.org) with an **editorial workflow** — authors create posts that become GitHub PRs for review before publishing.

Authentication is handled by a **custom Cloudflare Worker** acting as a GitHub OAuth proxy.

### Step 1: Create a GitHub OAuth App

1. Go to GitHub → **Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** `SHREWD CMS`
   - **Homepage URL:** Your Cloudflare Pages URL
   - **Authorization callback URL:** `https://YOUR-AUTH-WORKER.workers.dev/callback`
3. Click **Register application**
4. Copy the **Client ID** and generate a **Client Secret**

### Step 2: Deploy the Auth Worker

Deploy a Cloudflare Worker with your GitHub OAuth credentials:

```
GITHUB_CLIENT_ID     = your-oauth-app-client-id
GITHUB_CLIENT_SECRET = your-oauth-app-client-secret
```

### Step 3: Update CMS Config

Edit `public/admin/config.yml` to point to your auth worker and repository:

```yaml
backend:
  name: github
  repo: YOUR_USERNAME/YOUR_REPO
  branch: main
  base_url: https://YOUR-AUTH-WORKER.workers.dev
  auth_endpoint: /auth
```

---

## Multi-Author Workflow

Contributors can write and submit posts without direct push access:

| Step | Who | Action |
|------|-----|--------|
| 1 | Admin | Add contributor as a **Collaborator** in GitHub repo settings |
| 2 | Contributor | Log in at `/admin` with their GitHub account |
| 3 | Contributor | Write post → click **Submit for Review** (creates a draft PR) |
| 4 | Admin | Review the PR in GitHub, leave comments, request changes |
| 5 | Admin | Approve & merge the PR |
| 6 | CI/CD | Cloudflare Pages auto-rebuilds → post goes live in ~60 seconds |

---

## Design System

The entire visual design lives in a single file: `src/styles/global.css` (1,669 lines).

### Brand Identity

| Element | Value |
|---------|-------|
| Name | `shrewd.` (lowercase with period) |
| Tagline | *Security, Tested.* |
| Primary Color | `#00d2ff` (cyan) |
| Secondary Color | `#0070f3` (blue) |
| Dark Background | `#0b1120` (dark navy) |
| Light Background | `#ffffff` |
| Body Text (dark) | `#e2e8f0` |
| Sans-serif Font | Inter |
| Monospace Font | JetBrains Mono |

### Theme System

- **Default:** Dark mode (`data-theme="dark"`)
- **Toggle:** Sun/moon button in the header
- **Persistence:** Saved in `localStorage` under the key `shrewd-theme`
- **Flash prevention:** Theme is set via inline `<script>` in `<head>` before paint
- **System preference:** Falls back to `prefers-color-scheme` when no saved preference exists

### CSS Architecture

| Section | Purpose |
|---------|---------|
| Custom Properties | Full token system: spacing, radii, transitions, shadows, glow effects |
| Light / Dark Themes | All colors defined as CSS custom properties per theme |
| Reset & Base | Normalize + global element styles |
| Layout | Container, grid utilities (`grid-3`), sections |
| Components | Header, footer, cards, badges, buttons, terminal mockup |
| Typography | Prose styles for rendered Markdown content |
| Responsive | Mobile-first breakpoints for all components |

### TypeScript Path Aliases

Configured in `tsconfig.json` for cleaner imports:

```typescript
import Component from '@components/Component.astro';
import Layout from '@layouts/Layout.astro';
import styles from '@styles/global.css';
import schema from '@content/config';
```

---

## SEO & Accessibility

### SEO Features

- ✅ Unique `<title>` per page with site name suffix
- ✅ Meta description on every page
- ✅ Open Graph tags (title, description, image, site_name)
- ✅ Twitter Card meta tags (`summary_large_image`)
- ✅ Canonical URLs
- ✅ Semantic HTML5 elements throughout
- ✅ Single `<h1>` per page with proper heading hierarchy
- ✅ `robots.txt` blocking `/admin` from indexing

### Accessibility Features

- ✅ ARIA roles on header (`banner`), nav (`navigation`), footer (`contentinfo`)
- ✅ `aria-current="page"` on active nav links
- ✅ `aria-label` on interactive elements and landmark regions
- ✅ `aria-expanded` on mobile menu toggle
- ✅ `aria-live="polite"` on dynamically filtered content
- ✅ Keyboard-accessible theme toggle and navigation
- ✅ Descriptive alt text on all images
- ✅ Proper `<time>` elements with `datetime` attributes

---

## Pages Overview

| Route | Page | Key Features |
|-------|------|-------------|
| `/` | Homepage | Hero with terminal mockup, methodology bar, 6 focus area cards, latest 3 posts, CTA |
| `/blog` | Research Listing | All published posts, client-side category filter buttons, post count |
| `/blog/:slug` | Post Page | Reading progress bar, category/difficulty badges, author bio, share & copy-link buttons |
| `/about` | About | SHREWD. mission and team information |
| `/write-for-us` | Contribute | Submission guidelines, methodology requirements, application process |
| `/contact` | Contact | Contact information and form |
| `/admin` | CMS | Decap CMS editor (not an Astro page — served from `public/`) |
| `404` | Not Found | Custom error page |

---

## Known Considerations

| Item | Details |
|------|---------|
| **No RSS feed** | Consider adding `@astrojs/rss` for content syndication |
| **No sitemap** | Consider adding `@astrojs/sitemap` (referenced in `robots.txt` but not yet generated) |
| **Pagination** | Blog listing currently loads all posts on one page; pagination is not yet implemented |
| **Client-side filtering** | Category filtering on `/blog` is JavaScript-based; URL state is not preserved on navigation |

---

## License

Content is © SHREWD. All rights reserved.
Code structure is MIT licensed.

---

**SHREWD. — Security, Tested.**
]]>
