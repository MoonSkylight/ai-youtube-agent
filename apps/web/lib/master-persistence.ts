import { supabaseAdmin } from "@/lib/db/server";
import { AgentResult } from "@/lib/types";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export async function persistMasterAgentResult(
  userId: string,
  result: AgentResult
) {
  const existingTasksRes = await supabaseAdmin
    .from("tasks")
    .select("title, category, status")
    .eq("user_id", userId)
    .eq("source_agent", "master")
    .in("status", ["draft", "pending", "in_progress"]);

  const existingApprovalsRes = await supabaseAdmin
    .from("approvals")
    .select("action_type, payload, status")
    .eq("user_id", userId)
    .eq("requested_by_agent", "master")
    .eq("status", "pending");

  const existingTaskKeys = new Set(
    (existingTasksRes.data ?? []).map(
      (task: any) => `${normalizeText(task.title)}::${task.category}`
    )
  );

  const existingApprovalKeys = new Set(
    (existingApprovalsRes.data ?? []).map(
      (approval: any) =>
        `${approval.action_type}::${JSON.stringify(approval.payload ?? {})}`
    )
  );

  const tasks = (result.tasks ?? [])
    .filter(
      (task) =>
        !existingTaskKeys.has(`${normalizeText(task.title)}::${task.category}`)
    )
    .map((task) => ({
      user_id: userId,
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: "draft",
      source_agent: "master",
    }));

  const approvals = (result.approvals ?? [])
    .filter(
      (approval) =>
        !existingApprovalKeys.has(
          `${approval.actionType}::${JSON.stringify(approval.payload ?? {})}`
        )
    )
    .map((approval) => ({
      user_id: userId,
      action_type: approval.actionType,
      payload: approval.payload,
      status: "pending",
      requested_by_agent: "master",
    }));

  const inserts: any[] = [];

  if (tasks.length) {
    inserts.push(supabaseAdmin.from("tasks").insert(tasks));
  }

  if (approvals.length) {
    inserts.push(supabaseAdmin.from("approvals").insert(approvals));
  }

  await Promise.all(inserts);

  return {
    tasksCreated: tasks.length,
    approvalsCreated: approvals.length,
  };
}