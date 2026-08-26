export type AuctionRules = {
  minimumDecrement: number;
  autoExtension: string;
  h1Elimination: string;
  rules: string[];
};

export type UnitCosts = {
  material: number;
  labor: number;
  overhead: number;
  delivery: number;
  marginPercent: number;
};

export type FloorPriceResult = {
  minimum: number;
  comfortable: number;
  aggressive: number;
  unitCost: number;
};

export type CompetitorBid = {
  name: string;
  currentBid: number;
  pastBids: number[];
};

export type SimulationResult = {
  outcome: "winning" | "competitive" | "losing";
  margin: number;
  marginPercent: number;
  rank: number;
  isH1: boolean;
  autoExtensionTriggered: boolean;
  winnersCurseWarning: boolean;
  totalValue: number;
  message: string;
};

const AUTO_EXTENSION_MINUTES = 15;

export function explainRules(estimatedValue = 2_100_000): AuctionRules {
  let minimumDecrement: number;
  if (estimatedValue <= 500_000) {
    minimumDecrement = 500;
  } else if (estimatedValue <= 2_000_000) {
    minimumDecrement = 1_000;
  } else if (estimatedValue <= 10_000_000) {
    minimumDecrement = 2_500;
  } else {
    minimumDecrement = 5_000;
  }

  return {
    minimumDecrement,
    autoExtension: `${AUTO_EXTENSION_MINUTES} minutes added if a new bid is placed in the last ${AUTO_EXTENSION_MINUTES} minutes`,
    h1Elimination: "Lowest bidder (H1) can be outbid — you are not locked in until auction closes",
    rules: [
      `Minimum decrement per round: ₹${minimumDecrement.toLocaleString("en-IN")} (based on estimated bid value)`,
      `Auto-extension: auction extends by ${AUTO_EXTENSION_MINUTES} minutes when a bid arrives in the final ${AUTO_EXTENSION_MINUTES} minutes`,
      "H1 elimination: the current lowest bidder can be displaced by a lower offer",
      "No withdrawal — once submitted, a bid cannot be retracted",
      "Prices only go down — each round must beat the current lowest price",
      "Winner is the lowest valid bid when the timer expires",
    ],
  };
}

export function calculateFloorPrice(costs: UnitCosts): FloorPriceResult {
  const unitCost = costs.material + costs.labor + costs.overhead + costs.delivery;
  const marginMultiplier = 1 + costs.marginPercent / 100;

  const minimum = Math.round(unitCost * 1.02);
  const aggressive = Math.round(unitCost * 1.05);
  const comfortable = Math.round(unitCost * marginMultiplier);

  return {
    minimum,
    comfortable: Math.max(comfortable, aggressive),
    aggressive: Math.max(aggressive, minimum),
    unitCost,
  };
}

export function simulateAuction(
  myBidPerUnit: number,
  competitors: CompetitorBid[],
  floorPricePerUnit: number,
  quantity = 500
): SimulationResult {
  const allBids = [
    { name: "You", bid: myBidPerUnit },
    ...competitors.map((c) => ({ name: c.name, bid: c.currentBid })),
  ].sort((a, b) => a.bid - b.bid);

  const rank = allBids.findIndex((entry) => entry.name === "You") + 1;
  const isH1 = rank === 1;
  const lowestBid = allBids[0].bid;
  const secondLowest = allBids[1]?.bid ?? myBidPerUnit;

  const marginPerUnit = myBidPerUnit - floorPricePerUnit;
  const marginPercent = myBidPerUnit > 0 ? (marginPerUnit / myBidPerUnit) * 100 : 0;
  const totalValue = myBidPerUnit * quantity;

  const winnersCurseWarning = myBidPerUnit < floorPricePerUnit;
  const autoExtensionTriggered =
    isH1 && secondLowest - myBidPerUnit <= explainRules(quantity * myBidPerUnit).minimumDecrement;

  let outcome: SimulationResult["outcome"];
  if (isH1) {
    outcome = "winning";
  } else if (myBidPerUnit <= secondLowest * 1.03) {
    outcome = "competitive";
  } else {
    outcome = "losing";
  }

  let message: string;
  if (winnersCurseWarning) {
    message = "Winner's curse — your bid is below floor price. You would win but lose money on every unit.";
  } else if (isH1) {
    message = `You are H1 (lowest bidder) at ₹${myBidPerUnit.toLocaleString("en-IN")}/unit. Watch for auto-extension if competitors bid in the final minutes.`;
  } else if (outcome === "competitive") {
    message = `Rank ${rank} — within striking distance. A decrement of ₹${(myBidPerUnit - lowestBid + explainRules(totalValue).minimumDecrement).toLocaleString("en-IN")} could put you in H1.`;
  } else {
    message = `Rank ${rank} — bid is too high to win. Consider lowering toward ₹${(lowestBid + explainRules(totalValue).minimumDecrement).toLocaleString("en-IN")}/unit.`;
  }

  return {
    outcome,
    margin: Math.round(marginPerUnit * quantity),
    marginPercent: Math.round(marginPercent * 10) / 10,
    rank,
    isH1,
    autoExtensionTriggered,
    winnersCurseWarning,
    totalValue,
    message,
  };
}

export function getCommonMistakes(): string[] {
  return [
    "Bidding below your floor price — you win the order but lose money on every unit",
    "Not understanding auto-extension — last-minute bids extend the auction by 15 minutes",
    "Panicking and bidding too low under time pressure",
    "Forgetting to factor in GST — your bid must cover 18% GST on top of costs",
    "Ignoring delivery and packaging costs in per-unit pricing",
    "Not having DSC ready — can't submit or revise bids during live auction",
  ];
}

export const SAMPLE_AUCTION = {
  title: "500 office chairs",
  estimatedValue: 2_100_000,
  quantity: 500,
  estimatedUnitPrice: 4_200,
  competitors: [
    {
      name: "FurniCorp Ltd",
      currentBid: 3_950,
      pastBids: [4_100, 4_000, 3_950],
    },
    {
      name: "SeatWorks MSE",
      currentBid: 4_050,
      pastBids: [4_200, 4_100, 4_050],
    },
    {
      name: "ChairCraft Industries",
      currentBid: 4_120,
      pastBids: [4_300, 4_200, 4_120],
    },
  ] satisfies CompetitorBid[],
};
