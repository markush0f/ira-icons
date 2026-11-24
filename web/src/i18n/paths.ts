export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** English stays unprefixed. Only a configured non-default locale prefix is removed. */
export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) && segment !== defaultLocale ? segment : defaultLocale;
}

export function stripLocale(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segment = path.split("/")[1] ?? "";
  if (!isLocale(segment) || segment === defaultLocale) return path || "/";
  const rest = path.slice(segment.length + 1);
  return rest.startsWith("/") ? rest || "/" : `/${rest}`;
}

/** Build a shareable path for a locale, preserving a query string when present. */
export function localizePath(path: string, locale: Locale): string {
  const queryIndex = path.indexOf("?");
  const barePath = queryIndex === -1 ? path : path.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : path.slice(queryIndex);
  let bare = stripLocale(barePath || "/");
  if (bare.length > 1 && bare.endsWith("/")) bare = bare.slice(0, -1);
  if (!bare.startsWith("/")) bare = `/${bare}`;
  const localized = locale === defaultLocale ? bare : bare === "/" ? `/${locale}` : `/${locale}${bare}`;
  return `${localized}${search}`;
}
