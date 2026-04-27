import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { ListingForm } from "@/components/listing-form";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/server";

export default async function EcommercePage() {
  const user = await requireUser();
  const { data: listings } = await supabaseAdmin.from("listings").select("id, marketplace, title, status, price, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <DashboardShell><div className="space-y-8"><div><h2 className="text-3xl font-bold">Ecommerce</h2><p className="text-neutral-500">Create and manage Amazon and eBay listing drafts.</p></div><ListingForm /><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{(listings ?? []).length === 0 ? <div className="rounded-2xl border p-5 text-neutral-500">No listings yet.</div> : listings?.map((listing: any) => <Link key={listing.id} href={`/ecommerce/${listing.id}`} className="rounded-2xl border p-5 shadow-sm transition hover:shadow-md"><h3 className="text-lg font-semibold">{listing.title}</h3><p className="mt-1 text-sm text-neutral-500">{listing.marketplace} • {listing.status}</p><p className="mt-2 text-xs text-neutral-500">{listing.price ? `$${listing.price}` : "No price"} • Created: {listing.created_at}</p></Link>)}</div></div></DashboardShell>;
}
