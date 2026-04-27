export type AgentName = "master"|"ecommerce"|"content"|"publishing"|"routine"|"app_builder";
export type ApprovalStatus = "pending"|"approved"|"rejected";
export type EntityStatus = "draft"|"pending_approval"|"approved"|"queued"|"posted"|"failed"|"archived";
export interface AgentTask { title: string; category: "ecommerce"|"content"|"app"|"routine"|"admin"; priority: "low"|"medium"|"high"|"critical"; }
export interface AgentApproval { actionType: string; payload: Record<string, unknown>; }
export interface AgentResult { summary: string; topPriorities?: string[]; tasks?: AgentTask[]; approvals?: AgentApproval[]; entitiesToUpsert?: Record<string, unknown[]>; }
export interface AnalyticsSummary { openTasks:number; pendingApprovals:number; listingsDrafts:number; scriptsDrafts:number; queuedPublishJobs:number; postedPublishJobs:number; appProjects:number; }
