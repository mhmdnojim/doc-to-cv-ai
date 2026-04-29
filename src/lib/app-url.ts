export const getAppRedirectUrl = (path = "") => {
  const basePath = import.meta.env.BASE_URL || "/";
  const cleanPath = path.replace(/^\/+/, "");

  return new URL(`${basePath}${cleanPath}`, window.location.origin).toString();
};