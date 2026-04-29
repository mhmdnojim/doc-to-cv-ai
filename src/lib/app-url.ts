/**
 * Build an absolute URL for OAuth / email redirects.
 *
 * The Vite `BASE_URL` is set to `/<repo>/` only when the site is built for
 * GitHub Pages (see vite.config.ts). On Lovable hosting (`*.lovable.app`)
 * and custom domains the app is served from `/`, so we must NOT prepend the
 * repo path there — otherwise users get sent to `/doc-to-cv-ai/...` which
 * doesn't exist and shows the GitHub Pages 404 page.
 */
export const getAppRedirectUrl = (path = "") => {
  const cleanPath = path.replace(/^\/+/, "");
  const isGitHubPages =
    typeof window !== "undefined" && window.location.hostname.endsWith(".github.io");
  const basePath = isGitHubPages ? import.meta.env.BASE_URL || "/" : "/";

  return new URL(`${basePath}${cleanPath}`, window.location.origin).toString();
};
