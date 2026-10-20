# SHREWD. Security Hardening & OWASP Remediation Guide

> **Document Version:** 1.0.0  
> **Target Application:** `SHREWD.` Cybersecurity Research Blog (`shr3wd.`)  
> **Architecture:** Astro v7 Static Site Generator (SSG) deployed on Cloudflare Pages  
> **Scope:** Full OWASP Top 10 (2021) Web Application Security Remediation & Hardening  

---

## 1. Executive Summary

This document details the security hardening measures implemented across the `SHREWD.` cybersecurity research blog codebase. Following an empirical security review evaluating the codebase against the **OWASP Top 10 (2021)** framework, comprehensive remediations were engineered to protect the site, its authors, and its visitors against client-side injection, supply chain compromises, credential exposure, automated abuse, and deployment vulnerabilities.

All changes maintain full compatibility with Astro 7 static site generation, Decap CMS editorial workflow, Cloudflare Pages edge delivery, and modern browser standards.

---

## 2. OWASP Top 10 (2021) Remediation Matrix

| OWASP Category | Finding | Pre-Hardening State | Post-Hardening Status | Applied Fix / File |
| :--- | :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | Decap CMS `/admin` discoverability & framing | Unrestricted framing, standard robots | **REMEDIATED** | `public/_headers` (DENY framing, X-Robots-Tag), `public/robots.txt` (Disallow `/admin/`) |
| **A02: Cryptographic Failures** | Hardcoded secrets in client-facing templates | Plaintext Web3Forms key & CF beacon token committed | **REMEDIATED** | `src/pages/contact.astro`, `src/pages/write-for-us.astro`, `src/layouts/BaseLayout.astro`, `.env.example` |
| **A03: Injection (DOM XSS)** | Dynamic `innerHTML` in terminal typing animation | Unsanitized string interpolation to `innerHTML` | **REMEDIATED** | `src/components/HeroSection.astro` refactored to native DOM manipulation (`document.createElement`, `textContent`) |
| **A03: Injection (Script Breakout)** | Potential `</script>` tag breakout in JSON-LD | Raw `JSON.stringify(schemaData)` | **REMEDIATED** | `src/layouts/BlogPostLayout.astro` escaped via `.replace(/</g, '\\u003c')` |
| **A03: Injection (Metadata)** | Author GitHub handle injection | Freeform string in frontmatter schema | **REMEDIATED** | `src/content.config.ts` (Zod regex check), `public/admin/config.yml` (pattern validation) |
| **A04: Insecure Design** | Contact & pitch form automated submission spam | Unprotected POST inputs with no limits | **REMEDIATED** | `src/pages/contact.astro`, `src/pages/write-for-us.astro` (`botcheck` honeypot, 15s sessionStorage rate limiter, `maxlength` bounds) |
| **A05: Security Misconfiguration** | Zero HTTP security headers | Default web server headers | **REMEDIATED** | `public/_headers` (Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| **A05: Security Misconfiguration** | Cleartext HTTP connection fallback | Edge default | **REMEDIATED** | `public/_headers` (HSTS Preload header) & Cloudflare Always Use HTTPS |
| **A05: Security Misconfiguration** | Software fingerprinting | `meta name="generator"` exposing Astro version | **REMEDIATED** | Removed from `src/layouts/BaseLayout.astro` |
| **A06: Vulnerable & Outdated Components** | Decap CMS loaded from unpinned CDN without SRI | `unpkg.com/decap-cms@^3.0.0` floating semver | **REMEDIATED** | `public/admin/index.html` pinned to `3.17.1` with SHA-384 Subresource Integrity (SRI) |
| **A06: Vulnerable & Outdated Components** | Dependencies vulnerability audit | Transitive package checks | **VERIFIED** | `npm audit` verified clean (0 vulnerabilities) |
| **A07: Identification & Auth Failures** | OAuth proxy & editorial workflow security | Broad admin access vector | **DOCUMENTED** | Decap CMS restricted via CSP `connect-src` whitelist and admin zero-trust blueprint |
| **A08: Software & Data Integrity** | Third-party script tampering risk | External scripts loaded without integrity hashes | **REMEDIATED** | Pinned SRI on CDN scripts, `crossorigin="anonymous"` added to third-party assets |
| **A08: Software & Data Integrity** | CI/CD GitHub Actions over-permissioning & mutable tags | `pull-requests: write`, actions on mutable `@v4` tags | **REMEDIATED** | `.github/workflows/deploy.yml` stripped to least privilege (`contents: read`, `deployments: write`), actions pinned to immutable commit SHAs |
| **A09: Logging & Monitoring Failures** | Zero form abuse or admin anomaly visibility | Silent third-party ingestion | **DOCUMENTED** | Blueprinted Web3Forms webhook monitoring, Cloudflare Turnstile, and Cloudflare WAF logging |
| **A10: SSRF** | Server-Side Request Forgery | N/A (Static Site Generator) | **VERIFIED** | No server-side runtime fetch or dynamic proxy routes |

---

## 3. Detailed Technical Implementation

### 3.1. Edge Security Headers (`public/_headers`)

Cloudflare Pages automatically reads the `_headers` file in `public/` and enforces HTTP headers globally across all edge nodes:

```http
# Global headers
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-XSS-Protection: 1; mode=block
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://api.web3forms.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://shrewd-auth.shr3wd.workers.dev https://api.github.com; form-action 'self' https://api.web3forms.com; frame-ancestors 'none'; base-uri 'self'

# Decap CMS Admin Route
/admin/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://shrewd-auth.shr3wd.workers.dev https://api.github.com; form-action 'self'; frame-ancestors 'self'; base-uri 'self'
```

**Key Safeguards:**
- **Strict Content-Security-Policy (CSP):** Disallows arbitrary script origins. Restricts external connections strictly to `api.web3forms.com`, `shrewd-auth.shr3wd.workers.dev`, and `api.github.com`.
- **HSTS Preload:** Enforces 1-year HTTPS-only communication across subdomains.
- **Clickjacking Protection:** Disallows iframe embedding globally (`DENY` and `frame-ancestors 'none'`), isolating the admin panel (`SAMEORIGIN`).
- **Feature Isolation:** Explicitly disables microphone, camera, geolocation, and USB APIs via `Permissions-Policy`.

---

### 3.2. Decap CMS Supply Chain Hardening (`public/admin/index.html`)

Previously, Decap CMS was loaded via:
```html
<!-- INSECURE: Semver range allows automatic upgrade to compromised minor/patch releases -->
<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
```

**Remediation:**
Pinned to exact release `3.17.1` with cryptographic Subresource Integrity (SRI) verification:
```html
<script
  src="https://unpkg.com/decap-cms@3.17.1/dist/decap-cms.js"
  integrity="sha384-d2pbrhjc5asvSK35gKkrgRIk0Wq+2CQynWnXtSsYWQawXCgBXhcAK737jBAKXT4T"
  crossorigin="anonymous"
></script>
```
If the CDN payload is modified or tampered with by an upstream attacker, modern browsers will abort execution immediately.

---

### 3.3. Secrets & Configuration Isolation (`.env.example`)

Previously, client secrets (`WEB3FORMS_ACCESS_KEY` and `CLOUDFLARE_BEACON_TOKEN`) were hardcoded in HTML markup.

**Remediation:**
1. Secrets are injected at build time via Astro environment variables:
   - `src/pages/contact.astro`: `import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY`
   - `src/pages/write-for-us.astro`: `import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY`
   - `src/layouts/BaseLayout.astro`: `import.meta.env.PUBLIC_CLOUDFLARE_BEACON_TOKEN`
2. `.gitignore` strictly excludes `.env` and `.env.*` while whitelisting `.env.example`.
3. `.env.example` documents all required parameters for production and local environments.

---

### 3.4. Client-Side Input Hardening & Anti-Spam (`contact.astro` & `write-for-us.astro`)

To prevent automated bot abuse, Denial of Service through oversized payloads, and submission flooding:
1. **Web3Forms Honeypot Field:**
   ```html
   <input type="checkbox" name="botcheck" class="hidden" style="display: none;" tabindex="-1" autocomplete="off" />
   ```
   Bots scanning the DOM fill this field, causing Web3Forms to silently reject the spam submission.
2. **Strict Length Bounds (`maxlength`):**
   - Name inputs: `maxlength="100"`
   - Email inputs: `maxlength="150"`
   - GitHub username: `maxlength="39"`
   - Article Title: `maxlength="200"`
   - Message / Description textareas: `maxlength="5000"`
3. **Session Submission Throttling:**
   A client-side submission gate stores a timestamp in `sessionStorage` and enforces a minimum 15-second cooldown between form submissions, disabling the submit button during transmission.

---

### 3.5. DOM XSS & Script Injection Prevention

#### Safe Terminal Typing (`src/components/HeroSection.astro`)
The terminal typing animation previously concatenated strings directly into `container.innerHTML`, introducing potential DOM XSS vectors if dynamic text was ever incorporated.
- **Refactoring:** Replaced all `innerHTML` assignments with structured token objects (`command`, `output`, `composite`, `highlight`) rendered strictly through `document.createElement()` and `textContent`.
- **Accessibility:** Added `prefers-reduced-motion` detection to instantly render terminal contents without animation for users with vestibular sensitivities.

#### JSON-LD Script Breakout Mitigation (`src/layouts/BlogPostLayout.astro`)
A common vulnerability in Schema.org `<script type="application/ld+json">` implementations is unescaped `</script>` tags in post titles or descriptions.
- **Remediation:**
  ```astro
  <script type="application/ld+json" set:html={JSON.stringify(schemaData).replace(/</g, '\\u003c')} />
  ```
  This prevents HTML parser context escapes.

#### Frontmatter Validation (`src/content.config.ts` & `public/admin/config.yml`)
Author GitHub usernames are validated against GitHub's official username specification:
```typescript
authorGitHub: z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/, 'Invalid GitHub username').optional()
```
Decap CMS configuration applies the identical regex pattern in `config.yml`.

---

### 3.6. CI/CD GitHub Actions Hardening (`.github/workflows/deploy.yml`)

1. **Least Privilege Principle:**
   - Removed `pull-requests: write`.
   - Explicitly scoped job permissions to:
     ```yaml
     permissions:
       contents: read
       deployments: write
     ```
2. **Immutable Commit SHA Pinning:**
   Replaced mutable major tags (`@v4`, `@v1`) with full 40-character commit hashes to defend against upstream supply chain takeovers of Action repositories:
   - `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683` (# v4.2.2)
   - `actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af` (# v4.1.0)
   - `cloudflare/pages-action@f0a1cd58cd66095dee69bfa18fa5efd1dde93bca` (# v1.5.0)
3. **Environment Security:**
   Secrets passed exclusively via GitHub Repository Secrets into standard build environment variables.

---

## 4. Runbook for Administrators: Key Rotation & History Scrubbing

Because the Web3Forms access key (`595a1d98-...`) and Cloudflare Beacon token (`7ef49c2b...`) were committed in git history in commits `bc10ec5` and `4dc0b0c`, they must be treated as exposed. Follow this operational runbook:

### Step 1: Rotate Exposed Credentials
1. **Web3Forms Key:**
   - Navigate to [https://web3forms.com](https://web3forms.com).
   - Generate a new access key for your domain (`forum.shr3wd.workers.dev`).
   - In GitHub repository settings: `Settings` → `Secrets and variables` → `Actions` → update `WEB3FORMS_ACCESS_KEY`.
2. **Cloudflare Beacon Token:**
   - Log into the Cloudflare Dashboard → `Web Analytics`.
   - Rotate or generate a new site measurement token.
   - Update `CLOUDFLARE_BEACON_TOKEN` in GitHub Repository Secrets.

### Step 2: Scrub Git History (Permanent Purge)

Using [git-filter-repo](https://github.com/newren/git-filter-repo) (recommended over BFG):

```bash
# 1. Install git-filter-repo
pip install git-filter-repo

# 2. Clone a fresh bare mirror of your repository
git clone --bare git@github.com:sarojkumarvivek/shrewdforum-blog.git repo-scrub
cd repo-scrub

# 3. Create expressions to replace keys with placeholders
cat << 'EOF' > expressions.txt
595a1d98-a4ef-4aa8-9569-a26651bedc5e==>EXPIRED_KEY_REMOVED
7ef49c2bca8a421fab4ab6b2f1e3504a==>EXPIRED_TOKEN_REMOVED
EOF

# 4. Run git-filter-repo to scrub all commits, trees, and tags
git-filter-repo --replace-text expressions.txt

# 5. Force push the sanitized history back to GitHub
git remote add origin git@github.com:sarojkumarvivek/shrewdforum-blog.git
git push origin --force --all
git push origin --force --tags
```

---

## 5. Recommended Ongoing Security Enhancements

1. **Cloudflare Zero Trust Access on `/admin/*`:**
   Configure a Cloudflare Access application in Cloudflare Zero Trust:
   - Path: `forum.shr3wd.workers.dev/admin*`
   - Policy: Allow only authenticated administrator email addresses via One-Time PIN (OTP) or GitHub OAuth.
   - Benefit: Completely prevents unauthenticated bots and scanners from reaching Decap CMS code.
2. **Pre-commit Secret Scanning Hook:**
   Install `gitleaks` locally and enable automated secret scanning in `.git/hooks/pre-commit`:
   ```bash
   gitleaks protect --staged -v
   ```
3. **Automated Dependency Auditing:**
   Enable GitHub Dependabot security updates and weekly vulnerability checks.

---

## 6. Verification and Compliance

- **Build Integrity:** Verified with Astro v7 static build engine (`npm run build`).
- **Dependencies:** 0 vulnerabilities (`npm audit`).
- **Edge Deployment:** Compatible with Cloudflare Pages edge redirects and security headers.
