import { DashboardShell } from "@/components/dashboard-shell";
import { IntegrationSettingsForm } from "@/components/integration-settings-form";
import { MarketplaceImportActions } from "@/components/marketplace-import-actions";
import { ProviderConnectionCard } from "@/components/provider-connection-card";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function IntegrationsPage() {
  const user = await requireUser();
  const [{ data: settings }, { data: oauthConnections }] = await Promise.all([
    supabaseAdmin.from("integration_settings").select("id, provider, is_enabled, mode, account_label, config").eq("user_id", user.id).order("provider", { ascending: true }),
    supabaseAdmin.from("oauth_connections").select("id, provider, external_account_id, account_label, scope, updated_at").eq("user_id", user.id).order("provider", { ascending: true }),
  ]);
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Integrations</h2><p className="text-neutral-500">Configure marketplace and publishing providers.</p></div><IntegrationSettingsForm initialSettings={(settings as any[]) ?? []} /><div className="rounded-2xl border p-5 shadow-sm"><h3 className="text-lg font-semibold">OAuth connections</h3><div className="mt-4 flex flex-wrap gap-2"><a href="/api/integrations/oauth/start/youtube" className="rounded-xl border px-3 py-2 text-sm">Connect YouTube</a><a href="/api/integrations/oauth/start/tiktok" className="rounded-xl border px-3 py-2 text-sm">Connect TikTok</a></div><div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">{(oauthConnections ?? []).length===0?<p className="text-sm text-neutral-500">No OAuth connections stored yet.</p>:oauthConnections?.map((conn:any)=><ProviderConnectionCard key={conn.id} provider={conn.provider} accountLabel={conn.account_label} externalAccountId={conn.external_account_id} scope={conn.scope} updatedAt={conn.updated_at} isConnected={true} />)}</div></div><div className="rounded-2xl border p-5 shadow-sm"><h3 className="text-lg font-semibold">Marketplace import tools</h3><p className="mt-1 text-sm text-neutral-500">Queue stub sync jobs for future Amazon/eBay imports.</p><div className="mt-4"><MarketplaceImportActions /></div></div></div></DashboardShell>;
}
