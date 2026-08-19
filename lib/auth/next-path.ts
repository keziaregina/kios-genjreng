// `next` comes from the URL, so anything that could point off-site becomes the default.
export function safeNextPath(raw: string | undefined | null): string {
  if (!raw || !raw.startsWith("/")) return "/dashboard";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  return raw;
}
