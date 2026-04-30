import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default async function ContentPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("scripts")
    .select("id, title")
    .order("created_at", { ascending: false });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1020",
        color: "#fff",
        padding: 40,
      }}
    >
      <h1>Content Dashboard</h1>

      <div style={{ marginTop: 20 }}>
        {data?.map((item) => (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <Link href={`/content/${item.id}`}>
              <button>{item.title || "Untitled Script"}</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}