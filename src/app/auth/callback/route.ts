import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/beranda";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ambil profile untuk menentukan pengalihan berdasarkan role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Cek domain email jika diperlukan
        const email = user.email || "";
        const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "")
          .split(",")
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean);

        const emailDomain = email.split("@")[1]?.toLowerCase();
        if (
          allowedDomains.length > 0 &&
          emailDomain &&
          !allowedDomains.includes(emailDomain)
        ) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=domain_not_allowed`
          );
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role;
        switch (role) {
          case "dosen":
            return NextResponse.redirect(`${origin}/dosen`);
          case "kaprodi":
            return NextResponse.redirect(`${origin}/kaprodi`);
          case "baak":
            return NextResponse.redirect(`${origin}/baak`);
          case "mahasiswa":
          default:
            return NextResponse.redirect(`${origin}/beranda`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

