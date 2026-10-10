import "server-only";
import nodemailer from "nodemailer";
import type { ContactInput } from "./contact";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export type MailResult = { ok: true } | { ok: false; error: string };

/** Sends a contact message to the site owner. CONTACT_TRANSPORT=log prints instead of sending. */
export async function sendContactMail({ name, email, message }: ContactInput): Promise<MailResult> {
  if (process.env.CONTACT_TRANSPORT === "log") {
    console.log(`[contact] from ${oneLine(name)} <${oneLine(email)}>: ${message}`);
    return { ok: true };
  }
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return { ok: false, error: "mail_not_configured" };
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass }, connectionTimeout: 10_000, socketTimeout: 15_000 });
    await transporter.sendMail({
      from: user,
      to: user,
      replyTo: oneLine(email),
      subject: `Portfolio contact: ${oneLine(name)}`,
      text: `From: ${oneLine(name)} <${oneLine(email)}>\n\n${message}`,
      html: `<p><b>From:</b> ${escapeHtml(oneLine(name))} &lt;${escapeHtml(oneLine(email))}&gt;</p><div style="white-space:pre-wrap;border-left:3px solid #999;padding-left:12px">${escapeHtml(message)}</div>`,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String((error as Error)?.message ?? error).slice(0, 300) };
  }
}
