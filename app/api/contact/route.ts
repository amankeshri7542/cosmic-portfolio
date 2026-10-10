import { connection } from "next/server";
import { checkContactToken, clientIp, GLOBAL_MAIL_PER_HOUR, hashIp, issueContactToken, RATE_LIMIT, SPAM_THRESHOLD, spamScore, validateContact } from "@/lib/contact";
import { hasDatabase, sql } from "@/lib/db";
import { ApiError, handle, json, readJson } from "@/lib/editor/http";
import { sendContactMail } from "@/lib/mail";

/** Issues the signed minimum-time token the form echoes back as `t`. */
export const GET = handle(async () => {
  await connection();
  return json({ t: issueContactToken() });
});

export const POST = handle(async (request: Request) => {
  const body = await readJson(request, 20_000);
  const bot = json({ ok: true });

  if (typeof body.company === "string" ? body.company.trim() !== "" : body.company != null) return bot;
  const state = checkContactToken(typeof body.t === "string" ? body.t : "");
  if (state === "invalid" || state === "too_fast") return bot;
  if (state === "expired") throw new ApiError(400, "token_expired", "This form has expired. Reload the page and try again.");

  const parsed = validateContact(body);
  if (!parsed.ok) throw new ApiError(422, "invalid", "Check the highlighted fields.", { fields: parsed.fields });
  const { name, email, message } = parsed.value;

  const ip = hashIp(clientIp(request));
  const spam = spamScore(`${name} ${message}`) >= SPAM_THRESHOLD;
  let id: number | null = null;
  if (hasDatabase()) {
    try {
      const [{ n }] = await sql()<{ n: number }[]>`
        SELECT count(*)::int AS n FROM portfolio_contact_messages WHERE ip_hash = ${ip} AND created_at > now() - make_interval(secs => ${RATE_LIMIT.windowSeconds})`;
      if (n >= RATE_LIMIT.max) {
        throw new ApiError(429, "rate_limited", "Too many messages. Please try again later.", {}, { "Retry-After": String(RATE_LIMIT.windowSeconds) });
      }
      const [row] = await sql()<{ id: number }[]>`
        INSERT INTO portfolio_contact_messages (name, email, message, ip_hash, status) VALUES (${name}, ${email}, ${message}, ${ip}, ${spam ? "spam" : "queued"}) RETURNING id`;
      id = row.id;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("[contact] database unavailable, sending without a record", error);
    }
  }
  if (spam) return bot;

  // Under a flood from many addresses, keep accepting (and storing) messages but stop sending email.
  if (id !== null) {
    const [{ n }] = await sql()<{ n: number }[]>`
      SELECT count(*)::int AS n FROM portfolio_contact_messages WHERE status = 'sent' AND created_at > now() - interval '1 hour'`.catch(() => [{ n: 0 }]);
    if (n >= GLOBAL_MAIL_PER_HOUR) {
      await sql()`UPDATE portfolio_contact_messages SET error = 'held: hourly email cap' WHERE id = ${id}`.catch(() => {});
      return json({ ok: true });
    }
  }

  const result = await sendContactMail(parsed.value);
  if (id !== null) {
    await sql()`UPDATE portfolio_contact_messages SET status = ${result.ok ? "sent" : "failed"}, error = ${result.ok ? null : result.error} WHERE id = ${id}`.catch(() => {});
  }
  if (!result.ok) console.error("[contact] mail failed:", result.error);
  // A stored message is not lost, so only report failure when there is no record of it.
  if (!result.ok && id === null) throw new ApiError(502, "send_failed", "Your message could not be sent. Please try again later.");
  return json({ ok: true });
});
