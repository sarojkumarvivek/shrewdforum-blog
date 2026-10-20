/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly SITE_URL?: string;
  readonly PUBLIC_WEB3FORMS_ACCESS_KEY?: string;
  readonly WEB3FORMS_ACCESS_KEY?: string;
  readonly PUBLIC_CLOUDFLARE_BEACON_TOKEN?: string;
  readonly CLOUDFLARE_BEACON_TOKEN?: string;
  readonly PUBLIC_CMS_BACKEND_URL?: string;
  readonly PUBLIC_GITHUB_REPO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
