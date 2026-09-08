const wholeNumberPattern = /^\d+$/;
const rupeePattern = /^\d+(?:\.\d{1,2})?$/;

export class ExactNumberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExactNumberError";
  }
}

export function parseWholeNumber(value: string, fieldName: string): bigint {
  const normalized = value.trim();

  if (!wholeNumberPattern.test(normalized)) {
    throw new ExactNumberError(`${fieldName} must be a whole number.`);
  }

  return BigInt(normalized);
}

export function rupeesToPaise(value: string, fieldName: string): bigint {
  const normalized = value.trim();

  if (!rupeePattern.test(normalized)) {
    throw new ExactNumberError(
      `${fieldName} must be a valid rupee amount with at most two decimal places.`,
    );
  }

  const [rupees = "0", paise = ""] = normalized.split(".");
  return BigInt(rupees) * 100n + BigInt(paise.padEnd(2, "0") || "0");
}

export function paiseToDecimalString(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absoluteValue = value < 0n ? -value : value;
  const rupees = absoluteValue / 100n;
  const paise = (absoluteValue % 100n).toString().padStart(2, "0");

  return `${sign}${rupees}.${paise}`;
}
