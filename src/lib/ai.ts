import OpenAI from "openai";

import {
  BidOpportunity,
  MatchResult,
  PriceIntelligence,
  ReadinessResult,
  SellerProfile,
} from "@/lib/schemas";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const MAX_TOKENS = 150;
const TEMPERATURE = 0.3;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function complete(system: string, user: string, fallback: string): Promise<string> {
  const client = getClient();
  if (!client) return fallback;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

export function fallbackExplainMatch(
  match: MatchResult,
  seller: SellerProfile,
  bid: BidOpportunity
): string {
  const topDimension = Object.entries(match.dimensions).sort(
    ([, a], [, b]) => b - a
  )[0];

  const dimensionLabel =
    topDimension?.[0] === "product"
      ? "product fit"
      : topDimension?.[0] === "location"
        ? "location proximity"
        : topDimension?.[0] === "capacity"
          ? "capacity"
          : topDimension?.[0] === "eligibility"
            ? "eligibility"
            : "certifications";

  const pursueText = match.pursue
    ? "This tender is worth pursuing."
    : "This tender may not be ideal right now.";

  return `${seller.businessName} scores ${match.matchScore}% on "${bid.title}". Strongest factor: ${dimensionLabel} (${topDimension?.[1] ?? 0}%). ${pursueText}${match.blockers.length > 0 ? ` ${match.blockers.length} blocker(s) to resolve.` : ""}`;
}

export function fallbackExplainReadiness(readiness: ReadinessResult): string {
  const failed = readiness.checks.filter((check) => check.status === "fail").length;
  const warned = readiness.checks.filter((check) => check.status === "warn").length;

  if (readiness.readinessScore >= 80) {
    return `Readiness is ${readiness.readinessScore}% — you are largely prepared to bid. Review remaining warnings before submission.`;
  }

  if (failed > 0) {
    return `Readiness is ${readiness.readinessScore}%. ${failed} check(s) failed and must be fixed before bidding.${warned > 0 ? ` ${warned} item(s) also need attention.` : ""}`;
  }

  return `Readiness is ${readiness.readinessScore}%. ${warned} item(s) need attention, but no critical failures remain.`;
}

export function fallbackExplainPricing(pricing: PriceIntelligence): string {
  return pricing.guidance;
}

export async function explainMatch(
  matchResult: MatchResult,
  seller: SellerProfile,
  bid: BidOpportunity
): Promise<string> {
  const fallback = fallbackExplainMatch(matchResult, seller, bid);

  return complete(
    "You are Sahayak, a GeM seller assistant. Not government. Use only provided facts. Do not invent scores. Explain in simple Hindi-English mix, max 120 words.",
    JSON.stringify({
      matchResult,
      seller: {
        businessName: seller.businessName,
        city: seller.city,
        state: seller.state,
        products: seller.products,
      },
      bid: {
        id: bid.id,
        title: bid.title,
        department: bid.department,
        location: bid.location,
      },
    }),
    fallback
  );
}

export async function explainReadiness(
  readinessResult: ReadinessResult
): Promise<string> {
  const fallback = fallbackExplainReadiness(readinessResult);

  return complete(
    "You are Sahayak, a GeM seller assistant. Not government. Use only provided facts. Do not change scores. Give actionable fix steps in simple language, max 120 words.",
    JSON.stringify({ readinessResult }),
    fallback
  );
}

export async function explainPricing(priceIntel: PriceIntelligence): Promise<string> {
  const fallback = fallbackExplainPricing(priceIntel);

  return complete(
    "You are Sahayak, a GeM seller assistant. Not government. Use only provided prices. Do not invent numbers. Explain pricing guidance for a small MSME seller in simple language, max 120 words.",
    JSON.stringify({ priceIntel }),
    fallback
  );
}
