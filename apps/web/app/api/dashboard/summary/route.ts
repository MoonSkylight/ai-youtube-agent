import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/db/server";
export async function GET() {
  try {
    const [tasks, approvals, ideas, listings] = await Promise.all([
      supabaseAdmin.from("tasks").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("approvals").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("content_ideas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("listings").select("id", { count: "exact", head: true }),
    ]);
    return NextResponse.json({ openTasks: tasks.count ?? 0, pendingApprovals: approvals.count ?? 0, contentIdeas: ideas.count ?? 0, listings: listings.count ?? 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load summary" }, { status: 500 });
  }
}
