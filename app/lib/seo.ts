export const siteUrl = "https://pearldentalpatiala.in";

export function absoluteUrl(path = "/") {
  if (!path.startsWith("/")) {
    return `${siteUrl}/${path}`;
  }

  return `${siteUrl}${path}`;
}
