export function slugify(input: string) {
  const decomposed = input.normalize("NFD");
  let stripped = "";
  for (const ch of decomposed) {
    const code = ch.codePointAt(0)!;
    // Skip Unicode combining diacritical marks (U+0300-U+036F) produced by NFD normalization.
    if (code >= 0x0300 && code <= 0x036f) continue;
    stripped += ch;
  }

  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}
