// Keys for outside services used by the site. Both are PUBLIC values (they are meant to sit in the page, like the
// Google Analytics id): never put a SECRET key here. Empty = that feature is off. Fill in, commit, and the deploy adds it.

// Cloudflare Turnstile (bot check on the booking form). Cloudflare dashboard > Turnstile > Add widget:
// hostnames www.niletherapy.org, niletherapy.org and odostore11-creator.github.io; mode "Managed". Paste the SITE key here.
// The SECRET key goes ONLY into Supabase > Edge Functions > Secrets as TURNSTILE_SECRET_KEY, and only AFTER this site key
// is live (otherwise the booking function would demand a check the form can't show yet).
export const TURNSTILE_SITEKEY = '';

// Cloudflare Web Analytics (visitors, pages, countries; no cookies, so no consent banner). Cloudflare dashboard >
// Analytics & Logs > Web Analytics > Add a site > www.niletherapy.org > "manual JS snippet": paste the token from it here.
export const CF_ANALYTICS_TOKEN = '';
