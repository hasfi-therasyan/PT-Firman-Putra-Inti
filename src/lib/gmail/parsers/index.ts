/**
 * Parser registry — dispatches to the correct parser based on sender/subject.
 */

import * as mandiri from "./mandiri";

export type { ParsedPayment, ParseFailure } from "./mandiri";

const parsers: Array<{
  name: string;
  canHandle: (subject: string, from: string) => boolean;
  parse: (body: string) => mandiri.ParsedPayment | mandiri.ParseFailure;
}> = [
  {
    name: "mandiri-mcm",
    canHandle: mandiri.canHandle,
    parse: mandiri.parse,
  },
];

/**
 * Find a matching parser for the email.
 */
export function findParser(subject: string, from: string) {
  return parsers.find((p) => p.canHandle(subject, from)) ?? null;
}

/**
 * Parse using the first matching parser.
 */
export function parseEmail(
  subject: string,
  from: string,
  body: string
): { parser: string } & (mandiri.ParsedPayment | mandiri.ParseFailure) {
  const parser = findParser(subject, from);
  if (!parser) {
    return { parser: "none", error: `No parser matched for from="${from}" subject="${subject}"` };
  }
  const result = parser.parse(body);
  return { parser: parser.name, ...result };
}
