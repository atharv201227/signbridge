import { describe, expect, it } from "vitest";
import { appendLetter, appendSpace, deleteLastCharacter, stableLetter } from "../lib/message-utils";

describe("SignBridge message helpers", () => {
  it("appends letters in order", () => {
    expect(appendLetter(appendLetter("H", "I"), "!" )).toBe("HI!");
  });

  it("adds only one trailing space", () => {
    expect(appendSpace("HELLO")).toBe("HELLO ");
    expect(appendSpace("HELLO ")).toBe("HELLO ");
  });

  it("deletes the last character", () => {
    expect(deleteLastCharacter("HELLO")).toBe("HELL");
    expect(deleteLastCharacter("")).toBe("");
  });

  it("keeps manual composition readable when spacing is tapped repeatedly", () => {
    expect(appendSpace(appendSpace("HELLO"))).toBe("HELLO ");
  });

  it("accepts confident new letters and ignores repeats or low confidence", () => {
    expect(stableLetter(null, "A", 0.91)).toBe("A");
    expect(stableLetter("A", "A", 0.99)).toBeNull();
    expect(stableLetter("A", "B", 0.6)).toBeNull();
  });
});
