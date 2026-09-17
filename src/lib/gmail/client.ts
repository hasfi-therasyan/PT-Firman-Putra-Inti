/**
 * Gmail API client — reads emails from the owner's mailbox.
 * Server-only. Uses OAuth2 refresh token.
 */

import { google } from "googleapis";

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  snippet: string;
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function getGmailClient() {
  const oauth2 = getOAuth2Client();
  oauth2.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return google.gmail({ version: "v1", auth: oauth2 });
}

/**
 * Fetch message list matching a query since a given historyId or date.
 */
export async function listMessages(
  query: string,
  maxResults: number = 100
): Promise<{ id: string; threadId: string }[]> {
  const gmail = getGmailClient();
  const res = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });
  return (res.data.messages ?? []).map((m) => ({
    id: m.id!,
    threadId: m.threadId!,
  }));
}

/**
 * Fetch a full message by ID and decode the body.
 */
export async function getMessage(messageId: string): Promise<GmailMessage> {
  const gmail = getGmailClient();
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const msg = res.data;
  const headers = msg.payload?.headers ?? [];
  const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
  const from = headers.find((h) => h.name === "From")?.value ?? "";
  const date = headers.find((h) => h.name === "Date")?.value ?? "";

  const body = extractBody(msg.payload);

  return {
    id: msg.id!,
    threadId: msg.threadId!,
    subject,
    from,
    date,
    body,
    snippet: msg.snippet ?? "",
  };
}

/**
 * Recursively extract text/plain body from Gmail payload.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
function extractBody(payload: any): string {
  if (!payload) return "";

  // Direct body
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }

  // Recurse into parts
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
      const nested = extractBody(part);
      if (nested) return nested;
    }
    // Fallback to text/html
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
    }
  }

  return "";
}

/**
 * Get the history ID for delta sync.
 */
export async function getHistoryId(): Promise<string> {
  const gmail = getGmailClient();
  const res = await gmail.users.getProfile({ userId: "me" });
  return String(res.data.historyId ?? "");
}
