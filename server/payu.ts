import crypto from "crypto";

export interface PayUConfig {
  merchantKey: string;
  merchantSalt: string;
  mode: "TEST" | "LIVE";
}

export interface PaymentData {
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

export interface PayUFormData extends PaymentData {
  key: string;
  hash: string;
  service_provider: string;
}

export class PayUService {
  private config: PayUConfig;
  private paymentUrl: string;

  constructor(config: PayUConfig) {
    this.config = config;
    this.paymentUrl = config.mode === "TEST" 
      ? "https://test.payu.in/_payment"
      : "https://secure.payu.in/_payment";
  }

  generateTransactionId(): string {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  generateHash(data: PaymentData): string {
    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = "",
    } = data;

    const hashString = `${this.config.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${this.config.merchantSalt}`;

    return crypto.createHash("sha512").update(hashString).digest("hex");
  }

  verifyHash(
    txnid: string,
    amount: string,
    productinfo: string,
    firstname: string,
    email: string,
    status: string,
    receivedHash: string,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = ""
  ): boolean {
    const hashString = `${this.config.merchantSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${this.config.merchantKey}`;

    const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    return calculatedHash === receivedHash;
  }

  preparePaymentForm(data: PaymentData): PayUFormData {
    const hash = this.generateHash(data);

    return {
      ...data,
      key: this.config.merchantKey,
      hash,
      service_provider: "payu_paisa",
    };
  }

  getPaymentUrl(): string {
    return this.paymentUrl;
  }
}

export function createPayUService(): PayUService {
  const merchantKey = process.env.PAYU_MERCHANT_KEY;
  const merchantSalt = process.env.PAYU_MERCHANT_SALT;
  const mode = (process.env.PAYU_MODE || "TEST") as "TEST" | "LIVE";

  if (!merchantKey || !merchantSalt) {
    throw new Error("PayU credentials not configured. Please set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT environment variables.");
  }

  console.log(`💳 PayU configured in ${mode} mode`);

  return new PayUService({
    merchantKey,
    merchantSalt,
    mode,
  });
}
