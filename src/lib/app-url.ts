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

export const getOAuthBrokerUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".github.io")) {
    return "https://doc-to-cv-ai.lovable.app/~oauth/initiate";
  }

  return "/~oauth/initiate";
};

/**
 * GitHub Pages return URL — used to bounce the user back from the Lovable
 * domain (where OAuth completes) to the original GitHub Pages site.
 */
const GH_RETURN_PARAM = "gh_return";

export const getOAuthRedirectUrl = (path = "") => {
  const cleanPath = path.replace(/^\/+/, "");

  if (typeof window !== "undefined" && window.location.hostname.endsWith(".github.io")) {
    // Send OAuth back to the Lovable domain (allowlisted), but tell that
    // domain where to forward the user (and their session) afterwards.
    const ghReturn = new URL(
      `${import.meta.env.BASE_URL || "/"}${cleanPath}`,
      window.location.origin,
    ).toString();

    const url = new URL(cleanPath, "https://doc-to-cv-ai.lovable.app/");
    url.searchParams.set(GH_RETURN_PARAM, ghReturn);
    return url.toString();
  }

  return getAppRedirectUrl(path);
};

export const getGitHubReturnUrl = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(GH_RETURN_PARAM);
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!parsed.hostname.endsWith(".github.io")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
};
