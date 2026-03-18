const TERMII_BASE = "https://v3.api.termii.com/api";

interface TermiiResponse {
  messageId: string;
  status: "SENT" | "FAILED";
}

export async function sendSMS(to: string, message: string): Promise<TermiiResponse> {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID;

  if (!apiKey || !senderId) {
    throw new Error("Missing TERMII_API_KEY or TERMII_SENDER_ID env vars");
  }

  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to,
      from: senderId,
      sms: message,
      type: "plain",
      channel: "generic",
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "ok") {
    return { messageId: data.message_id ?? "", status: "FAILED" };
  }

  return { messageId: data.message_id ?? "", status: "SENT" };
}

export async function sendWhatsApp(to: string, message: string): Promise<TermiiResponse> {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID;

  if (!apiKey || !senderId) {
    throw new Error("Missing TERMII_API_KEY or TERMII_SENDER_ID env vars");
  }

  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      to,
      from: senderId,
      sms: message,
      type: "plain",
      channel: "whatsapp",
    }),
  });

  const data = await res.json();

  if (!res.ok || data.code !== "ok") {
    return { messageId: data.message_id ?? "", status: "FAILED" };
  }

  return { messageId: data.message_id ?? "", status: "SENT" };
}
