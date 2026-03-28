import { describe, it, expect } from "vitest";
import { extractUrlFromInput } from "@/lib/urlUtils";

describe("extractUrlFromInput", () => {
  it("returns trimmed URL when valid", () => {
    expect(extractUrlFromInput("  https://example.com/path  ")).toBe(
      "https://example.com/path"
    );
  });

  it("extracts first http URL from surrounding text", () => {
    expect(
      extractUrlFromInput('see this link https://evil.test/login?q=1 ok')
    ).toBe("https://evil.test/login?q=1");
  });

  it("returns null when no URL", () => {
    expect(extractUrlFromInput("no url here")).toBeNull();
  });
});
