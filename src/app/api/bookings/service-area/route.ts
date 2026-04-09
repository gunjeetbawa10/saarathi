import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPostcodeInServiceArea } from "@/lib/service-area";

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
        {
          ok: false as const,
          code: "INVALID_POSTCODE" as const,
          message: "Enter the postcode for the service location.",
        },
        { status: 400 }
      );
    }

    const result = await checkPostcodeInServiceArea(parsed.data.postcode);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        ok: false as const,
        code: "POSTCODE_NOT_FOUND" as const,
        message: "Could not verify postcode. Try again in a moment.",
      },
      { status: 500 }
    );
  }
}
