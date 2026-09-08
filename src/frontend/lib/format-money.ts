export function formatIndianCurrencyFromPaise(value: bigint): string {
  const sign = value < 0n ? "−" : "";
  const absoluteValue = value < 0n ? -value : value;
  const wholeRupees = absoluteValue / 100n;
  const paise = absoluteValue % 100n;
  const digits = wholeRupees.toString();
  const lastThree = digits.slice(-3);
  const leadingDigits = digits.slice(0, -3);
  const groupedLeadingDigits = leadingDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const groupedRupees = leadingDigits
    ? `${groupedLeadingDigits},${lastThree}`
    : lastThree;
  const paiseSuffix = paise === 0n ? "" : `.${paise.toString().padStart(2, "0")}`;

  return `${sign}₹${groupedRupees}${paiseSuffix}`;
}

export function formatIndianCurrency(value: string): string {
  const normalized = value.trim();
  const isNegative = normalized.startsWith("-");
  const unsignedValue = isNegative ? normalized.slice(1) : normalized;
  const [rupees = "0", paise = ""] = unsignedValue.split(".");
  const unsignedPaiseValue =
    BigInt(rupees) * 100n + BigInt(paise.padEnd(2, "0") || "0");
  const paiseValue = isNegative ? -unsignedPaiseValue : unsignedPaiseValue;
  return formatIndianCurrencyFromPaise(paiseValue);
}
