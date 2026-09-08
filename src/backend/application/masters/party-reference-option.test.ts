import { describe, expect, it } from "vitest";

import { toPartyReferenceOption } from "./party-reference-option";

describe("toPartyReferenceOption", () => {
  it("normalizes the many-to-one object returned by Supabase", () => {
    expect(
      toPartyReferenceOption({ id: 12, name: "Saurabh Gupta" }),
    ).toEqual({ id: "12", name: "Saurabh Gupta" });
  });

  it("also tolerates an array-shaped embedded relation", () => {
    expect(
      toPartyReferenceOption([{ id: 11, name: "Gajanan Traders" }]),
    ).toEqual({ id: "11", name: "Gajanan Traders" });
  });
});
