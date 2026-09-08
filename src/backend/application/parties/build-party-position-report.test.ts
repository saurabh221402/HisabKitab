import { describe, expect, it } from "vitest";

import { buildPartyPositionReport } from "./build-party-position-report";

const firms = [
  { id: "1", name: "Guru Dev Traders" },
  { id: "2", name: "Sai Traders" },
] as const;

const parties = [
  { id: "10", name: "Amit Transport" },
  { id: "11", name: "Gajanan Traders" },
  { id: "12", name: "Saurabh Gupta" },
] as const;

const partyRoles = [
  { partyId: "10", role: "transporter" },
  { partyId: "11", role: "buyer" },
  { partyId: "12", role: "seller" },
] as const;

describe("buildPartyPositionReport", () => {
  it("shows registered parties before they have financial activity", () => {
    const report = buildPartyPositionReport({
      filters: { firmId: null, role: null, search: null },
      firms,
      parties,
      partyRoles,
      positions: [],
    });

    expect(report.positions.map((position) => position.partyName)).toEqual([
      "Amit Transport",
      "Gajanan Traders",
      "Saurabh Gupta",
    ]);
    expect(report.positions[0]).toMatchObject({
      buyerOutstanding: "0.00",
      firmName: "—",
      lastActivityDate: null,
      sellerOutstanding: "0.00",
    });
    expect(report.totalBuyerOutstanding).toBe("0.00");
    expect(report.totalSellerAndCostOutstanding).toBe("0.00");
  });

  it("keeps search and role filters useful for parties with no activity", () => {
    const report = buildPartyPositionReport({
      filters: { firmId: "2", role: "seller", search: "sau" },
      firms,
      parties,
      partyRoles,
      positions: [],
    });

    expect(report.positions).toHaveLength(1);
    expect(report.positions[0]).toMatchObject({
      firmId: "2",
      firmName: "Sai Traders",
      partyName: "Saurabh Gupta",
      roles: ["seller"],
    });
  });

  it("does not duplicate a party that already has a balance position", () => {
    const report = buildPartyPositionReport({
      filters: { firmId: null, role: null, search: null },
      firms,
      parties,
      partyRoles,
      positions: [
        {
          brokerageOutstanding: "0.00",
          buyerOutstanding: "900.00",
          firmId: "2",
          lastActivityDate: "2026-09-08",
          partyId: "11",
          sellerOutstanding: "0.00",
          transportOutstanding: "0.00",
        },
      ],
    });

    expect(report.positions).toHaveLength(3);
    expect(
      report.positions.filter((position) => position.partyId === "11"),
    ).toHaveLength(1);
    expect(report.totalBuyerOutstanding).toBe("900.00");
  });
});
