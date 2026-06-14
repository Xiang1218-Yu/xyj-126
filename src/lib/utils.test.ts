import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
  });

  it("should handle object style classes", () => {
    expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
  });

  it("should handle arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should merge tailwind classes properly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn(null)).toBe("");
    expect(cn(undefined)).toBe("");
  });

  it("should handle mixed inputs", () => {
    expect(cn("foo", ["bar", { baz: true, qux: false }], "quux")).toBe("foo bar baz quux");
  });
});
