const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

async function paystackFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack ${path} failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<T>;
}

interface InitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number; // in kobo
    currency: string;
    metadata: Record<string, unknown>;
  };
}

/**
 * Initialize a Paystack transaction.
 * @param email  Customer email
 * @param amount Amount in **kobo** (e.g. 100_00 = 100 NGN)
 * @param metadata Arbitrary metadata attached to the transaction
 */
export async function initializeTransaction(
  email: string,
  amount: number,
  metadata: object,
  callbackUrl?: string,
): Promise<{ authorization_url: string; reference: string }> {
  const res = await paystackFetch<InitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ email, amount, metadata, ...(callbackUrl ? { callback_url: callbackUrl } : {}) }),
  });

  return {
    authorization_url: res.data.authorization_url,
    reference: res.data.reference,
  };
}

/**
 * Verify a Paystack transaction by reference.
 * @param reference The transaction reference
 */
export async function verifyTransaction(
  reference: string,
): Promise<{ status: string; amount: number }> {
  const res = await paystackFetch<VerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );

  return {
    status: res.data.status,
    amount: res.data.amount,
  };
}
