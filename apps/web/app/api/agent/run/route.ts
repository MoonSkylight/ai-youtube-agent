import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runMasterAgent } from "@/lib/agents/master-agent";
import { runEcommerceAgent } from "@/lib/agents/ecommerce-agent";
import { runContentAgent } from "@/lib/agents/content-agent";
import { runRoutineAgent } from "@/lib/agents/routine-agent";

const bodySchema = z.object({
  agent: z.enum(["master", "ecommerce", "content", "routine"]),
  intent: z.string(),
  context: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    let result;
    switch (body.agent) {
      case "master": result = await runMasterAgent({ intent: body.intent, ...body.context }); break;
      case "ecommerce": result = await runEcommerceAgent({ intent: body.intent, ...body.context }); break;
      case "content": result = await runContentAgent({ intent: body.intent, ...body.context }); break;
      case "routine": result = await runRoutineAgent({ intent: body.intent, ...body.context }); break;
    }
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Failed to run agent" }, { status: 500 });
  }
}
