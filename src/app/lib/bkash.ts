import config from "../config";
import AppError from "../errors/AppError";

export const getBkashIdToken = async () => {
  const response = await fetch(`${config.bkash.base_url}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: config.bkash.username as any,
      password: config.bkash.password as any,
    },
    body: JSON.stringify({
      app_key: config.bkash.app_key,
      app_secret: config.bkash.app_secret,
    }),
  });

  const result = await response.json();
  if (result.statusCode !== "0000") {
    throw new AppError(500, `bKash auth failed: ${result.statusMessage}`);
  }
  return result.id_token;
};

export const createBkashPayment = async (invoiceId: string, amount: number) => {
  const idToken = await getBkashIdToken();

  const response = await fetch(`${config.bkash.base_url}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: idToken,
      "X-APP-Key": config.bkash.app_key as any,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: " ",
      callbackURL: `http://localhost:${config.port}/api/v1/payments/callback`, // Make sure this endpoint handles the callback
      amount: amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: invoiceId,
    }),
  });

  const result = await response.json();
  if (result.statusCode !== "0000") {
    throw new AppError(500, `bKash create payment failed: ${result.statusMessage}`);
  }
  return result;
};

export const executeBkashPayment = async (paymentID: string) => {
  const idToken = await getBkashIdToken();

  const response = await fetch(`${config.bkash.base_url}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: idToken,
      "X-APP-Key": config.bkash.app_key as any,
    },
    body: JSON.stringify({
      paymentID,
    }),
  });

  const result = await response.json();
  return result;
};
