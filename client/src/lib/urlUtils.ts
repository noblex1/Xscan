/**
 * Extract a single analyzable URL from pasted text (full string or first http(s) match).
 */
export function extractUrlFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    const match = trimmed.match(/https?:\/\/[^\s<>"']+/i);
    if (!match) return null;
    let candidate = match[0].replace(/[),.;]+$/, "");
    try {
      new URL(candidate);
      return candidate;
    } catch {
      return null;
    }
  }
}
