import { NextResponse } from "next/server";
import { z } from "zod";

import { explainMatch } from "@/lib/ai";
import {
  BidOpportunitySchema,
  MatchResultSchema,
  SellerProfileSchema,
} from "@/lib/schemas";

const RequestSchema = z.object({
  matchResult: MatchResultSchema,
  seller: SellerProfileSchema,
  bid: BidOpportunitySchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchResult, seller, bid } = RequestSchema.parse(body);
    const explanation = await explainMatch(matchResult, seller, bid);

    return NextResponse.json({ explanation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to generate explanation." },
      { status: 500 }
    );
  }
}
