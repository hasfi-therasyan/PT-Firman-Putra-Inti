import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

/**
 * Generates the Gmail OAuth URL and redirects to Google.
 * GET /api/gmail/auth
 */
export async function GET() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scope = "https://www.googleapis.com/auth/gmail.readonly";

  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [scope],
  });

  return NextResponse.redirect(authUrl);
}
