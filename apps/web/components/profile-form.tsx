"use client";

import { useState } from "react";

type ProfileFormProps = {
  initialValues?: {
    display_name?: string | null;
    business_name?: string | null;
    niche?: string | null;
    timezone?: string | null;
    preferred_tone?: string | null;
    work_hours_per_day?: number | null;
  };
};

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        displayName: String(formData.get("displayName") || ""),
        businessName: String(formData.get("businessName") || ""),
        niche: String(formData.get("niche") || ""),
        timezone: String(formData.get("timezone") || "Australia/Melbourne"),
        preferredTone: String(formData.get("preferredTone") || ""),
        workHoursPerDay: Number(formData.get("workHoursPerDay") || 0),
      };
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      setMessage(result.ok ? "Profile updated." : result.error || "Failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border p-5 shadow-sm md:grid-cols-2">
      <input name="displayName" defaultValue={initialValues?.display_name ?? ""} required className="w-full rounded-xl border px-4 py-3" placeholder="Display name" />
      <input name="businessName" defaultValue={initialValues?.business_name ?? ""} className="w-full rounded-xl border px-4 py-3" placeholder="Business name" />
      <input name="niche" defaultValue={initialValues?.niche ?? ""} className="w-full rounded-xl border px-4 py-3" placeholder="Niche" />
      <input name="timezone" defaultValue={initialValues?.timezone ?? "Australia/Melbourne"} className="w-full rounded-xl border px-4 py-3" placeholder="Timezone" />
      <input name="preferredTone" defaultValue={initialValues?.preferred_tone ?? ""} className="w-full rounded-xl border px-4 py-3" placeholder="Preferred tone" />
      <input name="workHoursPerDay" type="number" step="0.5" defaultValue={initialValues?.work_hours_per_day ?? ""} className="w-full rounded-xl border px-4 py-3" placeholder="Work hours per day" />
      <div className="md:col-span-2 flex items-center gap-4"><button disabled={loading} className="rounded-xl border px-4 py-3 font-medium">{loading ? "Saving..." : "Save profile"}</button>{message ? <span className="text-sm text-neutral-500">{message}</span> : null}</div>
    </form>
  );
}
