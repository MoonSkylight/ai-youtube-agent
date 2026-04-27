"use client";

import { useState } from "react";

export function ListingForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        marketplace: formData.get("marketplace"),
        productTitle: formData.get("productTitle"),
        brand: formData.get("brand"),
        category: formData.get("category"),
        sellPrice: formData.get("sellPrice") ? Number(formData.get("sellPrice")) : undefined,
        notes: formData.get("notes"),
      };
      const response = await fetch("/api/listings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setMessage(result.ok ? "Listing draft created." : result.error || "Failed.");
      if (result.ok) window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border p-5 shadow-sm md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium">Marketplace</label>
        <select name="marketplace" className="w-full rounded-xl border px-4 py-3" defaultValue="ebay">
          <option value="ebay">eBay</option>
          <option value="amazon">Amazon</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Product title</label>
        <input name="productTitle" required className="w-full rounded-xl border px-4 py-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Brand</label>
        <input name="brand" className="w-full rounded-xl border px-4 py-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <input name="category" className="w-full rounded-xl border px-4 py-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sell price</label>
        <input name="sellPrice" type="number" step="0.01" className="w-full rounded-xl border px-4 py-3" />
      </div>
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea name="notes" rows={4} className="w-full rounded-xl border px-4 py-3" />
      </div>
      <div className="md:col-span-2 flex items-center gap-4">
        <button disabled={loading} className="rounded-xl border px-4 py-3 font-medium">
          {loading ? "Generating..." : "Create listing draft"}
        </button>
        {message ? <p className="text-sm text-neutral-500">{message}</p> : null}
      </div>
    </form>
  );
}
