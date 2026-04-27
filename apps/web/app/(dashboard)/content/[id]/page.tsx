import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import CreateVideoButton from "@/components/CreateVideoButton";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: script } = await supabase
    .from("scripts")
    .select("*")
    .eq("id", id)
    .single();

  if (!script) {
    notFound();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{script.title}</h1>

      <CreateVideoButton scriptId={script.id} />

      <h3 style={{ marginTop: 20 }}>Script Body</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{script.script_body}</pre>
    </div>
  );
}