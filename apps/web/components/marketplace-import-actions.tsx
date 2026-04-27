"use client";
import { useState } from "react";
export function MarketplaceImportActions() {
  const [loading, setLoading] = useState(false); const [message, setMessage] = useState("");
  async function queueImport(provider: "amazon" | "ebay", entityType: "products" | "orders" | "listings") {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/sync/import-marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, entityType }) });
      const result = await response.json(); setMessage(result.ok ? `${provider} ${entityType} import queued.` : result.error || "Failed.");
    } finally { setLoading(false); }
  }
  return <div className="flex flex-wrap gap-2"><button disabled={loading} onClick={() => queueImport("amazon","products")} className="rounded-xl border px-3 py-2 text-sm">Import Amazon products</button><button disabled={loading} onClick={() => queueImport("amazon","orders")} className="rounded-xl border px-3 py-2 text-sm">Import Amazon orders</button><button disabled={loading} onClick={() => queueImport("ebay","listings")} className="rounded-xl border px-3 py-2 text-sm">Import eBay listings</button>{message ? <span className="text-xs text-neutral-500">{message}</span> : null}</div>;
}
