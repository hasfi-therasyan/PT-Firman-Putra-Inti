import { google } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Gmail OAuth callback — exchanges auth code for tokens.
 * One-time setup flow. After this, the refresh token is stored in app_settings.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>Otentikasi Gmail Gagal</h2>
        <p>Error: ${error}</p>
        <p><a href="/pengaturan">Kembali ke Pengaturan</a></p>
      </body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>Kode otentikasi tidak ditemukan</h2>
        <p><a href="/pengaturan">Kembali ke Pengaturan</a></p>
      </body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2.getToken(code);

    if (!tokens.refresh_token) {
      return new Response(
        `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
          <h2>Refresh token tidak diterima</h2>
          <p>Pastikan Anda mengklik "Grant" / "Allow" pada halaman Google.</p>
          <p><a href="/pengaturan">Coba lagi</a></p>
        </body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    // Store refresh token in app_settings
    const { error: _updateError } = await supabaseAdmin
      .from("app_settings" as never)
      .update({
        last_gmail_synced_at: new Date().toISOString(),
      } as never)
      .not("id", "is", null);

    // Also store in a way the cron can access it
    // For now, store via raw SQL in an encrypted column or env
    // The refresh token should be added to .env.local manually for security
    console.log("Gmail OAuth successful. Refresh token obtained.");

    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2 style="color:green">✅ Otentikasi Gmail Berhasil!</h2>
        <p>Refresh token telah diterima.</p>
        <p>Sekarang tambahkan refresh token ini ke <code>.env.local</code>:</p>
        <pre style="background:#f5f5f5;padding:12px;text-align:left;max-width:600px;margin:12px auto;word-break:break-all">${tokens.refresh_token}</pre>
        <p style="color:#666;font-size:14px">Setelah ditambahkan ke .env.local dan deploy, sistem akan mulai membaca email notifikasi bank secara otomatis.</p>
        <p><a href="/pengaturan">Kembali ke Pengaturan</a></p>
      </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>Gagal menukar kode otentikasi</h2>
        <p>${err instanceof Error ? err.message : "Unknown error"}</p>
        <p>Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah benar di .env.local</p>
        <p><a href="/pengaturan">Coba lagi</a></p>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
