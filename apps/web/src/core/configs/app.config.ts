export const environment = {
    applicationName: 'astra',
    // Same origin: Vite proxies /api in development, the reverse proxy does in production
    apiMain: import.meta.env.VITE_API_URL ?? '',
    siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://astra.example',
    // AGPL-3.0 §13: users interacting over a network must be offered the source
    sourceUrl: import.meta.env.VITE_SOURCE_URL ?? 'https://github.com/Aykhan-iskandarli/astro',
    // Privacy policy details. Empty values are shown as "to be set" on /privacy-policy.
    // Set them at build time once the VPS, domain and contact address exist.
    privacy: {
        controller: 'Aykhan Iskandarli',
        email: import.meta.env.VITE_PRIVACY_EMAIL ?? '',
        hosting: import.meta.env.VITE_HOSTING_LOCATION ?? '',   // e.g. "Hetzner Online GmbH, Germany"
    },
};
