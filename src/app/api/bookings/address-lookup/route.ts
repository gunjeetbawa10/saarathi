import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupUkAddressSuggestions } from "@/lib/uk-address";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  postcode: z.string().min(1, "Enter a postcode"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a postcode first.", suggestions: [] },
        { status: 400 }
      );
    }

    const result = await lookupUkAddressSuggestions(parsed.data.postcode);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INVALID_POSTCODE") {
      return NextResponse.json(
        { error: "Enter a valid UK postcode.", suggestions: [] },
        { status: 400 }
      );
    }
    console.error("[api/bookings/address-lookup]", e);
    return NextResponse.json(
      {
        error: "Could not fetch address suggestions right now.",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}
