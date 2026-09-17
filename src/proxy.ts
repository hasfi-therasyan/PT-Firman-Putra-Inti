import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow public routes
  // (currently only / and /masuk are handled below)

  // Protect everything under (app)
  const isProtectedRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pangkalan") ||
    pathname.startsWith("/jadwal") ||
    pathname.startsWith("/invoice") ||
    pathname.startsWith("/pembayaran") ||
    pathname.startsWith("/rekonsiliasi") ||
    pathname.startsWith("/pengaturan");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    return NextResponse.redirect(url);
  }

  // If signed in but on public page, redirect to dashboard
  if (user && (pathname === "/" || pathname === "/masuk")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Owner-only enforcement: if signed in, verify email matches OWNER_EMAIL
  if (user && isProtectedRoute) {
    const ownerEmail = process.env.OWNER_EMAIL;
    if (ownerEmail && user.email !== ownerEmail) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/masuk";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (static files)
     * - favicon.ico (browser icon)
     * - public files (icons, images)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
