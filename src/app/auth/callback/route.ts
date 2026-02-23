import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

function redirect(request: NextRequest, pathname: string) {
  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return NextResponse.redirect(`${proto}://${host}${pathname}`);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, has_completed_placement")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email ?? "",
            name:
              (user.user_metadata?.full_name as string | undefined) ??
              (user.user_metadata?.name as string | undefined) ??
              "Developer",
            profile_image_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
            provider: (user.app_metadata?.provider as string | undefined) ?? "unknown",
            provider_id: (user.user_metadata?.provider_id as string | undefined) ?? user.id,
          });

          return redirect(request, "/quiz/placement");
        }

        return redirect(request, existingUser.has_completed_placement ? "/" : "/quiz/placement");
      }
    }
  }

  return redirect(request, "/login?error=auth_callback_failed");
}
