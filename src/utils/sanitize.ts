import DOMPurify from "dompurify";

/**
 * Get or initialize DOMPurify instance in browser or Node/JSDOM environment.
 */
function getPurifier() {
  if (typeof window !== "undefined") {
    if (typeof (DOMPurify as any).sanitize === "function") {
      return DOMPurify as any;
    }
    if (typeof (DOMPurify as any).default?.sanitize === "function") {
      return (DOMPurify as any).default;
    }
    if (typeof DOMPurify === "function") {
      return (DOMPurify as any)(window);
    }
  }
  return null;
}

/**
 * Converts safe inline markdown (code, bold, italic) to HTML and sanitizes it with DOMPurify.
 * Strips all script tags, img/iframe tags, event handlers, and malicious vectors.
 */
export function sanitize(dirty: string): string {
  if (!dirty) return "";

  // 1. Parse inline code: `code`
  let formatted = dirty.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-surface-hover text-primary font-mono text-[0.88em] border border-border/60">$1</code>'
  );

  // 2. Parse bold: **text**
  formatted = formatted.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-text">$1</strong>'
  );

  // 3. Parse italic: *text*
  formatted = formatted.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    '<em class="italic text-text-secondary">$1</em>'
  );

  // 4. Sanitize with DOMPurify
  const purifier = getPurifier();
  if (purifier && typeof purifier.sanitize === "function") {
    return purifier.sanitize(formatted, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "em",
        "strong",
        "code",
        "br",
        "sub",
        "sup",
        "u",
        "span",
      ],
      ALLOWED_ATTR: ["class"],
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "img"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
    });
  }

  // Fallback if no DOM/purifier available: escape tags
  return formatted
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
