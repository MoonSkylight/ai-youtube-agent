import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ArchiveButton } from "@/components/archive-button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(); const { id } = await params;
  const { data: listing } = await supabaseAdmin.from("listings").select("id, marketplace, title, description, keywords, price, status, created_at").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!listing) notFound();
  return <DashboardShell><div className="space-y-6"><div><Link href="/ecommerce" className="text-sm underline">Back to ecommerce</Link><h2 className="mt-2 text-3xl font-bold">{listing.title}</h2><p className="mt-1 text-sm text-neutral-500">{listing.marketplace} • {listing.status} • {listing.price ? `$${listing.price}` : "No price"}</p></div><div className="flex flex-wrap gap-2"><ArchiveButton endpoint={`/api/listings/${listing.id}/archive`} label="Archive listing" /><ConfirmDeleteButton endpoint={`/api/listings/${listing.id}/delete`} label="Delete listing" confirmText="Delete this listing permanently?" /></div><div className="rounded-2xl border p-5 shadow-sm"><h3 className="text-lg font-semibold">Description</h3><p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{listing.description || "No description yet."}</p></div></div></DashboardShell>;
}
