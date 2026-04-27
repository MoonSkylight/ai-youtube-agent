"use client";
import { useState } from "react";

type IntegrationRecord = { provider: string; is_enabled: boolean; mode?: string | null; account_label?: string | null; };
const providers = ["amazon","ebay","youtube","tiktok"];
export function IntegrationSettingsForm({ initialSettings }: { initialSettings: IntegrationRecord[] }) {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  const settingsMap = new Map(initialSettings.map((item) => [item.provider, item]));
  async function handleSubmit(formData: FormData) {
    setLoading(true); setMessage("");
    try {
      const payload = providers.map((provider) => ({ provider, isEnabled: formData.get(`${provider}_enabled`) === "on", mode: String(formData.get(`${provider}_mode`) || "manual"), accountLabel: String(formData.get(`${provider}_label`) || "") }));
      const response = await fetch("/api/integrations/save-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: payload }) });
      const result = await response.json(); setMessage(result.ok ? "Integration settings saved." : result.error || "Failed."); if (result.ok) window.location.reload();
    } finally { setLoading(false); }
  }
  return <form action={handleSubmit} className="space-y-4">{providers.map((provider) => { const current = settingsMap.get(provider); return <div key={provider} className="rounded-2xl border p-5 shadow-sm"><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name={`${provider}_enabled`} defaultChecked={current?.is_enabled ?? false} />Enable {provider}</label><div><label className="mb-1 block text-sm font-medium">Mode</label><select name={`${provider}_mode`} defaultValue={current?.mode ?? "manual"} className="w-full rounded-xl border px-4 py-3"><option value="manual">Manual</option><option value="approval_required">Approval required</option><option value="semi_auto">Semi auto</option></select></div><div><label className="mb-1 block text-sm font-medium">Account label</label><input name={`${provider}_label`} defaultValue={current?.account_label ?? ""} className="w-full rounded-xl border px-4 py-3" /></div></div></div>; })}<div className="flex items-center gap-4"><button disabled={loading} className="rounded-xl border px-4 py-3 font-medium">{loading ? "Saving..." : "Save integration settings"}</button>{message ? <span className="text-sm text-neutral-500">{message}</span> : null}</div></form>;
}
